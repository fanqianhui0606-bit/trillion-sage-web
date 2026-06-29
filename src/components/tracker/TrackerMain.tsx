"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrackerSession, TrackerOrder, StepDefinition, StepState } from "@/lib/tracker-types";
import { PACKAGES, getStepsForPackage, canActivateStep, getDepositAmount } from "@/lib/tracker-packages";
import { getAgreementByStepId, agreementIdsForStep, getAgreementById } from "@/lib/tracker-agreements";
import { getOrder, updateOrder, completeStep, terminateOrder } from "@/lib/fireorm";
import StepFormAIntake from "./StepFormA";
import StepFormB from "./StepFormB";
import StepFormPayment, { StepFormCComplete } from "./StepFormC";
import StepFormThanks from "./StepFormThanks";
import StepFormGifts from "./StepFormGifts";
import TrackerAgreementModal from "./TrackerAgreementModal";

const PHASE_LABELS = { A: "来访信息", B: "服务跟进", C: "服务完成" };

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
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [agreementModalStep, setAgreementModalStep] = useState<string | null>(null);

  // 加载订单数据
  const loadOrder = useCallback(async () => {
    try {
      const data = await getOrder(orderNo);
      setOrder(data);
      if (data) {
        setSteps(getStepsForPackage(data.packageId));
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

  // 处理表单保存
  const handleFormSave = async (stepId: string, formData: Record<string, unknown>) => {
    try {
      // 保存表单数据到步骤
      await completeStep(orderNo, stepId, formData);

      // 如果是来访者信息，也更新订单主体
      if (stepId === "a-visitor-info" && formData && typeof formData === "object") {
        await updateOrder(orderNo, { visitor: formData as TrackerOrder["visitor"] });
      }

      await loadOrder();
      setExpandedStep(null);
      setAgreementModalStep(null);
    } catch (err) {
      alert(`保存失败: ${(err as Error).message}`);
    }
  };

  // 点击步骤进入编辑
  const handleStepClick = (stepId: string, status: string) => {
    if (status === "locked") return;
    // 协议步骤：打开弹窗阅读
    if (isAgreementStep(stepId)) {
      if (status === "completed") return; // 已完成则不可重复操作
      setAgreementModalStep(stepId);
      return;
    }
    if (status === "completed") {
      setExpandedStep(expandedStep === stepId ? null : stepId);
    } else {
      setExpandedStep(expandedStep === stepId ? null : stepId);
    }
  };

  // 终止服务
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

  // 获取步骤状态
  const getStepStatus = (step: StepDefinition): string => {
    if (!order) return "locked";
    if (session.role === "staff" && order.steps[step.id]?.status === "completed") {
      return "completed";
    }
    if (order.steps[step.id]?.status === "completed") return "completed";
    if (canActivateStep(step.id, order.steps)) return "active";
    return "locked";
  };

  // 判断步骤是否包含表单
  const hasForm = (stepId: string): boolean => {
    return [
      "a-visitor-info",
      "a-deposit",
      "b-quiz",
      "b-consult-1-pre", "b-consult-1-post",
      "b-consult-2-pre", "b-consult-2-post",
      "b-consult-3-pre", "b-consult-3-post",
      "b-counseling",
      "b-remaining",
      "c-inspection", "c-gifts", "c-signature", "c-thanks",
    ].includes(stepId);
  };

  // 判断步骤是否为协议阅读
  const isAgreementStep = (stepId: string): boolean => {
    return [
      "a-privacy-policy",
      "a-service-agreement",
      "b-quiz-knowledge",
      "b-counseling-knowledge",
    ].includes(stepId);
  };

  // 渲染表单内容
  const renderForm = (step: StepDefinition, stepData: StepState | undefined, isReadOnly: boolean) => {

    // 来访信息表单
    if (step.id === "a-visitor-info") {
      const visitorData = (stepData?.data as TrackerOrder["visitor"]) || order?.visitor;
      return (
        <StepFormAIntake
          data={visitorData}
          readOnly={isReadOnly}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }

    // 定金表单
    if (step.id === "a-deposit") {
      const depositData = (stepData?.data as Record<string, unknown>) || {};
      return (
        <StepFormPayment
          type="deposit"
          data={{ ...depositData, ...order?.deposit as Record<string, unknown> }}
          readOnly={isReadOnly}
          role={session.role}
          price={getDepositAmount(order!.packageId)}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }

    // 全款表单
    if (step.id === "b-remaining") {
      const paymentData = (stepData?.data as Record<string, unknown>) || {};
      return (
        <StepFormPayment
          type="full-payment"
          data={{ ...paymentData, ...order?.fullPayment as Record<string, unknown> }}
          readOnly={isReadOnly}
          role={session.role}
          price={order!.steps["a-deposit"]?.data ? (order!.steps["a-deposit"].data as { amount?: number }).amount || 0 : getDepositAmount(order!.packageId) * 9}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }

    // 测验表单
    if (step.id === "b-quiz") {
      return (
        <StepFormB
          type="quiz"
          data={stepData?.data as Record<string, unknown>}
          readOnly={isReadOnly}
          role={session.role}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }

    // 咨询表单
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

    // 心理辅导表单
    if (step.id === "b-counseling") {
      return (
        <StepFormB
          type="counseling"
          data={stepData?.data as Record<string, unknown>}
          readOnly={isReadOnly}
          role={session.role}
          onSave={(data) => handleFormSave(step.id, data)}
        />
      );
    }

    // c-gifts 赠送产品（参考库的 c-gifts）
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

    // 感谢页（参考库 c-completion）
    if (step.id === "c-thanks") {
      return (
        <StepFormThanks
          visitorName={order?.visitor?.name}
          packageName={order?.packageId ? PACKAGES[order.packageId]?.name : undefined}
          staffName="桥梁计划团队"
        />
      );
    }

    // C 阶段确认表单
    if (step.id === "c-inspection" || step.id === "c-signature") {
      const signatureData = stepData?.data as Record<string, unknown>;
      return (
        <StepFormCComplete
          data={signatureData}
          readOnly={isReadOnly}
          role={session.role}
          onSave={(data) => handleFormSave(step.id, data)}
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
            返回登录
          </button>
        </div>
      </div>
    );
  }

  const pkg = PACKAGES[order.packageId];
  const completedCount = steps.filter((s) => getStepStatus(s) === "completed").length;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 顶栏 */}
        <div className="glass-panel p-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-bridge-blue font-serif">服务流程跟进</h1>
            <p className="text-xs text-bridge-muted">
              {pkg.name} · 订单号 {order.orderNo}
            </p>
            <p className="text-xs text-bridge-muted">
              当前：{session.role === "family" ? "家庭客户" : "引导员"} · {session.contactName}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs text-bridge-muted hover:text-bridge-blue border border-white/30 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>

        {/* 进度条 */}
        <div className="glass-panel p-3 mb-4">
          <div className="flex justify-between text-xs text-bridge-muted mb-2">
            <span>流程进度</span>
            <span>{completedCount} / {steps.length} 步</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-bridge-blue to-bridge-gold rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 步骤列表 */}
        {(["A", "B", "C"] as const).map((phase) => {
          const phaseSteps = steps.filter((s) => s.phase === phase);
          if (!phaseSteps.length) return null;

          return (
            <div key={phase} className="mb-6">
              {/* 阶段标题 */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-bridge-blue bg-bridge-blue/10 px-2 py-1 rounded">
                  阶段 {phase}
                </span>
                <span className="text-sm font-semibold text-bridge-text">{PHASE_LABELS[phase]}</span>
              </div>

              <div className="space-y-3">
                {phaseSteps.map((step) => {
                  const status = getStepStatus(step);
                  const isCompleted = status === "completed";
                  const isActive = status === "active";
                  const isLocked = status === "locked";
                  const isExpanded = expandedStep === step.id;
                  const stepData = order.steps[step.id];
                  const hasFormContent = hasForm(step.id);

                  // 协议 chip（与参考库一致：每步显示绑定的协议同意状态）
                  const agreementChips = agreementIdsForStep(step.id).map((agId) => {
                    const agDef = getAgreementById(agId);
                    if (!agDef) return null;
                    // 协议同意状态 = 对应步骤是否已标记 completed
                    const agreed = order.steps[agDef.stepId]?.status === "completed";
                    return (
                      <span
                        key={agId}
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                          agreed
                            ? "text-green-600 bg-green-50 border-green-300"
                            : "text-slate-400 bg-white/20 border-dashed border-slate-300"
                        }`}
                      >
                        {agDef.title}
                        {agreed && " ✓"}
                      </span>
                    );
                  });

                  return (
                    <div key={step.id}>
                      {/* 步骤卡片头部 */}
                      <div
                        onClick={() => ((hasFormContent || isAgreementStep(step.id)) && !isLocked) ? handleStepClick(step.id, status) : null}
                        className={`glass-panel p-4 transition-all ${
                          isLocked ? "opacity-50 cursor-not-allowed" :
                          (hasFormContent || isAgreementStep(step.id)) ? "cursor-pointer hover:border-bridge-blue/30" : "cursor-default"
                        } ${isExpanded ? "border-bridge-blue/40 rounded-b-none" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          {/* 状态图标 */}
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-bridge-blue text-white ring-2 ring-bridge-blue/30" : "bg-white/30 text-bridge-muted"}`}
                          >
                            {isCompleted ? "✓" : phase}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-semibold ${isCompleted ? "text-green-700 line-through" : isActive ? "text-bridge-blue" : "text-bridge-muted"}`}>
                                {step.label}
                              </span>
                              {hasFormContent && !isLocked && (
                                <span className="text-[10px] text-bridge-muted">
                                  {isExpanded ? "收起" : "点击填写"}
                                </span>
                              )}
                              {isAgreementStep(step.id) && isActive && (
                                <span className="text-[10px] text-bridge-muted">点击阅读</span>
                              )}
                              {isActive && !isExpanded && (
                                <span className="text-[10px] bg-bridge-blue/15 text-bridge-blue px-1.5 py-0.5 rounded font-semibold">
                                  进行中
                                </span>
                              )}
                              {/* 协议 chip（参考库的 rail-agreement-chip） */}
                              {agreementChips}
                            </div>
                            {step.description && (
                              <p className="text-xs text-bridge-muted mt-0.5">{step.description}</p>
                            )}
                          </div>

                          {/* 完成时间 */}
                          {isCompleted && stepData?.completedAt && (
                            <span className="text-[10px] text-bridge-muted flex-shrink-0">
                              {new Date(stepData.completedAt).toLocaleDateString("zh-CN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 展开的表单 */}
                      {isExpanded && hasFormContent && (
                        <div className="glass-panel -mt-[1px] pt-4 pb-4 px-4 border-t border-bridge-blue/20 rounded-b-lg">
                          {renderForm(step, stepData, isCompleted && status === "completed")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* 团队工具栏（仅 staff） */}
        {session.role === "staff" && (
          <div className="glass-panel p-4 mt-6">
            <h3 className="text-sm font-bold text-bridge-blue mb-3">引导员工具</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTerminate}
                className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                终止服务
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 协议弹窗 */}
      {agreementModalStep && (() => {
        const agreement = getAgreementByStepId(agreementModalStep);
        if (!agreement || !order) return null;
        const stepData = order.steps[agreementModalStep];
        return (
          <TrackerAgreementModal
            agreementId={agreement.id}
            visitor={order.visitor}
            packageId={order.packageId}
            orderNo={order.orderNo}
            existingRecord={stepData?.data as { checked?: boolean; confirmedAt?: string; docChecks?: Record<string, boolean> } | undefined}
            role={session.role}
            onAgree={(docChecks) => handleFormSave(agreementModalStep, { agreed: true, agreedAt: new Date().toISOString(), docChecks })}
            onCancel={() => setAgreementModalStep(null)}
          />
        );
      })()}
    </div>
  );
}