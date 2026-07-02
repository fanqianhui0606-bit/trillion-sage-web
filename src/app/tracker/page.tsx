"use client";

import { useState, useEffect } from "react";
import TrackerLogin from "@/components/tracker/TrackerLogin";
import TrackerMain from "@/components/tracker/TrackerMain";
import TrackerConsole from "@/components/tracker/TrackerConsole";
import type { TrackerSession } from "@/lib/tracker-types";
import { STORAGE_KEYS } from "@/lib/tracker-types";

export default function TrackerPage() {
  const [session, setSession] = useState<TrackerSession | null>(null);
  const [orderNo, setOrderNo] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 检查是否有活跃会话（sessionStorage 仅在当前 tab 有效，避免跨 tab 状态串扰）
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) {
      try {
        const s = JSON.parse(raw) as TrackerSession;
        setSession(s);
        setOrderNo(s.orderNo);
      } catch {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (s: TrackerSession, no: string) => {
    setSession(s);
    setOrderNo(no);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    setSession(null);
    setOrderNo("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bridge-muted animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return <TrackerLogin onLogin={handleLogin} />;
  }

  // 团队成员 → 控制台
  if (session.role === "staff") {
    return <TrackerConsole onLogout={handleLogout} />;
  }

  // 家庭客户 → 流程跟进
  return <TrackerMain session={session} orderNo={orderNo} onLogout={handleLogout} />;
}