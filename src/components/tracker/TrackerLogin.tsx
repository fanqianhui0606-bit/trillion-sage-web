"use client";

import { useState } from "react";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import type { TrackerSession, TrackerRole } from "@/lib/tracker-types";
import { STORAGE_KEYS } from "@/lib/tracker-types";
import { findOrderByFamilyCode } from "@/lib/fireorm";
import { getGuideName } from "@/lib/tracker-guides";

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
  const [familyCode, setFamilyCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [familyError, setFamilyError] = useState("");
  const [familyLoading, setFamilyLoading] = useState(false);

  const [staffOpen, setStaffOpen] = useState(false);
  const [staffCode, setStaffCode] = useState("");
  const [staffError, setStaffError] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);

  const handleFamilyLogin = async () => {
    setFamilyError("");
    if (!validateFamilyCode(familyCode)) {
      setFamilyError("请输入正确的 6 位家庭联合码");
      return;
    }
    if (!contactName.trim()) {
      setFamilyError("请输入您的姓名");
      return;
    }

    setFamilyLoading(true);
    try {
      const order = await findOrderByFamilyCode(familyCode);
      if (!order) {
        setFamilyError("未找到对应的服务流程，请联系引导员确认家庭码");
        return;
      }
      const session: TrackerSession = {
        role: "family",
        code: familyCode.toUpperCase(),
        orderNo: order.orderNo,
        loginAt: new Date().toISOString(),
        contactName: contactName.trim(),
      };
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      onLogin(session, order.orderNo);
    } catch (err) {
      setFamilyError(`登录校验失败: ${(err as Error).message}`);
    } finally {
      setFamilyLoading(false);
    }
  };

  const handleStaffLogin = async () => {
    setStaffError("");
    if (!validateStaffCode(staffCode)) {
      setStaffError("请输入正确的 8 位团队成员码");
      return;
    }
    setStaffLoading(true);
    try {
      const code = staffCode.toUpperCase();
      const savedName = getGuideName(code);
      const session: TrackerSession = {
        role: "staff" as TrackerRole,
        code,
        orderNo: "",
        loginAt: new Date().toISOString(),
        contactName: savedName || "",
      };
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      onLogin(session, "");
    } catch (err) {
      setStaffError(`登录失败: ${(err as Error).message}`);
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.jpg"
            alt="千殊教育"
            className="w-14 h-14 rounded-full mx-auto mb-3 object-contain"
          />
          <h1 className="text-2xl font-bold text-bridge-blue font-sans">服务流程跟进</h1>
          <p className="text-sm text-bridge-muted mt-1 font-brand">桥梁计划 · 千殊教育</p>
        </div>

        <GlassCard className="p-6">
          <p className="text-sm text-bridge-muted leading-relaxed mb-4">
            请输入引导员为您创建的「家庭联合码」进入专属服务流程。
          </p>

          <div className="mb-4">
            <label className="block text-xs font-bold text-bridge-blue mb-1">您的姓名（必填）</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue transition-colors"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-bridge-blue mb-1">家庭联合码（6位）</label>
            <input
              type="text"
              value={familyCode}
              onChange={(e) => {
                setFamilyCode(e.target.value.toUpperCase());
                setFamilyError("");
              }}
              placeholder="请输入 6 位家庭联合码"
              maxLength={20}
              className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm font-mono text-bridge-text focus:outline-none focus:border-bridge-blue transition-colors tracking-widest"
            />
          </div>

          {familyError && (
            <p className="text-red-500 text-xs text-center mb-4">{familyError}</p>
          )}

          <Button variant="primary" onClick={handleFamilyLogin} className="w-full" disabled={familyLoading}>
            {familyLoading ? "登录中..." : "进入服务流程"}
          </Button>

          <p className="text-[10px] text-center text-bridge-muted mt-4 leading-relaxed">
            如尚未获取家庭联合码，请联系「
            <span className="font-brand">桥梁计划</span>
            」引导员获取。
          </p>
        </GlassCard>
      </div>

      {/* 右下角团队成员登录（仅需团队码） */}
      <div className="fixed right-4 bottom-4 z-40 text-right">
        <button
          type="button"
          onClick={() => {
            setStaffOpen((v) => !v);
            setStaffError("");
          }}
          className="px-3 py-1.5 text-xs rounded-lg border border-white/40 bg-white/30 text-bridge-muted hover:bg-white/60 hover:text-bridge-text backdrop-blur-sm transition-colors"
        >
          团队成员登录
        </button>
        {staffOpen && (
          <div className="mt-2 w-[280px] text-left rounded-xl border border-white/60 bg-white/95 shadow-lg p-4">
            <h3 className="text-sm font-bold text-bridge-blue mb-1">团队成员入口</h3>
            <p className="text-[11px] text-bridge-muted mb-3 leading-relaxed">
              输入团队成员码即可进入服务流程管理页（无需填写姓名）。
            </p>
            <input
              type="text"
              value={staffCode}
              onChange={(e) => {
                setStaffCode(e.target.value.toUpperCase());
                setStaffError("");
              }}
              placeholder="团队成员码（8位）"
              maxLength={20}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-mono tracking-widest focus:outline-none focus:border-bridge-blue mb-2"
            />
            {staffError && <p className="text-red-500 text-[11px] mb-2">{staffError}</p>}
            <button
              type="button"
              onClick={handleStaffLogin}
              disabled={staffLoading}
              className="w-full py-2 rounded-lg text-sm font-bold text-white bg-bridge-blue hover:bg-blue-600 disabled:opacity-50"
            >
              {staffLoading ? "登录中..." : "登录"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
