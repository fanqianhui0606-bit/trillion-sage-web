"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrackerSession, TrackerOrder, StepDefinition } from "@/lib/tracker-types";
import { PACKAGES, getStepsForPackage, canActivateStep } from "@/lib/tracker-packages";
import { getOrder, completeStep, terminateOrder } from "@/lib/fireorm";

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

  // 完成步骤
  const handleCompleteStep = async (stepId: string, data?: Record<string, unknown>) => {
    try {
      await completeStep(orderNo, stepId, data);
      await loadOrder(); // 重新加载
    } catch (err) {
      alert(`操作失败: ${(err as Error).message}`);
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
      <div className="max-w-4xl mx-auto">
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

        {/* A/B/C 阶段分区 */}
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

              {/* 步骤列表 */}
              <div className="space-y-2">
                {phaseSteps.map((step) => {
                  const status = getStepStatus(step);
                  const isCompleted = status === "completed";
                  const isActive = status === "active";
                  const isLocked = status === "locked";

                  return (
                    <div
                      key={step.id}
                      className={`glass-panel p-4 transition-all ${
                        isLocked ? "opacity-50" : isActive ? "border-bridge-blue/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* 状态图标 */}
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${isCompleted ? "bg-green-500 text-white" : isActive ? "bg-bridge-blue text-white ring-2 ring-bridge-blue/30" : "bg-white/30 text-bridge-muted"}`}
                        >
                          {isCompleted ? "✓" : phase}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isCompleted ? "text-green-700 line-through" : isActive ? "text-bridge-blue" : "text-bridge-muted"}`}>
                              {step.label}
                            </span>
                            {isActive && (
                              <span className="text-[10px] bg-bridge-blue/15 text-bridge-blue px-1.5 py-0.5 rounded font-semibold">
                                进行中
                              </span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-xs text-bridge-muted mt-0.5">{step.description}</p>
                          )}
                        </div>

                        {/* 操作按钮（仅 active 时显示） */}
                        {isActive && (
                          <button
                            onClick={() => handleCompleteStep(step.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-bridge-blue hover:bg-bridge-blue-dark rounded-lg transition-colors flex-shrink-0"
                          >
                            标记完成
                          </button>
                        )}

                        {/* 完成时间 */}
                        {isCompleted && order.steps[step.id]?.completedAt && (
                          <span className="text-[10px] text-bridge-muted flex-shrink-0">
                            {new Date(order.steps[step.id].completedAt!).toLocaleDateString("zh-CN")}
                          </span>
                        )}
                      </div>
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
    </div>
  );
}