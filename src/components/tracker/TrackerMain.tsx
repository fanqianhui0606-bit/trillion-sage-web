"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { TrackerSession, TrackerOrder, StepDefinition, StepState, AgreementRecord } from "@/lib/tracker-types";
import {
  PACKAGES,
  getStepsForPackage,
  canActivateStep,
  getPackagePrice,
  getDepositAmount,
  fillRoleLabel,
} from "@/lib/tracker-packages";
import {
  getAgreementById,
  agreementIdsForStep,
  getOrderAgreementRecord,
  isAgreementAgreed,
} from "@/lib/tracker-agreements";
import { getOrder, updateOrder, completeStep, terminateOrder } from "@/lib/fireorm";
import StepFormAIntake from "./StepFormA";
import StepFormConsent from "./StepFormConsent";
import StepFormB from "./StepFormB";
import StepFormPayment, { StepFormCComplete } from "./StepFormC";
import StepFormGifts from "./StepFormGifts";
import StepAgreementGate from "./StepAgreementGate";
import TrackerAgreementModal from "./TrackerAgreementModal";
import TrackerFlowNav from "./TrackerFlowNav";

export default function TrackerMain({
  session,
  orderNo,
  onLogout,
}: {
  session: TrackerSession;
  orderNo: string;
  onLogout: () => void;
}) {
  const [order, setOrder] = useState<TrackerOrder | null>(null);
  const [steps, setSteps] = useState<StepDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingStepId, setViewingStepId] = useState<string | null>(null);
  const [agreementModalId, setAgreementModalId] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      const data = await getOrder(orderNo);
      setOrder(data);
      if (data) {
        const pkgSteps = getStepsForPackage(data.packageId);
        setSteps(pkgSteps);
        setViewingStepId((prev) => {
          if (prev && pkgSteps.some((s) => s.id === prev)) return prev;
          const frontier =
            pkgSteps.find(
              (s) =>
                data.steps[s.id]?.status !== "completed" &&
                canActivateStep(s.id, data.steps)
            ) || pkgSteps[0];
          return frontier?.id ?? null;
        });
      }
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderNo]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const getStepStatus = useCallback(
    (step: StepDefinition): "completed" | "active" | "locked" => {
      if (!order) return "locked";
      if (order.steps[step.id]?.status === "completed") return "completed";
      if (canActivateStep(step.id, order.steps)) return "active";
      return "locked";
    },
    [order]
  );

  const completedCount = useMemo(
    () => steps.filter((s) => order?.steps[s.id]?.status === "completed").length,
    [steps, order]
  );

  const allComplete = steps.length > 0 && completedCount === steps.length;

  /** 保存协议同意到 order.agreements（不单独成步骤） */
  const handleAgree = async (agreementId: string, docChecks: Record<string, boolean>) => {
    if (!order) return;
    const now = new Date().toISOString();
    const next: AgreementRecord = {
      agreed: true,
      agreedAt: now,
      checked: true,
      confirmedAt: now,
      docChecks,
    };
    const agreements = { ...(order.agreements || {}), [agreementId]: next };
    try {
      await updateOrder(orderNo, { agreements });
      await loadOrder();
      setAgreementModalId(null);
    } catch (err) {
      alert(`保存协议失败: ${(err as Error).message}`);
    }
  };

  const ensureAgreementsForStep = (stepId: string): boolean => {
    if (!order) return false;
    const ids = agreementIdsForStep(stepId);
    for (const id of ids) {
      if (!isAgreementAgreed(getOrderAgreementRecord(order, id))) {
        const def = getAgreementById(id);
        alert(`请先阅读并同意《${def?.title || id}》`);
        setAgreementModalId(id);
        return false;
      }
    }
    return true;
  };

  const handleFormSave = async (stepId: string, formData: Record<string, unknown>) => {
    if (!ensureAgreementsForStep(stepId)) return;

    try {
      await completeStep(orderNo, stepId, formData);

      if (stepId === "a-visitor-info" && formData && typeof formData === "object") {
        const pkgId = (formData.packageId as TrackerOrder["packageId"]) || order?.packageId;
        const visitor = { ...(formData as TrackerOrder["visitor"]) };
        await updateOrder(orderNo, {
          visitor,
          ...(pkgId
            ? {
                packageId: pkgId,
                deposit: {
                  paid: order?.deposit?.paid || false,
                  paidAt: order?.deposit?.paidAt,
                  amount: getDepositAmount(pkgId),
                },
                fullPayment: {
                  paid: order?.fullPayment?.paid || false,
                  paidAt: order?.fullPayment?.paidAt,
                  amount: getPackagePrice(pkgId),
                },
              }
            : {}),
        });
      }

      if (stepId === "b-quiz") {
        await updateOrder(orderNo, {
          quizResult: {
            topMajors: (formData.topMajors as string[]) || [],
            pdfUrl: (formData.pdfUrl as string) || undefined,
            completedAt: (formData.completedAt as string) || new Date().toISOString(),
          },
        });
      }

      await loadOrder();

      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx >= 0 && idx < steps.length - 1) {
        setViewingStepId(steps[idx + 1].id);
      }
    } catch (err) {
      alert(`保存失败: ${(err as Error).message}`);
    }
  };

  const handleSelectStep = (stepId: string) => {
    if (!order) return;
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;
    // 任意环节可点击查看（未解锁则为只读）
    setViewingStepId(stepId);
  };

  const handlePrev = () => {
    if (!viewingStepId) return;
    const idx = steps.findIndex((s) => s.id === viewingStepId);
    if (idx > 0) {
      setViewingStepId(steps[idx - 1].id);
    }
  };

  const handleNext = () => {
    if (!viewingStepId) return;
    const idx = steps.findIndex((s) => s.id === viewingStepId);
    if (idx < 0) return;
    if (idx < steps.length - 1) {
      setViewingStepId(steps[idx + 1].id);
    }
  };

  const handleTerminate = async () => {
    const note = prompt("请输入终止原因：");
    if (note === null) return;
    try {
      await terminateOrder(orderNo, note);
      await loadOrder();
      alert("服务已终止");
    } catch (err) {
      alert(`操作失败: ${(err as Error).message}`);
    }
  };

  const renderForm = (step: StepDefinition, stepData: StepState | undefined, isReadOnly: boolean) => {
    const openAg = (id: string) => setAgreementModalId(id);

    if (step.id === "a-visitor-info") {
      const visitorData = (stepData?.data as TrackerOrder["visitor"]) || order?.visitor;
      return (
        <StepFormAIntake
          data={visitorData}
          order={order!}
          packageId={order?.packageId}
          role={session.role}
          readOnly={isReadOnly}
          onOpenAgreement={openAg}
          onSave={(data) => handleFormSave(step.id, data as Record<string, unknown>)}
        />
      );
    }
    if (step.id === "a-service-agreement") {
      const isAdult = !!(
        order?.visitor?.isAdult ||
        order?.visitor?.age === "25以上" ||
        order?.visitor?.grade === "本科生"
      );
      return (
        <StepFormConsent
          data={stepData?.data as {
            visitorConsent?: boolean;
            parentConsent?: boolean;
            visitorConsentAt?: string;
            parentConsentAt?: string;
          }}
          order={order!}
          role={session.role}
          readOnly={isReadOnly}
          isAdult={isAdult}
          onOpenAgreement={openAg}
          onSave={(data) => handleFormSave(step.id, data as Record<string, unknown>)}
        />
      );
    }
    if (step.id === "a-deposit") {
      const depositData = (stepData?.data as Record<string, unknown>) || {};
      return (
        <StepFormPayment
          type="deposit"
          data={{ ...depositData, ...(order?.deposit as Record<string, unknown>) }}
          readOnly={isReadOnly}
          role={session.role}
          price={getPackagePrice(order!.packageId)}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }
    if (step.id === "b-remaining") {
      const paymentData = (stepData?.data as Record<string, unknown>) || {};
      return (
        <StepFormPayment
          type="full-payment"
          data={{ ...paymentData, ...(order?.fullPayment as Record<string, unknown>) }}
          readOnly={isReadOnly}
          role={session.role}
          price={getPackagePrice(order!.packageId)}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }
    if (step.id === "b-quiz") {
      return (
        <div className="space-y-4">
          <StepAgreementGate stepId="b-quiz" order={order!} role={session.role} onOpen={openAg} />
          <StepFormB
            type="quiz"
            data={stepData?.data as Record<string, unknown>}
            readOnly={isReadOnly}
            role={session.role}
            packageId={order?.packageId}
            orderNo={order?.orderNo}
            visitorName={order?.visitor?.name}
            onSave={(data) => handleFormSave(step.id, data)}
          />
        </div>
      );
    }
    if (step.id.match(/^b-consult-(\d+)-pre$/)) {
      const idx = parseInt(step.id.match(/b-consult-(\d+)/)?.[1] || "1");
      return (
        <StepFormB
          type="consult-pre"
          consultIndex={idx}
          data={stepData?.data as Record<string, unknown>}
          readOnly={isReadOnly}
          role={session.role}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }
    if (step.id.match(/^b-consult-(\d+)-post$/)) {
      const idx = parseInt(step.id.match(/b-consult-(\d+)/)?.[1] || "1");
      return (
        <StepFormB
          type="consult-post"
          consultIndex={idx}
          data={stepData?.data as Record<string, unknown>}
          readOnly={isReadOnly}
          role={session.role}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }
    if (step.id === "b-counseling") {
      return (
        <div className="space-y-4">
          <StepAgreementGate stepId="b-counseling" order={order!} role={session.role} onOpen={openAg} />
          <StepFormB
            type="counseling"
            data={stepData?.data as Record<string, unknown>}
            readOnly={isReadOnly}
            role={session.role}
            onSave={(data) => handleFormSave(step.id, data)}
          />
        </div>
      );
    }
    if (step.id === "c-gifts") {
      return (
        <StepFormGifts
          data={stepData?.data as { text?: string } | undefined}
          readOnly={isReadOnly}
          role={session.role}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }
    if (step.id === "c-inspection" || step.id === "c-signature") {
      const isFinal = step.id === "c-signature";
      const completed = order?.steps[step.id]?.status === "completed";
      return (
        <StepFormCComplete
          data={stepData?.data as Record<string, unknown>}
          readOnly={isReadOnly}
          role={session.role}
          onSave={(data) => handleFormSave(step.id, data)}
          isFinal={isFinal}
          completed={completed}
          visitorName={order?.visitor?.name}
          packageName={order?.packageId ? PACKAGES[order.packageId]?.name : undefined}
          staffName="桥梁计划团队"
        />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bridge-muted animate-pulse">加载中...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "订单不存在"}</p>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm text-bridge-muted hover:text-white border border-white/30 rounded-lg"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const pkg = PACKAGES[order.packageId];
  const viewingStep = steps.find((s) => s.id === viewingStepId) || null;
  const viewingStatus = viewingStep ? getStepStatus(viewingStep) : "locked";
  const viewingIdx = viewingStep ? steps.findIndex((s) => s.id === viewingStep.id) : -1;
  const isTerminated = !!order.terminated;
  // 未解锁 / 已完成 / 已终止 → 只读（可查看后续环节）
  const formReadOnly =
    isTerminated || viewingStatus === "completed" || viewingStatus === "locked";
  const roleInfo = viewingStep ? fillRoleLabel(viewingStep.fillRole, session.role) : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-16">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex flex-col border-r border-white/40 bg-white/30 backdrop-blur-md h-[calc(100vh-4rem)] sticky top-16 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <TrackerFlowNav
              steps={steps}
              order={order}
              viewingStepId={viewingStepId}
              onSelectStep={handleSelectStep}
              completedCount={completedCount}
              role={session.role}
            />
          </div>
          <div className="p-2.5 border-t border-white/40 space-y-1.5 flex-shrink-0 bg-white/20">
            {session.role === "staff" && (
              <>
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-1.5 text-xs font-semibold text-bridge-blue border border-bridge-blue/30 rounded-lg bg-white/40 hover:bg-white/70"
                >
                  返回管理页
                </button>
                <button
                  type="button"
                  onClick={handleTerminate}
                  className="w-full py-1.5 text-xs font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  终止服务
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-1.5 text-xs text-bridge-muted border border-white/40 rounded-lg hover:bg-white/40"
            >
              退出登录
            </button>
          </div>
        </aside>

        <main className="flex flex-col min-h-[calc(100vh-4rem)] px-3 md:px-6 py-3 pb-8 w-full max-w-5xl mx-auto">
          {isTerminated && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              本服务已终止
              {order.terminated?.note ? `：${order.terminated.note}` : ""}
            </div>
          )}

          {/* 简约信息条：来访者 · 身份 · 套餐 · 订单 */}
          <div className="glass-panel px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <div className="text-left min-w-0">
              <p className="text-base font-bold text-bridge-text truncate">
                {order.visitor?.name || "（来访者姓名待填）"}
                <span className="ml-2 text-xs font-normal text-bridge-muted">
                  {session.role === "family"
                    ? "家庭客户"
                    : `我方${session.contactName ? ` · ${session.contactName}` : "引导员"}`}
                </span>
              </p>
              <p className="text-xs text-bridge-muted font-mono mt-0.5 truncate">
                订单 {order.orderNo}
                {order.familyCode ? ` · 联合码 ${order.familyCode}` : ""}
              </p>
            </div>
            <span className="inline-block px-3 py-1 rounded-lg bg-bridge-gold/10 border border-bridge-gold/30 text-sm font-bold text-bridge-text whitespace-nowrap">
              {pkg?.name || "待选择套餐"}
            </span>
          </div>

          <div className="md:hidden mb-3">
            <label className="block text-xs text-bridge-muted mb-1">当前步骤（均可查看）</label>
            <select
              value={viewingStepId || ""}
              onChange={(e) => handleSelectStep(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/40 text-sm"
            >
              {steps.map((s) => {
                const st = getStepStatus(s);
                return (
                  <option key={s.id} value={s.id}>
                    {st === "completed" ? "✓ " : st === "active" ? "● " : "○ "}
                    {s.label}
                    {st === "locked" ? "（可查看）" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex-1">
            {viewingStep ? (
              <div className="glass-panel p-5 md:p-7">
                <div className="mb-5 pb-4 border-b border-white/40 text-center">
                  <p className="text-xs text-bridge-muted">
                    步骤 {viewingStep.phase} · 第 {viewingIdx + 1} / {steps.length} 步
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-bridge-blue mt-1 text-center">
                    {viewingStep.label}
                  </h2>
                  {viewingStep.description && (
                    <p className="text-sm text-bridge-muted mt-2 text-left max-w-2xl mx-auto">
                      {viewingStep.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    {roleInfo && (
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded ${
                          roleInfo.tone === "own"
                            ? "bg-amber-100 text-amber-800"
                            : roleInfo.tone === "other"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {roleInfo.text}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-semibold ${
                        viewingStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : viewingStatus === "active"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {viewingStatus === "completed"
                        ? "本步已完成"
                        : viewingStatus === "active"
                          ? "进行中"
                          : "未到环节"}
                    </span>
                  </div>
                  {viewingStatus === "locked" && (
                    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 text-left">
                      该环节尚未轮到，暂不可填写。请先完成前面的环节；此处仅供预览。
                    </p>
                  )}
                  {viewingStatus === "completed" && (
                    <p className="text-sm text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded-lg px-3 py-2 mt-3 text-left">
                      本环节已保存锁定，内容不可更改。
                    </p>
                  )}
                  {roleInfo?.tone === "other" && viewingStatus === "active" && (
                    <p className="text-sm text-bridge-muted mt-3 text-left">
                      本环节由对方操作，您可实时查看进度，无需填写。
                    </p>
                  )}
                </div>

                <div className="text-sm md:text-base">
                  {renderForm(viewingStep, order.steps[viewingStep.id], formReadOnly)}
                </div>
              </div>
            ) : (
              <p className="text-center text-bridge-muted py-12">请从左侧选择步骤</p>
            )}
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={viewingIdx <= 0}
                className="px-6 py-3 text-base font-semibold rounded-xl border border-white/50 bg-white/50 disabled:opacity-40 hover:bg-white/80 text-bridge-blue"
              >
                ← 上一步
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={viewingIdx >= steps.length - 1}
                className="px-6 py-3 text-base font-bold rounded-xl text-white bg-bridge-blue hover:bg-blue-600 shadow-md disabled:opacity-40"
              >
                {viewingIdx >= steps.length - 1 ? (allComplete ? "已全部完成 ✓" : "已是最后一步") : "下一步 →"}
              </button>
            </div>
            <p className="text-xs text-bridge-muted text-center">
              当前进行至：{viewingStep?.label || "—"}（{Math.round((completedCount / Math.max(steps.length, 1)) * 100)}%）
            </p>
          </div>
        </main>
      </div>

      {agreementModalId && (() => {
        const agreement = getAgreementById(agreementModalId);
        if (!agreement || !order) return null;
        const rec = getOrderAgreementRecord(order, agreementModalId);
        return (
          <TrackerAgreementModal
            agreementId={agreement.id}
            visitor={order.visitor}
            packageId={order.packageId}
            orderNo={order.orderNo}
            existingRecord={{
              checked: !!(rec?.checked || rec?.agreed),
              confirmedAt: rec?.confirmedAt || rec?.agreedAt,
              docChecks: rec?.docChecks,
            }}
            role={session.role}
            onAgree={(docChecks) => handleAgree(agreementModalId, docChecks)}
            onCancel={() => setAgreementModalId(null)}
          />
        );
      })()}
    </div>
  );
}
