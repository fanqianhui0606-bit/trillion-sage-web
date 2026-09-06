"use client";

import {
  agreementIdsForStep,
  getAgreementById,
  getOrderAgreementRecord,
  isAgreementAgreed,
} from "@/lib/tracker-agreements";
import type { TrackerOrder } from "@/lib/tracker-types";

/** 环节内嵌的协议/须知门控（非独立步骤） */
export default function StepAgreementGate({
  stepId,
  order,
  role,
  onOpen,
}: {
  stepId: string;
  order: TrackerOrder;
  role: "family" | "staff";
  onOpen: (agreementId: string) => void;
}) {
  const ids = agreementIdsForStep(stepId);
  if (!ids.length) return null;

  return (
    <div className="rounded-xl border border-amber-300/70 bg-amber-50/80 p-3.5 space-y-2.5">
      <p className="text-xs font-semibold text-amber-800">
        进行下一步前，请点击阅读并同意以下文件：
      </p>
      {ids.map((id) => {
        const def = getAgreementById(id);
        if (!def) return null;
        const rec = getOrderAgreementRecord(order, id);
        const agreed = isAgreementAgreed(rec);
        const canAgreeHere =
          (def.by === "visitor" && role === "family") ||
          (def.by === "staff" && role === "staff");
        const when = rec?.agreedAt || rec?.confirmedAt;

        return (
          <div
            key={id}
            className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${
              agreed ? "border-green-300 bg-green-50/70" : "border-amber-200 bg-white/70"
            }`}
          >
            <span className="text-base leading-none mt-0.5" aria-hidden>
              📑
            </span>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onOpen(id)}
                className="text-left text-sm font-bold text-bridge-blue hover:underline"
              >
                {def.title}
              </button>
              <p className="text-[11px] mt-1 leading-relaxed">
                {agreed ? (
                  <span className="text-green-700">
                    ✓ 已阅读并同意{when ? `（${new Date(when).toLocaleString("zh-CN")}）` : ""}
                  </span>
                ) : canAgreeHere ? (
                  <span className="text-amber-800">
                    未确认 · 点击标题阅读，滑至全文底部并停留约 5 秒后方可同意
                  </span>
                ) : (
                  <span className="text-bridge-muted">
                    待{role === "staff" ? "家庭端" : "引导员"}阅读并同意（可点击标题查看全文）
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
