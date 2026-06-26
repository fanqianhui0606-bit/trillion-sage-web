"use client";

import { useState, useRef } from "react";
import GlassCard from "@/components/shared/GlassCard";
import Button from "@/components/shared/Button";
import type { TrackerOrder } from "@/lib/tracker-types";
import { STORAGE_KEYS, orderStorageKey } from "@/lib/tracker-types";
import { PACKAGES } from "@/lib/tracker-packages";
import { AGREEMENTS } from "@/lib/tracker-agreements";
import type { PackageId } from "@/lib/tracker-types";

/** 生成 6 位家庭码 */
function generateFamilyCode(): string {
  return Math.random().toString(36).toUpperCase().slice(2, 8);
}

/** 创建新订单 */
function createOrder(packageId: PackageId, visitorName: string): TrackerOrder {
  const now = new Date();
  // 初始化所有步骤为 pending
  const steps: Record<string, { status: "pending" }> = {};
  for (const s of AGREEMENTS) {
    steps[s.stepId] = { status: "pending" };
  }
  return {
    orderNo: `QS${now.getTime()}`,
    packageId,
    createdAt: now.toISOString(),
    visitor: { name: visitorName, age: "", grade: "" },
    deposit: { paid: false, amount: 0 },
    fullPayment: { paid: false, amount: 0 },
    steps,
    consults: [],
  };
}

export default function TrackerConsole() {
  const [visitorName, setVisitorName] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<PackageId | "">("");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreateOrder = () => {
    setError("");
    if (!visitorName.trim()) { setError("请输入来访者姓名"); return; }
    if (!selectedPackage) { setError("请选择套餐"); return; }

    const order = createOrder(selectedPackage, visitorName.trim());
    const code = generateFamilyCode();

    // 保存订单
    localStorage.setItem(orderStorageKey(order.orderNo), JSON.stringify(order));

    // 更新订单列表
    const ordersRaw = localStorage.getItem(STORAGE_KEYS.ORDERS_LIST);
    const orders: Array<{ orderNo: string; familyCode: string; createdAt: string }> = ordersRaw
      ? JSON.parse(ordersRaw)
      : [];
    orders.push({ orderNo: order.orderNo, familyCode: code, createdAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.ORDERS_LIST, JSON.stringify(orders));

    setFamilyCode(code);
    setConfirmMsg(`订单已创建，家庭联合码：${code}（请告知家长）`);
  };

  // 导入订单数据
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const order = JSON.parse(ev.target?.result as string) as TrackerOrder;
        if (!order.orderNo) throw new Error("无效订单数据");
        localStorage.setItem(orderStorageKey(order.orderNo), JSON.stringify(order));
        const ordersRaw = localStorage.getItem(STORAGE_KEYS.ORDERS_LIST);
        const orders: Array<{ orderNo: string; familyCode: string; createdAt: string }> = ordersRaw
          ? JSON.parse(ordersRaw)
          : [];
        if (!orders.find((o) => o.orderNo === order.orderNo)) {
          orders.push({
            orderNo: order.orderNo,
            familyCode: generateFamilyCode(),
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem(STORAGE_KEYS.ORDERS_LIST, JSON.stringify(orders));
        }
        setConfirmMsg(`订单 ${order.orderNo} 导入成功`);
      } catch {
        setError("导入失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 导出全部订单列表
  const handleExportAll = () => {
    const ordersRaw = localStorage.getItem(STORAGE_KEYS.ORDERS_LIST);
    if (!ordersRaw) { setError("暂无订单数据"); return; }
    const blob = new Blob([ordersRaw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridge_orders_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-bridge-blue font-serif mb-6 text-center">
          引导员控制台
        </h1>

        {/* 创建订单 */}
        <GlassCard className="p-5 mb-4">
          <h2 className="text-sm font-bold text-bridge-blue mb-3">创建新服务订单</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-bridge-blue mb-1">来访者姓名</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="请输入来访者姓名"
                className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/20 text-sm text-bridge-text focus:outline-none focus:border-bridge-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-bridge-blue mb-1">选择套餐</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PACKAGES) as PackageId[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPackage(id)}
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
            <Button variant="primary" onClick={handleCreateOrder} className="w-full">
              生成订单与家庭联合码
            </Button>
          </div>
        </GlassCard>

        {/* 数据管理 */}
        <GlassCard className="p-5">
          <h2 className="text-sm font-bold text-bridge-blue mb-3">数据管理</h2>
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
            当前本地存储订单数：{JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS_LIST) || "[]").length}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}