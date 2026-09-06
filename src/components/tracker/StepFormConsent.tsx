"use client";

import { useState } from "react";
import StepAgreementGate from "./StepAgreementGate";
import type { TrackerOrder } from "@/lib/tracker-types";
import { getOrderAgreementRecord, isAgreementAgreed } from "@/lib/tracker-agreements";

interface ConsentData {
  visitorConsent?: boolean;
  parentConsent?: boolean;
  visitorConsentAt?: string;
  parentConsentAt?: string;
}

/** A 阶段：意愿确认（服务协议内嵌 + 来访/家长意愿勾选） */
export default function StepFormConsent({
  data,
  order,
  role,
  readOnly = false,
  isAdult = false,
  onOpenAgreement,
  onSave,
}: {
  data?: ConsentData;
  order: TrackerOrder;
  role: "family" | "staff";
  readOnly?: boolean;
  isAdult?: boolean;
  onOpenAgreement: (agreementId: string) => void;
  onSave?: (data: ConsentData) => void;
}) {
  const svcOk = isAgreementAgreed(getOrderAgreementRecord(order, "service"));
  const [visitorConsent, setVisitorConsent] = useState(!!data?.visitorConsent);
  const [parentConsent, setParentConsent] = useState(!!data?.parentConsent);

  const canEdit = !readOnly && role === "family" && svcOk;

  const handleSubmit = () => {
    if (!svcOk) {
      alert("请先阅读并同意《教育咨询服务协议》");
      return;
    }
    if (!visitorConsent) {
      alert("请勾选来访意愿确认");
      return;
    }
    if (!isAdult && !parentConsent) {
      alert("未成年来访需勾选家长意愿确认");
      return;
    }
    const now = new Date().toISOString();
    onSave?.({
      visitorConsent: true,
      parentConsent: isAdult ? true : parentConsent,
      visitorConsentAt: data?.visitorConsentAt || now,
      parentConsentAt: isAdult ? undefined : data?.parentConsentAt || now,
    });
  };

  return (
    <div className="space-y-4">
      <StepAgreementGate
        stepId="a-service-agreement"
        order={order}
        role={role}
        onOpen={onOpenAgreement}
      />

      {!svcOk && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          请先阅读并同意上方《教育咨询服务协议》，确认信息无误后方可进行意愿确认。
        </p>
      )}

      <label
        className={`flex items-start gap-2.5 p-3 rounded-lg border ${
          visitorConsent ? "border-green-300 bg-green-50/50" : "border-white/40 bg-white/20"
        }`}
      >
        <input
          type="checkbox"
          checked={visitorConsent}
          onChange={(e) => setVisitorConsent(e.target.checked)}
          disabled={!canEdit}
          className="mt-0.5"
        />
        <span className="text-sm text-bridge-text leading-relaxed">
          本人已了解套餐内容与服务流程，自愿参与并确认以上信息属实。
          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold">
            家庭端
          </span>
        </span>
      </label>

      {isAdult ? (
        <p className="text-xs text-bridge-muted">来访已成年，无需家长确认。</p>
      ) : (
        <label
          className={`flex items-start gap-2.5 p-3 rounded-lg border ${
            parentConsent ? "border-green-300 bg-green-50/50" : "border-white/40 bg-white/20"
          }`}
        >
          <input
            type="checkbox"
            checked={parentConsent}
            onChange={(e) => setParentConsent(e.target.checked)}
            disabled={!canEdit}
            className="mt-0.5"
          />
          <span className="text-sm text-bridge-text leading-relaxed">
            家长已了解套餐内容与服务流程，同意孩子参与并配合后续安排。
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold">
              家庭端
            </span>
          </span>
        </label>
      )}

      {!readOnly && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={role !== "family"}
          className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-blue hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {role === "family" ? "保存意愿确认" : "本环节由家庭端填写"}
        </button>
      )}
    </div>
  );
}
