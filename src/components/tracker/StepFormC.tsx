"use client";

import { useState } from "react";

interface Props {
  type: "deposit" | "full-payment";
  data?: Record<string, unknown>;
  readOnly?: boolean;
  role?: "staff" | "family";
  price?: number;
  onSave?: (data: Record<string, unknown>) => void;
}

/** A 阶段：定金/全款支付表单。price 传入套餐总价，组件内部计算定金或尾款金额 */
export default function StepFormPayment({ type, data, readOnly = false, role = "staff", price = 0, onSave }: Props) {
  const [paid, setPaid] = useState((data?.paid as boolean) || false);
  const [paidDate, setPaidDate] = useState((data?.paidAt as string) || "");
  const [transactionNo, setTransactionNo] = useState((data?.transactionNo as string) || "");
  const [receiptConfirmed, setReceiptConfirmed] = useState((data?.receiptConfirmed as boolean) || false);

  const isDeposit = type === "deposit";
  // 定金 = 总价 × 10%，尾款 = 总价 × 90%
  const expectedAmount = isDeposit ? Math.round(price * 0.1) : Math.round(price * 0.9);
  const [amount, setAmount] = useState((data?.amount as number) || expectedAmount);

  const handleSave = () => {
    onSave?.({
      paid,
      paidAt: paid ? (paidDate || new Date().toISOString().split("T")[0]) : undefined,
      amount: paid ? amount : 0,
      transactionNo: paid ? transactionNo : "",
      receiptConfirmed: paid ? receiptConfirmed : false,
      confirmedAt: paid ? new Date().toISOString() : undefined,
    });
  };

  const label = isDeposit ? "定金（10%）" : "全款支付";
  const hint = isDeposit
    ? "定金为合同总费用的10%，用于锁定服务档期。如客户中途放弃，定金不予退还。"
    : "全款支付为合同约定费用的剩余90%，应在服务开始前结清。";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-bridge-gold border-b border-white/10 pb-2">
        💰 {label}
      </h3>

      <div className="p-3 rounded-lg bg-bridge-gold/5 border border-bridge-gold/20">
        <p className="text-xs text-bridge-muted">{hint}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-bridge-muted mb-1">应付金额（¥）</label>
          <input
            type="number"
            value={expectedAmount}
            disabled
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm text-bridge-gold font-bold"
          />
        </div>
        <div>
          <label className="block text-xs text-bridge-muted mb-1">实际收款（¥）</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={readOnly || role === "family"}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-gold disabled:opacity-60"
          />
        </div>
        <div>
          <label className="block text-xs text-bridge-muted mb-1">收款日期</label>
          <input
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            disabled={readOnly || role === "family"}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-bridge-muted mb-1">交易单号 / 备注</label>
        <input
          type="text"
          value={transactionNo}
          onChange={(e) => setTransactionNo(e.target.value)}
          disabled={readOnly || role === "family"}
          className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue disabled:opacity-60"
          placeholder="交易单号或转账备注"
        />
      </div>

      <div className="p-3 rounded-lg border border-white/10 bg-white/5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={receiptConfirmed}
            onChange={(e) => setReceiptConfirmed(e.target.checked)}
            disabled={readOnly || role === "family"}
            className="w-4 h-4 accent-green-500"
          />
          <span className="text-sm text-bridge-muted">
            引导员已确认收款，收据已交付家长
          </span>
        </label>
      </div>

      <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={paid}
            onChange={(e) => setPaid(e.target.checked)}
            disabled={readOnly || role === "family"}
            className="w-4 h-4 accent-green-500"
          />
          <span className="text-sm font-semibold text-green-400">
            ✓ 确认{label}已完成
          </span>
        </label>
      </div>

      {!readOnly && (
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-lg font-bold text-sm text-white bg-bridge-gold hover:bg-yellow-600 transition-colors"
        >
          确认{label}
        </button>
      )}
    </div>
  );
}

/** C 阶段：服务完成确认表单 */
export function StepFormCComplete({ data, readOnly = false, role = "staff", onSave }: {
  data?: Record<string, unknown>;
  readOnly?: boolean;
  role?: "staff" | "family";
  onSave?: (data: Record<string, unknown>) => void;
}) {
  const [items, setItems] = useState<Record<string, boolean>>(
    (data?.checklist as Record<string, boolean>) || {
      "测验已完成": false,
      "咨询已全部完成": false,
      "心理辅导已完成（如适用）": false,
      "全款已结清": false,
      "服务记录已归档": false,
    }
  );
  const [staffSign, setStaffSign] = useState((data?.staffSignature as boolean) || false);
  const [familySign, setFamilySign] = useState((data?.familySignature as boolean) || false);
  const [familySignTime, setFamilySignTime] = useState((data?.familySignTime as string) || "");

  const toggleItem = (key: string) => {
    if (readOnly) return;
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const canComplete = (role === "staff" && staffSign) || (role === "family" && familySign);

  const handleSave = () => {
    if (role === "family" && !familySignTime) {
      alert("请填写签字时间");
      return;
    }
    onSave?.({
      checklist: items,
      staffSignature: staffSign,
      familySignature: familySign,
      familySignTime: role === "family" ? (familySignTime || new Date().toISOString()) : undefined,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-bridge-green border-b border-white/10 pb-2">
        ✓ 服务完成确认
      </h3>

      <div className="space-y-2">
        {Object.entries(items).map(([key, checked]) => (
          <label key={key} className="flex items-center gap-3 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleItem(key)}
              disabled={readOnly || role === "family"}
              className="w-4 h-4 accent-green-500"
            />
            <span className={`text-sm ${checked ? "line-through text-bridge-muted" : "text-bridge-text"}`}>
              {key}
            </span>
          </label>
        ))}
      </div>

      <div className={`p-3 rounded-lg border ${staffSign ? "border-green-500/30 bg-green-500/5" : "border-white/10"}`}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={staffSign}
            onChange={(e) => setStaffSign(e.target.checked)}
            disabled={readOnly || role !== "staff"}
            className="w-4 h-4 accent-green-500"
          />
          <span className="text-sm font-semibold text-green-400">
            引导员确认签字
          </span>
        </label>
      </div>

      <div className={`p-3 rounded-lg border ${familySign ? "border-blue-500/30 bg-blue-500/5" : "border-white/10"}`}>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={familySign}
            onChange={(e) => setFamilySign(e.target.checked)}
            disabled={readOnly || role !== "family"}
            className="w-4 h-4 accent-blue-500"
          />
          <span className="text-sm font-semibold text-blue-400">
            家庭确认签字
          </span>
        </label>
      </div>

      {role === "family" && familySign && (
        <div>
          <label className="block text-xs text-bridge-muted mb-1">确认时间（精确到分钟）</label>
          <input
            type="datetime-local"
            value={familySignTime}
            onChange={(e) => setFamilySignTime(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-sm focus:outline-none focus:border-bridge-blue"
          />
        </div>
      )}

      {!readOnly && (
        <button
          onClick={handleSave}
          disabled={!canComplete}
          className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
            canComplete
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {canComplete ? "最终确认完成" : `等待${role === "staff" ? "引导员" : "家庭"}签字`}
        </button>
      )}
    </div>
  );
}