"use client";

import { useState, useEffect, useRef } from "react";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import type { PackageId } from "@/lib/tracker-types";
import { PACKAGES } from "@/lib/tracker-packages";
import { getAllOrders, createOrder as apiCreateOrder, generateFamilyCode } from "@/lib/fireorm";
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

export default function TrackerConsole({ onLogout }: { onLogout: () => void }) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorAge, setVisitorAge] = useState("");
  const [visitorGrade, setVisitorGrade] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageId | "">("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [error, setError] = useState("");
  const [ordersList, setOrdersList] = useState<EnrichedOrder[]>([]);
  const [activeOrderNo, setActiveOrderNo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 加载订单列表
  const loadOrders = async () => {
    try {
      const orders = await getAllOrders();
      const enriched: EnrichedOrder[] = orders.map(o => ({
        orderNo: o.orderNo,
        familyCode: (o as Record<string, unknown>).familyCode as string || "N/A",
        createdAt: o.createdAt,
        visitorName: o.visitor?.name || "未知",
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

  const handleCreateOrder = async () => {
    setError("");
    if (!visitorName.trim()) { setError("请输入来访者姓名"); return; }
    if (!selectedPackage) { setError("请选择套餐"); return; }

    setLoading(true);
    try {
      const code = generateFamilyCode();
      await apiCreateOrder(
        code,
        selectedPackage,
        { name: visitorName.trim(), age: visitorAge.trim(), grade: visitorGrade.trim() }
      );

      setConfirmMsg(`订单已创建，家庭联合码：${code}（请告知家长）`);
      setVisitorName("");
      setVisitorAge("");
      setVisitorGrade("");
      setSelectedPackage("");
      await loadOrders();
    } catch (err) {
      setError(`创建失败: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 导入订单数据（保留本地导入功能）
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const order = JSON.parse(ev.target?.result as string);
        if (!order.orderNo) throw new Error("无效订单数据");

        // 通过 API 导入
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

  // 导出全部订单列表
  const handleExportAll = () => {
    if (ordersList.length === 0) { setError("暂无订单数据"); return; }
    const blob = new Blob([JSON.stringify(ordersList, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge_orders_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 如果处于订单流程跟进状态，则渲染 TrackerMain 页面（以 staff 身份）
  if (activeOrderNo) {
    return (
      <TrackerMain
        session={{
          role: "staff",
          code: "ADMIN",
          orderNo: activeOrderNo,
          loginAt: new Date().toISOString(),
          contactName: "引导员",
        }}
        orderNo={activeOrderNo}
        onLogout={() => {
          setActiveOrderNo("");
          loadOrders();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* 顶部标题栏 & 退出登录 */}
        <div className="glass-panel p-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-bridge-blue font-serif">引导员控制台</h1>
            <p className="text-xs text-bridge-muted">管理服务流程与客户订单</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-xs text-bridge-muted hover:text-red-500 border border-white/30 rounded-lg transition-colors cursor-pointer"
          >
            退出登录
          </button>
        </div>

        {/* 创建订单 */}
        <GlassCard className="p-5 mb-4">
          <h2 className="text-sm font-bold text-bridge-blue mb-3">创建新服务订单</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-bridge-blue mb-1">来访者姓名</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => {
                  setVisitorName(e.target.value);
                  setError("");
                }}
                placeholder="请输入来访者姓名"
                className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue"
              />
            </div>

            {/* 年龄 & 年级 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-bridge-blue mb-1">年龄（选填）</label>
                <input
                  type="text"
                  value={visitorAge}
                  onChange={(e) => setVisitorAge(e.target.value)}
                  placeholder="如: 17"
                  className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-bridge-blue mb-1">年级（选填）</label>
                <input
                  type="text"
                  value={visitorGrade}
                  onChange={(e) => setVisitorGrade(e.target.value)}
                  placeholder="如: 高三"
                  className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-bridge-blue mb-1">选择套餐</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PACKAGES) as PackageId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      setSelectedPackage(id);
                      setError("");
                    }}
                    className={`p-2 rounded-lg text-xs text-left border transition-colors ${
                      selectedPackage === id
                        ? "bg-bridge-blue/15 text-bridge-blue border-bridge-blue font-semibold"
                        : "bg-white/20 text-bridge-text border-white/30 hover:bg-white/30"
                    }`}
                  >
                    {PACKAGES[id].name}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            {confirmMsg && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-xs text-green-700">
                {confirmMsg}
              </div>
            )}
            <Button variant="primary" onClick={handleCreateOrder} className="w-full" disabled={loading}>
              {loading ? "创建中..." : "生成订单与家庭联合码"}
            </Button>
          </div>
        </GlassCard>

        {/* 订单管理列表 */}
        <GlassCard className="p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-bridge-blue">服务订单跟进列表</h2>
            <button
              onClick={loadOrders}
              className="text-xs text-bridge-muted hover:text-bridge-blue cursor-pointer bg-transparent border-0"
            >
              刷新
            </button>
          </div>
          {ordersList.length === 0 ? (
            <p className="text-xs text-bridge-muted text-center py-6">暂无服务订单，请在上方创建新订单</p>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {ordersList.map((o) => (
                <div key={o.orderNo} className="p-3 rounded-lg border border-white/40 bg-white/10 flex items-center justify-between text-xs gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-bridge-text text-sm">{o.visitorName}</span>
                      <span className="text-[10px] bg-bridge-blue/10 text-bridge-blue px-1.5 py-0.5 rounded font-mono">
                        {o.familyCode}
                      </span>
                    </div>
                    <div className="text-[10px] text-bridge-muted mt-1">
                      套餐：{o.packageId ? PACKAGES[o.packageId]?.name : "未知套餐"}
                      {o.visitorAge && ` · ${o.visitorAge}岁`}
                      {o.visitorGrade && ` · ${o.visitorGrade}`}
                    </div>
                    <div className="text-[10px] text-bridge-muted font-mono">
                      建档时间：{new Date(o.createdAt).toLocaleString("zh-CN", { hour12: false })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveOrderNo(o.orderNo)}
                      className="px-2.5 py-1.5 text-xs font-bold text-white bg-bridge-blue hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                    >
                      跟进流程
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* 数据管理 */}
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-bridge-blue mb-3">数据备份</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handleExportAll}>
              导出全部订单列表
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              导入订单 JSON
            </Button>
          </div>
          <p className="text-[10px] text-bridge-muted mt-2">
            服务器存储订单数：{ordersList.length}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}