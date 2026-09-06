"use client";

import { useState, useEffect, useRef } from "react";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import type { PackageId, TrackerSession } from "@/lib/tracker-types";
import { STORAGE_KEYS } from "@/lib/tracker-types";
import { PACKAGES } from "@/lib/tracker-packages";
import { getAllOrders, createBlankOrder, generateFamilyCode } from "@/lib/fireorm";
import { getGuideName, setGuideName } from "@/lib/tracker-guides";
import TrackerMain from "./TrackerMain";

export interface EnrichedOrder {
  orderNo: string;
  familyCode: string;
  createdAt: string;
  visitorName: string;
  visitorAge?: string;
  visitorGrade?: string;
  packageId?: PackageId;
}

export default function TrackerConsole({
  session,
  onLogout,
}: {
  session: TrackerSession;
  onLogout: () => void;
}) {
  const [guideName, setGuideNameState] = useState("");
  const [guideMsg, setGuideMsg] = useState("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [error, setError] = useState("");
  const [ordersList, setOrdersList] = useState<EnrichedOrder[]>([]);
  const [activeOrderNo, setActiveOrderNo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGuideNameState(getGuideName(session.code) || session.contactName || "");
  }, [session.code, session.contactName]);

  const loadOrders = async () => {
    try {
      const orders = await getAllOrders();
      const enriched: EnrichedOrder[] = orders.map((o) => ({
        orderNo: o.orderNo,
        familyCode: o.familyCode || "N/A",
        createdAt: o.createdAt,
        visitorName: o.visitor?.name || "（未填写姓名）",
        visitorAge: o.visitor?.age,
        visitorGrade: o.visitor?.grade,
        packageId: o.packageId,
      }));
      setOrdersList(enriched);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("加载订单列表失败");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSaveGuideName = () => {
    const name = guideName.trim().slice(0, 20);
    setGuideName(session.code, name);
    // 同步到当前会话
    const next: TrackerSession = { ...session, contactName: name };
    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(next));
    setGuideMsg(name ? "昵称已保存" : "已清除昵称");
    setTimeout(() => setGuideMsg(""), 2000);
  };

  const handleCreateOrder = async () => {
    setError("");
    setLoading(true);
    try {
      const name = getGuideName(session.code) || guideName.trim();
      const order = await createBlankOrder({
        createdBy: session.code,
        createdByName: name || undefined,
      });
      const code = order.familyCode || "—";
      setConfirmMsg(`订单已创建。家庭联合码：${code}（请告知家长）；姓名与套餐请在进入流程后的「来访信息」步骤填写。`);
      await loadOrders();
    } catch (err) {
      setError(`创建失败: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const order = JSON.parse(ev.target?.result as string);
        if (!order.orderNo) throw new Error("无效订单数据");
        const res = await fetch("/api/tracker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...order, familyCode: order.familyCode || generateFamilyCode() }),
        });
        const data = await res.json();
        if (data.success) {
          setConfirmMsg(`订单 ${order.orderNo} 导入成功`);
          await loadOrders();
        } else {
          setError(data.error || "导入失败");
        }
      } catch {
        setError("导入失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportAll = () => {
    if (ordersList.length === 0) {
      setError("暂无订单数据");
      return;
    }
    const blob = new Blob([JSON.stringify(ordersList, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge_orders_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (activeOrderNo) {
    const name = getGuideName(session.code) || guideName.trim() || "引导员";
    return (
      <TrackerMain
        session={{
          ...session,
          role: "staff",
          orderNo: activeOrderNo,
          contactName: name,
        }}
        orderNo={activeOrderNo}
        onLogout={() => {
          setActiveOrderNo("");
          loadOrders();
        }}
      />
    );
  }

  const displayWho = getGuideName(session.code) || guideName.trim() || session.code;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-panel p-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.jpg"
                alt=""
                className="w-11 h-11 rounded-full object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-bridge-blue font-sans">服务流程管理</h1>
                <p className="text-xs text-bridge-muted mt-0.5">
                  当前登录：{displayWho}
                  <span className="font-mono text-bridge-muted/80"> · 码 {session.code}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 text-xs text-bridge-muted hover:text-red-500 border border-white/30 rounded-lg flex-shrink-0"
            >
              退出登录
            </button>
          </div>

          {/* 引导员昵称：可显示与修改 */}
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[11px] font-bold text-bridge-blue mb-1">引导员昵称</label>
              <input
                type="text"
                value={guideName}
                onChange={(e) => setGuideNameState(e.target.value)}
                placeholder="如：王老师"
                maxLength={20}
                className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/30 text-sm focus:outline-none focus:border-bridge-blue"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveGuideName}
              className="px-4 py-2 text-xs font-bold text-bridge-blue border border-bridge-blue/35 rounded-lg bg-white/50 hover:bg-white"
            >
              保存昵称
            </button>
            {guideMsg && <span className="text-[11px] text-green-600">{guideMsg}</span>}
          </div>
        </div>

        {/* 工具栏：创建空白订单 + 备份 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button variant="primary" onClick={handleCreateOrder} disabled={loading}>
            {loading ? "创建中..." : "创建新服务订单"}
          </Button>
          <Button variant="ghost" onClick={handleExportAll}>
            导出订单列表
          </Button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="ghost" onClick={() => fileRef.current?.click()}>
            导入订单 JSON
          </Button>
          <button
            type="button"
            onClick={loadOrders}
            className="text-xs text-bridge-muted hover:text-bridge-blue px-2"
          >
            刷新
          </button>
        </div>
        <p className="text-[11px] text-bridge-muted mb-3 leading-relaxed">
          创建订单后生成家庭联合码；来访者姓名与套餐请在「进入引导员界面」后的流程步骤中填写。
        </p>

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        {confirmMsg && (
          <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700 leading-relaxed">
            {confirmMsg}
          </div>
        )}

        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-bridge-blue mb-3">服务订单跟进列表</h2>
          {ordersList.length === 0 ? (
            <p className="text-xs text-bridge-muted text-center py-10">暂无服务订单，请点击上方「创建新服务订单」</p>
          ) : (
            <div className="space-y-2.5 max-h-[28rem] overflow-y-auto pr-1">
              {ordersList.map((o) => (
                <div
                  key={o.orderNo}
                  className="p-3.5 rounded-xl border border-white/40 bg-white/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-bridge-text text-sm">{o.visitorName}</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-semibold">
                        进行中
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] bg-bridge-blue/10 text-bridge-blue px-1.5 py-0.5 rounded font-mono">
                        {o.familyCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(o.familyCode).then(() => {
                            setConfirmMsg(`已复制家庭联合码：${o.familyCode}`);
                          });
                        }}
                        className="text-[10px] text-bridge-muted hover:text-bridge-blue underline bg-transparent border-0 cursor-pointer"
                      >
                        复制
                      </button>
                    </div>
                    <div className="text-[10px] text-bridge-muted mt-1">
                      套餐：
                      {o.packageId && o.visitorName && o.visitorName !== "（未填写姓名）"
                        ? PACKAGES[o.packageId]?.name
                        : "（进入流程后选择）"}
                      {o.visitorAge && ` · ${o.visitorAge}岁`}
                      {o.visitorGrade && ` · ${o.visitorGrade}`}
                    </div>
                    <div className="text-[10px] text-bridge-muted font-mono">
                      {o.orderNo} · {new Date(o.createdAt).toLocaleString("zh-CN", { hour12: false })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveOrderNo(o.orderNo)}
                    className="px-3 py-2 text-xs font-bold text-white bg-bridge-blue hover:bg-blue-600 rounded-lg flex-shrink-0"
                  >
                    进入引导员界面
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-bridge-muted mt-3">服务器订单数：{ordersList.length}</p>
        </GlassCard>
      </div>
    </div>
  );
}
