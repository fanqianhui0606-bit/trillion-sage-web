/**
 * tracker-types.ts
 * 服务流程跟进系统类型定义
 */

// ========================
// 角色与登录
// ========================
export type TrackerRole = "family" | "staff";

export interface TrackerSession {
  role: TrackerRole;
  /** 家庭码（family）或团队成员码（staff） */
  code: string;
  /** 订单号 */
  orderNo: string;
  /** 登录时间 */
  loginAt: string;
  /** 联系人姓名 */
  contactName: string;
}

// ========================
// 套餐类型
// ========================
export type PackageId =
  | "1v1"          // 1v1 专业咨询
  | "quiz-pro"     // 数理素质测验专业版
  | "crystal"      // 水晶套餐
  | "silver"       // 白银套餐
  | "gold";        // 黄金套餐

export interface PackageInfo {
  id: PackageId;
  name: string;
  description: string;
  /** 咨询次数（0 表示无咨询） */
  consultCount: number;
  /** 是否含测验 */
  hasQuiz: boolean;
  /** 是否含心理辅导 */
  hasCounseling: boolean;
}

// ========================
// 步骤状态
// ========================
export type StepStatus = "pending" | "locked" | "active" | "completed" | "skipped";

export interface StepDefinition {
  id: string;
  /** 阶段前缀: A / B / C */
  phase: "A" | "B" | "C";
  label: string;
  description?: string;
  /** 完成后才解锁下一步的依赖步骤（逗号分隔 ID） */
  requires?: string;
  /** 属于哪个子业务: consult-1 / consult-2 / ... */
  business?: "quiz" | "consult-1" | "consult-2" | "consult-3" | "counseling";
  /** 是否在事后确认前需先完成事前确认 */
  postRequires?: string;
}

export interface StepState {
  status: StepStatus;
  /** 填充的数据 */
  data?: Record<string, unknown>;
  /** 完成时间 */
  completedAt?: string;
}

// ========================
// 流程数据完整结构
// ========================
export interface TrackerOrder {
  orderNo: string;
  familyCode?: string;
  packageId: PackageId;
  createdAt: string;
  /** 来访信息 */
  visitor: {
    name: string;
    age: string;
    grade: string;
    school?: string;
    phone?: string;
    wechat?: string;
    email?: string;
    isAdult?: boolean;
    parentName?: string;
    relationship?: string;
    contactTime?: string;
    parentTitle?: string;
    parentPhone?: string;
    parentWechat?: string;
    parentEmail?: string;
    packageId?: string;
  };
  /** 定金 */
  deposit: {
    paid: boolean;
    paidAt?: string;
    amount: number;
  };
  /** 全款 */
  fullPayment: {
    paid: boolean;
    paidAt?: string;
    amount: number;
  };
  /** 各步骤状态 */
  steps: Record<string, StepState>;
  /** 终止状态 */
  terminated?: {
    at: string;
    note: string;
  };
  /** 测验结果（可由结果页导入） */
  quizResult?: {
    topMajors: string[];
    pdfUrl?: string;
    completedAt?: string;
  };
  /** 咨询记录 */
  consults: Array<{
    pre: Record<string, unknown>;
    post: Record<string, unknown>;
  }>;
  /** 心理辅导记录 */
  counseling?: {
    psychologist?: string;
    time?: string;
    duration?: string;
  };
  // 服务完成
  completed?: {
    at: string;
    signature: boolean;
  };
}

// ========================
// storage 键名
// ========================
export const STORAGE_KEYS = {
  SESSION: "bridge_flow_session_v1",
  ORDERS_LIST: "bridge_flow_orders_v2",
  ORDER_PREFIX: "bridge_flow_tracker_v2::",
} as const;

export function orderStorageKey(orderNo: string) {
  return `${STORAGE_KEYS.ORDER_PREFIX}${orderNo}`;
}