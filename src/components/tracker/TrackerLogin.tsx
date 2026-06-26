"use client";

import { useState } from "react";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import type { TrackerSession, TrackerRole } from "@/lib/tracker-types";
import { STORAGE_KEYS } from "@/lib/tracker-types";

// 验证码：家庭码格式（6位字母数字），团队码格式（8位字母数字）
function validateFamilyCode(code: string): boolean {
  return /^[A-Za-z0-9]{6}$/.test(code);
}
function validateStaffCode(code: string): boolean {
  return /^[A-Za-z0-9]{8}$/.test(code);
}

export default function TrackerLogin({
  onLogin,
}: {
  onLogin: (session: TrackerSession, orderNo: string) => void;
}) {
  const [mode, setMode] = useState<"family" | "staff">("family");
  const [code, setCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [error, setError] = useState("");
  const handleCodeChange = (v: string) => {
    setCode(v.toUpperCase());
    setError("");
  };

  const handleLogin = () => {
    if (mode === "family") {
      if (!validateFamilyCode(code)) {
        setError("请输入正确的 6 位家庭联合码");
        return;
      }
    } else {
      if (!validateStaffCode(code)) {
        setError("请输入正确的 8 位团队成员码");
        return;
      }
    }

    if (!contactName.trim()) {
      setError("请输入您的姓名");
      return;
    }

    const role: TrackerRole = mode;
    // 家庭码：直接用码查找对应订单；团队码：验证后可创建订单
    if (role === "family") {
      // 检查 localStorage 中是否存在该家庭码的订单
      const ordersRaw = localStorage.getItem(STORAGE_KEYS.ORDERS_LIST);
      const orders: Array<{ orderNo: string; familyCode: string }> = ordersRaw
        ? JSON.parse(ordersRaw)
        : [];
      const order = orders.find((o) => o.familyCode === code);
      if (!order) {
        setError("未找到对应的服务流程，请联系引导员确认家庭码");
        return;
      }

      const session: TrackerSession = {
        role,
        code,
        orderNo: order.orderNo,
        loginAt: new Date().toISOString(),
        contactName: contactName.trim(),
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      onLogin(session, order.orderNo);
    } else {
      // 团队成员：内测阶段任意 8 位码可通过验证
      // 生成新订单号
      const orderNo = `QS${Date.now()}`;
      const session: TrackerSession = {
        role,
        code,
        orderNo,
        loginAt: new Date().toISOString(),
        contactName: contactName.trim(),
      };
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      onLogin(session, orderNo);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.jpg" alt="千殊教育" className="w-16 h-16 rounded-full mx-auto mb-3 object-contain" />
          <h1 className="text-xl font-bold text-bridge-blue font-serif">服务流程跟进</h1>
          <p className="text-xs text-bridge-muted mt-1">桥梁计划 · 千殊教育</p>
        </div>

        <GlassCard className="p-6">
          {/* 入口切换 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode("family"); setShowStaffInput(false); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                mode === "family"
                  ? "bg-bridge-blue text-white border-bridge-blue"
                  : "bg-white/30 text-bridge-text border-white/30 hover:bg-white/50"
              }`}
            >
              家庭客户入口
            </button>
            <button
              onClick={() => { setMode("staff"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                mode === "staff"
                  ? "bg-bridge-blue text-white border-bridge-blue"
                  : "bg-white/30 text-bridge-text border-white/30 hover:bg-white/50"
              }`}
            >
              团队成员登录
            </button>
          </div>

          {/* 姓名 */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-bridge-blue mb-1">
              您的姓名（必填）
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue transition-colors"
            />
          </div>

          {/* 码输入 */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-bridge-blue mb-1">
              {mode === "family" ? "家庭联合码（6位）" : "团队成员码（8位）"}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={mode === "family" ? "请输入 6 位家庭联合码" : "请输入 8 位团队成员码"}
              maxLength={mode === "family" ? 6 : 8}
              className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm font-mono text-bridge-text focus:outline-none focus:border-bridge-blue transition-colors tracking-widest"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center mb-4 animate-shake">{error}</p>
          )}

          <Button variant="primary" onClick={handleLogin} className="w-full">
            进入服务流程
          </Button>

          {/* 家庭端说明 */}
          {mode === "family" && (
            <p className="text-[10px] text-center text-bridge-muted mt-4 leading-relaxed">
              如尚未获取家庭联合码，请联系「桥梁计划」引导员获取。
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
}