/**
 * fireorm.ts
 * Firestore 数据库操作层
 * 替代 localStorage 实现实时同步
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
  Timestamp,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import type { TrackerOrder, TrackerSession } from "./tracker-types";

// ========================
// 集合路径
// ========================
const ORDERS_COLLECTION = "orders";
const SESSIONS_COLLECTION = "sessions";

// ========================
// 工具函数
// ========================

/** 生成 6 位家庭码 */
export function generateFamilyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** 将 localStorage 数据迁移到 Firestore */
export async function migrateOrderToFirestore(order: TrackerOrder): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, order.orderNo);
  const data = {
    ...order,
    updatedAt: serverTimestamp(),
    migratedAt: Timestamp.now(),
  };
  await setDoc(orderRef, data, { merge: true });
}

// ========================
// 订单 CRUD
// ========================

/** 创建新订单（团队成员操作） */
export async function createOrder(
  familyCode: string,
  packageId: TrackerOrder["packageId"],
  visitor: TrackerOrder["visitor"]
): Promise<TrackerOrder> {
  const orderNo = `BS${Date.now().toString(36).toUpperCase()}`;
  const orderRef = doc(db, ORDERS_COLLECTION, orderNo);

  const order: TrackerOrder = {
    orderNo,
    packageId,
    createdAt: new Date().toISOString(),
    visitor,
    deposit: { paid: false, amount: 0 },
    fullPayment: { paid: false, amount: 0 },
    steps: {},
    consults: [],
  };

  await setDoc(orderRef, {
    ...order,
    familyCode,
    updatedAt: serverTimestamp(),
    createdAt: Timestamp.fromDate(new Date(order.createdAt)),
  });

  return order;
}

/** 通过订单号获取订单 */
export async function getOrder(orderNo: string): Promise<TrackerOrder | null> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderNo);
  const snapshot = await getDoc(orderRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
  } as TrackerOrder;
}

/** 更新订单（自动合并） */
export async function updateOrder(
  orderNo: string,
  updates: Partial<TrackerOrder>
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderNo);
  await updateDoc(orderRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/** 完成步骤（原子更新） */
export async function completeStep(
  orderNo: string,
  stepId: string,
  data?: Record<string, unknown>
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderNo);
  await updateDoc(orderRef, {
    [`steps.${stepId}`]: {
      status: "completed",
      data,
      completedAt: Timestamp.now(),
    },
    updatedAt: serverTimestamp(),
  });
}

// ========================
// 实时订阅
// ========================

/** 订阅订单变化（实时同步） */
export function subscribeToOrder(
  orderNo: string,
  onUpdate: (order: TrackerOrder | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const orderRef = doc(db, ORDERS_COLLECTION, orderNo);

  return onSnapshot(
    orderRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }
      const data = snapshot.data();
      onUpdate({
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      } as TrackerOrder);
    },
    (error) => {
      if (onError) onError(error);
      console.error("Firestore subscription error:", error);
    }
  );
}

/** 通过家庭码查找订单（家庭端使用） */
export function subscribeToOrderByFamilyCode(
  familyCode: string,
  onUpdate: (order: TrackerOrder | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where("familyCode", "==", familyCode),
    orderBy("createdAt", "desc"),
    // 限制返回最近一条
  );

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(null);
        return;
      }
      const doc = snapshot.docs[0];
      const data = doc.data();
      onUpdate({
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      } as TrackerOrder);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

// ========================
// 团队订单列表
// ========================

/** 获取所有订单（分页，团队端使用） */
export function subscribeToAllOrders(
  onUpdate: (orders: TrackerOrder[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    orderBy("createdAt", "desc")
    // TODO: 添加分页 limit(50)
  );

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        } as TrackerOrder;
      });
      onUpdate(orders);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

// ========================
// 会话管理
// ========================

/** 保存会话到 localStorage（Firestore 不适合存临时会话） */
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