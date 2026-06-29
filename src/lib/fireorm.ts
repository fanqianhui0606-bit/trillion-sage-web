/**
 * fireorm.ts
 * 文件存储数据库操作层
 * 替代 localStorage，通过 API 与服务器文件交互
 */

import type { TrackerOrder, TrackerSession } from "./tracker-types";

// ========================
// 工具函数
// ========================

/** 生成 6 位家庭码 */
export function generateFamilyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** 生成订单号 */
export function generateOrderNo(): string {
  return `BS${Date.now().toString(36).toUpperCase()}`;
}

// ========================
// 订单 CRUD
// ========================

/** 获取所有订单（团队端使用） */
export async function getAllOrders(): Promise<TrackerOrder[]> {
  const res = await fetch("/api/tracker");
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  // 按时间倒序
  return (data.list || []).sort(
    (a: TrackerOrder, b: TrackerOrder) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** 获取单个订单 */
export async function getOrder(orderNo: string): Promise<TrackerOrder | null> {
  const res = await fetch(`/api/tracker/${orderNo}`);
  const data = await res.json();
  if (!data.success) {
    if (res.status === 404) return null;
    throw new Error(data.error);
  }
  return data.order;
}

/** 创建新订单 */
export async function createOrder(
  familyCode: string,
  packageId: TrackerOrder["packageId"],
  visitor: TrackerOrder["visitor"]
): Promise<TrackerOrder> {
  const order: TrackerOrder = {
    orderNo: generateOrderNo(),
    packageId,
    createdAt: new Date().toISOString(),
    visitor,
    deposit: { paid: false, amount: 0 },
    fullPayment: { paid: false, amount: 0 },
    steps: {},
    consults: [],
  };

  const res = await fetch("/api/tracker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...order, familyCode }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.order;
}

/** 更新订单 */
export async function updateOrder(
  orderNo: string,
  updates: Partial<TrackerOrder>
): Promise<void> {
  const res = await fetch(`/api/tracker/${orderNo}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

/** 完成步骤 */
export async function completeStep(
  orderNo: string,
  stepId: string,
  stepData?: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`/api/tracker/${orderNo}/step`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stepId, ...stepData }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

/** 通过家庭码查找订单（家庭端使用） */
export async function findOrderByFamilyCode(familyCode: string): Promise<TrackerOrder | null> {
  const res = await fetch(`/api/tracker?familyCode=${encodeURIComponent(familyCode)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.order || null;
}

/** 终止服务 */
export async function terminateOrder(orderNo: string, note: string): Promise<void> {
  const res = await fetch(`/api/tracker/${orderNo}/terminate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
}

// ========================
// 会话管理（localStorage 暂存）
// ========================

export function saveSession(session: TrackerSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("bridge_flow_session_v1", JSON.stringify(session));
}

export function getSession(): TrackerSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("bridge_flow_session_v1");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrackerSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("bridge_flow_session_v1");
}

// ========================
// 本地缓存（本地优先，减少 API 调用）
// ========================

const CACHE_PREFIX = "bridge_flow_cache::";

export function getCachedOrder(orderNo: string): TrackerOrder | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CACHE_PREFIX + orderNo);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrackerOrder;
  } catch {
    return null;
  }
}

export function setCachedOrder(order: TrackerOrder): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_PREFIX + order.orderNo, JSON.stringify(order));
}

export function clearCachedOrder(orderNo: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_PREFIX + orderNo);
}