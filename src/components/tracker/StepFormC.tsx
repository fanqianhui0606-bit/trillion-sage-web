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

  const label = isDeposit ? "定金确认（10%）" : "剩余款项确认";
  const amountLine = isDeposit
    ? `应付定金（自动计算 10%）：¥${expectedAmount} / 合约总额 ¥${price}`
    : `应付尾款：¥${expectedAmount} / 合约总额 ¥${price}`;

  return (
    <div className="space-y-4 text-sm md:text-base">
      <p className="text-base text-bridge-text text-left font-medium">{amountLine}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-bridge-muted mb-1 text-left">
            {isDeposit ? "定金支付日期" : "支付日期"}
            <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
              我方填写
            </span>
          </label>
          <input
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            disabled={readOnly || role === "family"}
            className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/10 text-base focus:outline-none focus:border-bridge-blue disabled:opacity-60"
          />
        </div>
        <div>
          <label className="block text-sm text-bridge-muted mb-1 text-left">
            支付订单号
            <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
              我方填写
            </span>
          </label>
          <input
            type="text"
            value={transactionNo}
            onChange={(e) => setTransactionNo(e.target.value)}
            disabled={readOnly || role === "family"}
            className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/10 text-base focus:outline-none focus:border-bridge-blue disabled:opacity-60"
            placeholder="由我方录入交易/订单号"
          />
        </div>
      </div>

      <label
        className={`flex items-start gap-2.5 p-3 rounded-lg border text-left ${
          paid ? "border-green-300 bg-green-50/50" : "border-white/40 bg-white/20"
        }`}
      >
        <input
          type="checkbox"
          checked={paid}
          onChange={(e) => {
            setPaid(e.target.checked);
            setReceiptConfirmed(e.target.checked);
            if (e.target.checked) setAmount(expectedAmount);
          }}
          disabled={readOnly || role === "family"}
          className="mt-1 w-4 h-4 accent-green-500"
        />
        <span className="text-base text-bridge-text leading-relaxed">
          已确认客户{isDeposit ? `定金 ¥${expectedAmount}` : `尾款 ¥${expectedAmount}`}{" "}
          已到账（支付在其它渠道完成，此处仅确认）。
          <span className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
            我方填写
          </span>
        </span>
      </label>

      {isDeposit && (
        <div className="rounded-lg border-l-4 border-bridge-gold bg-amber-50/80 px-4 py-3 text-left">
          <p className="text-base font-bold text-amber-900 mb-1.5">【定金重要提示】</p>
          <ul className="list-disc pl-5 text-sm text-amber-950/90 space-y-1 leading-relaxed">
            <li>本表所涉及的 10% 款项性质为法律规定的「定金」。</li>
            <li>若因客户个人原因放弃本次咨询，该定金不予退还；</li>
            <li>若因本公司原因未能提供对应教育产品，本公司将双倍返还定金。</li>
          </ul>
        </div>
      )}

      {!readOnly && role === "staff" && (
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3 rounded-lg font-bold text-base text-white bg-bridge-blue hover:bg-blue-600 transition-colors"
        >
          保存{label}
        </button>
      )}
    </div>
  );
}

/** C 阶段：服务完成确认表单（末环节完成后内嵌感谢内容） */
export function StepFormCComplete({
  data,
  readOnly = false,
  role = "staff",
  onSave,
  isFinal = false,
  completed = false,
  visitorName,
  packageName,
  staffName = "桥梁计划团队",
}: {
  data?: Record<string, unknown>;
  readOnly?: boolean;
  role?: "staff" | "family";
  onSave?: (data: Record<string, unknown>) => void;
  /** 是否为最终「服务完成确认」环节（决定是否显示感谢内容） */
  isFinal?: boolean;
  /** 该环节是否已完成 */
  completed?: boolean;
  visitorName?: string;
  packageName?: string;
  staffName?: string;
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

  const showThanks = isFinal && completed;

  return (
    <div className="space-y-4">
      {showThanks && (
        <div className="space-y-4 text-center pb-4 mb-2 border-b border-white/20">
          <div className="text-4xl animate-bounce">🎉</div>
          <div>
            <h3 className="text-xl font-bold text-bridge-blue font-sans mb-2">
              服务流程已全部完成
            </h3>
            <p className="text-base text-slate-600 leading-relaxed">
              感谢您选择「<span className="font-brand">桥梁计划</span>」，祝
              {visitorName ? ` ${visitorName} ` : "您"}
              在未来学业路上找到方向、一路顺利。
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
            <p className="text-sm text-green-700 font-semibold mb-1">已完成服务</p>
            <p className="text-sm text-green-600">套餐：{packageName || "—"}</p>
            <p className="text-sm text-green-600">
              引导员：<span className="font-brand">{staffName}</span>
            </p>
            <p className="text-sm text-green-600 mt-1">
              完成时间：
              {data?.completedAt
                ? new Date(data.completedAt as string).toLocaleString("zh-CN", { hour12: false })
                : new Date().toLocaleString("zh-CN", { hour12: false })}
            </p>
          </div>
          <div className="bg-bridge-blue/5 border border-bridge-blue/20 rounded-xl p-4 text-left">
            <p className="text-sm text-bridge-blue font-semibold mb-2">温馨提示</p>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>· 如有任何后续问题，请联系引导员</li>
              <li>· 测验结果可在「数理素质测验」页面重新访问</li>
              <li>· 如需续费或推荐朋友，可联系 13360455457</li>
            </ul>
          </div>
        </div>
      )}

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