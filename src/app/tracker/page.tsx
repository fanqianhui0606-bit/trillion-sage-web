"use client";

import { useState, useEffect } from "react";
import TrackerLogin from "@/components/tracker/TrackerLogin";
import TrackerMain from "@/components/tracker/TrackerMain";
import type { TrackerSession } from "@/lib/tracker-types";
import { STORAGE_KEYS } from "@/lib/tracker-types";

export default function TrackerPage() {
  const [session, setSession] = useState<TrackerSession | null>(null);
  const [orderNo, setOrderNo] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 检查是否有活跃会话
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) {
      try {
        const s = JSON.parse(raw) as TrackerSession;
        setSession(s);
        setOrderNo(s.orderNo);
      } catch {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (s: TrackerSession, no: string) => {
    setSession(s);
    setOrderNo(no);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
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

  return <TrackerMain session={session} orderNo={orderNo} onLogout={handleLogout} />;
}