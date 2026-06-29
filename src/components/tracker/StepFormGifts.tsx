"use client";

import { useState } from "react";

interface Props {
  data?: { text?: string };
  readOnly?: boolean;
  role?: "staff" | "family";
  onSave?: (data: { text: string }) => void;
}

export default function StepFormGifts({ data, readOnly = false, role = "family", onSave }: Props) {
  const [giftText, setGiftText] = useState(data?.text || "");

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-bridge-blue border-b border-white/10 pb-2">赠送产品</h3>
      <textarea
        value={giftText}
        onChange={(e) => setGiftText(e.target.value)}
        readOnly={role === "family" || readOnly}
        placeholder="填写赠送产品说明（如：电子资料包、后续咨询服务等）"
        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue"
        rows={3}
      />
      {role === "staff" && !readOnly && (
        <button
          onClick={() => onSave?.({ text: giftText })}
          className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
        >
          保存赠送说明
        </button>
      )}
    </div>
  );
}