"use client";

import type { StepDefinition, TrackerOrder, TrackerRole } from "@/lib/tracker-types";
import { canActivateStep, fillRoleLabel } from "@/lib/tracker-packages";
import {
  agreementIdsForStep,
  getAgreementById,
  getOrderAgreementRecord,
  isAgreementAgreed,
} from "@/lib/tracker-agreements";

const PHASE_LABELS: Record<"A" | "B" | "C", string> = {
  A: "前期意愿",
  B: "过程跟进",
  C: "服务完成",
};

const PHASE_STYLE: Record<"A" | "B" | "C", string> = {
  A: "text-sky-800 bg-sky-100/80 border-sky-200",
  B: "text-violet-800 bg-violet-100/80 border-violet-200",
  C: "text-amber-900 bg-amber-100/80 border-amber-200",
};

function stepBizGroup(stepId: string): "quiz" | "consult" | "psych" | null {
  if (stepId.startsWith("b-quiz")) return "quiz";
  if (stepId.startsWith("b-consult")) return "consult";
  if (stepId.startsWith("b-counseling")) return "psych";
  return null;
}

const BIZ_META = {
  quiz: {
    label: "测验业务",
    box: "border-green-500 bg-green-50/40",
    labelCls: "text-green-800 bg-green-100",
  },
  consult: {
    label: "咨询业务",
    box: "border-pink-500 bg-pink-50/30",
    labelCls: "text-pink-800 bg-pink-100",
  },
  psych: {
    label: "心理辅导业务",
    box: "border-purple-500 bg-purple-50/30",
    labelCls: "text-purple-800 bg-purple-100",
  },
};

export default function TrackerFlowNav({
  steps,
  order,
  viewingStepId,
  onSelectStep,
  completedCount,
  role,
}: {
  steps: StepDefinition[];
  order: TrackerOrder;
  viewingStepId: string | null;
  onSelectStep: (stepId: string) => void;
  completedCount: number;
  role: TrackerRole;
}) {
  const pct = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const frontierId =
    steps.find((s) => order.steps[s.id]?.status !== "completed")?.id ?? null;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#eef4fb]/50">
      <div className="p-3.5 border-b border-slate-200/80 flex-shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.jpg" alt="" className="w-8 h-8 rounded-lg object-contain flex-shrink-0 bg-white p-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-bridge-blue font-brand leading-tight">桥梁计划</p>
            <p className="text-xs text-bridge-muted">服务流程跟进</p>
          </div>
        </div>
        <div className="h-2.5 bg-white/70 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-bridge-blue rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-bridge-muted mt-1.5 text-left">
          {completedCount} / {steps.length} 步 · {pct}%
        </p>
        <p className="text-xs text-bridge-muted mt-1 leading-snug text-left">
          可点击任意环节查看；未到环节仅可浏览、不可填写。
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {(["A", "B", "C"] as const).map((phase) => {
          const phaseSteps = steps.filter((s) => s.phase === phase);
          if (!phaseSteps.length) return null;

          const blocks: { key: string; biz?: "quiz" | "consult" | "psych"; items: StepDefinition[] }[] = [];
          if (phase === "B") {
            let currentBiz: string | null = null;
            for (const step of phaseSteps) {
              const biz = stepBizGroup(step.id);
              if (biz && biz === currentBiz) {
                blocks[blocks.length - 1].items.push(step);
              } else if (biz) {
                currentBiz = biz;
                blocks.push({ key: biz, biz, items: [step] });
              } else {
                currentBiz = null;
                blocks.push({ key: step.id, items: [step] });
              }
            }
          } else {
            blocks.push({ key: phase, items: phaseSteps });
          }

          return (
            <div key={phase}>
              <p
                className={`inline-flex text-xs font-bold tracking-wider mb-2 px-2 py-0.5 rounded border ${PHASE_STYLE[phase]}`}
              >
                {phase} · {PHASE_LABELS[phase]}
              </p>
              <div className="space-y-2">
                {blocks.map((block) => {
                  const bizMeta = block.biz ? BIZ_META[block.biz] : null;
                  return (
                    <div
                      key={block.key}
                      className={
                        bizMeta
                          ? `relative rounded-xl border-[1.5px] border-dashed p-2 pt-4 space-y-1.5 ${bizMeta.box}`
                          : "space-y-1.5"
                      }
                    >
                      {bizMeta && (
                        <span
                          className={`absolute -top-2.5 left-2 text-[11px] font-bold px-1.5 py-0.5 rounded ${bizMeta.labelCls}`}
                        >
                          {bizMeta.label}
                        </span>
                      )}
                      {block.items.map((step) => {
                        const done = order.steps[step.id]?.status === "completed";
                        const progressActive = step.id === frontierId && !done;
                        const viewing = viewingStepId === step.id;
                        const unlocked = canActivateStep(step.id, order.steps);
                        const roleInfo = fillRoleLabel(step.fillRole, role);
                        const chips = agreementIdsForStep(step.id)
                          .map((id) => getAgreementById(id))
                          .filter(Boolean);

                        let boxCls =
                          "border-slate-300/80 bg-white/70 text-slate-600 shadow-sm";
                        if (done) {
                          boxCls =
                            "border-green-500/70 bg-green-100/90 text-green-800 shadow-sm";
                        }
                        if (progressActive) {
                          boxCls =
                            "border-amber-400 bg-amber-50 text-amber-950 shadow-[0_0_0_2px_rgba(245,158,11,0.35)]";
                        }
                        if (viewing) {
                          boxCls =
                            "border-bridge-blue bg-bridge-blue text-white shadow-md";
                        }

                        let dotCls = "bg-slate-300";
                        if (done) dotCls = viewing ? "bg-white" : "bg-green-500";
                        else if (viewing) dotCls = "bg-amber-300";
                        else if (progressActive) dotCls = "bg-amber-500";

                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => onSelectStep(step.id)}
                            className={`w-full text-left rounded-xl border px-2.5 py-2.5 transition-all hover:brightness-[1.03] cursor-pointer ${boxCls}`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotCls}`}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-sm leading-snug ${
                                    viewing || done ? "font-semibold" : "font-medium"
                                  }`}
                                >
                                  {step.label}
                                  {done ? " ✓" : ""}
                                </p>
                                <p
                                  className={`text-[11px] mt-0.5 font-semibold text-left ${
                                    viewing
                                      ? "text-white/85"
                                      : roleInfo.tone === "own"
                                        ? "text-sky-700"
                                        : roleInfo.tone === "other"
                                          ? "text-slate-400"
                                          : "text-indigo-600"
                                  }`}
                                >
                                  {roleInfo.text}
                                  {!done && !unlocked ? " · 可查看" : ""}
                                </p>
                                {chips.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {chips.map((ag) => {
                                      if (!ag) return null;
                                      const agreed = isAgreementAgreed(
                                        getOrderAgreementRecord(order, ag.id)
                                      );
                                      return (
                                        <span
                                          key={ag.id}
                                          className={`text-[11px] px-1.5 py-0.5 rounded border text-left ${
                                            viewing
                                              ? agreed
                                                ? "text-white border-white/50 bg-white/15"
                                                : "text-white/80 border-dashed border-white/40"
                                              : agreed
                                                ? "text-green-700 border-green-400 bg-green-50"
                                                : "text-slate-500 border-dashed border-slate-300 bg-white/60"
                                          }`}
                                        >
                                          {ag.shortTitle || ag.title.slice(0, 8)}
                                          {agreed ? " ✓" : ""}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
