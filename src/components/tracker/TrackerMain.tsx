"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrackerSession, TrackerOrder, StepDefinition } from "@/lib/tracker-types";
import { orderStorageKey } from "@/lib/tracker-types";
import { PACKAGES, getStepsForPackage, canActivateStep } from "@/lib/tracker-packages";

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

  // 加载订单数据
  const loadOrder = useCallback(() => {
    const raw = localStorage.getItem(orderStorageKey(orderNo));
    if (raw) {
      const data = JSON.parse(raw) as TrackerOrder;
      setOrder(data);
      setSteps(getStepsForPackage(data.packageId));
    }
  }, [orderNo]);

  useEffect(() => {
    loadOrder();

    // 跨标签页同步：监听 storage 事件
    const handleStorage = (e: StorageEvent) => {
      if (e.key === orderStorageKey(orderNo) && e.newValue) {
        setOrder(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadOrder, orderNo]);

  // 保存订单（同时触发其他标签页更新）
  const saveOrder = (updated: TrackerOrder) => {
    localStorage.setItem(orderStorageKey(orderNo), JSON.stringify(updated));
    setOrder(updated);
  };

  // 完成步骤
  const completeStep = (stepId: string, data?: Record<string, unknown>) => {
    if (!order) return;
    const updated: TrackerOrder = {
      ...order,
      steps: {
        ...order.steps,
        [stepId]: { status: "completed", data, completedAt: new Date().toISOString() },
      },
    };
    saveOrder(updated);
  };

  // 获取步骤状态
  const getStepStatus = (step: StepDefinition): string => {
    if (!order) return "pending";
    // 团队可手动标记已完成
    if (session.role === "staff" && order.steps[step.id]?.status === "completed") {
      return "completed";
    }
    // 自动判断
    if (order.steps[step.id]?.status === "completed") return "completed";
    if (canActivateStep(step.id, order.steps)) return "active";
    return "locked";
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bridge-muted animate-pulse">加载中...</div>
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
                            onClick={() => completeStep(step.id)}
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
                onClick={() => {
                  if (confirm("确定要终止此服务吗？")) {
                    const note = prompt("请输入终止原因：");
                    if (note !== null) {
                      const updated: TrackerOrder = { ...order, terminated: { at: new Date().toISOString(), note } };
                      saveOrder(updated);
                    }
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                终止服务
              </button>
              <button
                onClick={() => {
                  const data = localStorage.getItem(orderStorageKey(orderNo));
                  if (data) {
                    const blob = new Blob([data], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `order_${orderNo}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                className="px-3 py-2 text-xs font-semibold text-bridge-blue border border-bridge-blue/30 rounded-lg hover:bg-bridge-blue/5 transition-colors"
              >
                导出订单数据
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}