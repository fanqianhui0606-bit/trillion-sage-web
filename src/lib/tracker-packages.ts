/**
 * tracker-packages.ts
 * 套餐定义与步骤管线
 */

import type { PackageInfo, StepDefinition, PackageId } from "./tracker-types";

export const PACKAGES: Record<PackageId, PackageInfo> = {
  "1v1": {
    id: "1v1",
    name: "1v1 专业咨询",
    description: "单次 1v1 专业咨询，含前后确认与学长寄语",
    consultCount: 1,
    hasQuiz: false,
    hasCounseling: false,
    priceMin: 1499,
    priceMax: 1899,
  },
  "quiz-pro": {
    id: "quiz-pro",
    name: "数理素质测验专业版",
    description: "42 题全面测评，3D 素质图景与专业推荐",
    consultCount: 0,
    hasQuiz: true,
    hasCounseling: false,
    price: 499,
  },
  crystal: {
    id: "crystal",
    name: "水晶套餐",
    description: "数理测评 + 1 次咨询 + 联盟心理辅导",
    consultCount: 1,
    hasQuiz: true,
    hasCounseling: false, // 描述说有，实际不含心理辅导
    price: 1999,
  },
  silver: {
    id: "silver",
    name: "白银套餐",
    description: "数理测评 + 1 次咨询 + 联盟心理辅导",
    consultCount: 1,
    hasQuiz: true,
    hasCounseling: true,
    price: 2499,
  },
  gold: {
    id: "gold",
    name: "黄金套餐",
    description: "数理测评 + 3 次咨询 + 联盟心理辅导",
    consultCount: 3,
    hasQuiz: true,
    hasCounseling: true,
    price: 4799,
  },
};

/** 获取套餐实际总价 */
export function getPackagePrice(pkgId: PackageId): number {
  const pkg = PACKAGES[pkgId];
  if (!pkg) return 0;
  if (pkg.price != null) return pkg.price;
  return pkg.priceMin ?? pkg.priceMax ?? 0;
}

/** 计算定金金额（总价 × 10%） */
export function getDepositAmount(pkgId: PackageId): number {
  const total = getPackagePrice(pkgId);
  return Math.round(total * 0.1);
}

// 步骤定义（全局池，按需过滤）
export const ALL_STEPS: StepDefinition[] = [
  // --- A 阶段（参考 a-intake → a-consent → a-deposit 的三步）---
  { id: "a-visitor-info", phase: "A", label: "来访信息与套餐确认", description: "填写来访者姓名、年级，选择套餐" },
  { id: "a-privacy-policy", phase: "A", label: "阅读隐私政策", requires: "a-visitor-info" },
  // a-service-agreement 同时完成：阅读服务协议 + 来访意愿确认 + 家长意愿确认（svc_online 点击即等同于同意）
  { id: "a-service-agreement", phase: "A", label: "阅读服务协议（含意愿确认）", requires: "a-privacy-policy" },
  { id: "a-deposit", phase: "A", label: "定金支付确认（10%）", requires: "a-service-agreement" },

  // --- B 阶段：定金后，尾款 → 测验 → 咨询 → 心理辅导，按序排列（参考无并行依赖）---
  { id: "b-remaining", phase: "B", label: "剩余款项确认", requires: "a-deposit" },
  { id: "b-quiz-knowledge", phase: "B", label: "阅读测验须知", requires: "a-deposit" },
  {
    id: "b-quiz", phase: "B", label: "数理素质测验【专业版】",
    description: "完成测验后记录结果与 Top5 推荐",
    requires: "a-deposit",
  },

  { id: "b-consult-1-pre", phase: "B", label: "咨询1 · 拟定时间与事前确认", requires: "a-deposit" },
  { id: "b-consult-1-post", phase: "B", label: "咨询1 · 事后确认", requires: "a-deposit" },
  { id: "b-consult-2-pre", phase: "B", label: "咨询2 · 拟定时间与事前确认", requires: "a-deposit" },
  { id: "b-consult-2-post", phase: "B", label: "咨询2 · 事后确认", requires: "a-deposit" },
  { id: "b-consult-3-pre", phase: "B", label: "咨询3 · 拟定时间与事前确认", requires: "a-deposit" },
  { id: "b-consult-3-post", phase: "B", label: "咨询3 · 事后确认", requires: "a-deposit" },

  { id: "b-counseling-knowledge", phase: "B", label: "阅读心理辅导须知", requires: "a-deposit" },
  { id: "b-counseling", phase: "B", label: "联盟心理辅导", requires: "a-deposit" },

  // --- C 阶段：完成 ---
  { id: "c-inspection", phase: "C", label: "服务完成检验", requires: "b-remaining" },
  { id: "c-gifts", phase: "C", label: "赠送产品", requires: "c-inspection" },
  { id: "c-signature", phase: "C", label: "服务完成确认", requires: "c-gifts" },
  { id: "c-thanks", phase: "C", label: "感谢页", requires: "c-signature" },
];

/**
 * 根据套餐过滤出实际步骤
 */
export function getStepsForPackage(packageId: PackageId): StepDefinition[] {
  const pkg = PACKAGES[packageId];
  if (!pkg) return [];

  return ALL_STEPS.filter((s) => {
    if (s.phase === "A") return true;
    if (s.phase === "C") return true;
    if (s.phase === "B") {
      if (s.id === "b-quiz" || s.id === "b-quiz-knowledge") return pkg.hasQuiz;
      if (s.id.startsWith("b-consult")) {
        const n = parseInt(s.id.match(/b-consult-(\d+)/)?.[1] || "0");
        return n <= pkg.consultCount;
      }
      if (s.id.startsWith("b-counseling")) return pkg.hasCounseling;
      if (s.id === "b-remaining") return true;
    }
    return true;
  });
}

/** 判断步骤是否可以被激活（依赖全部满足） */
export function canActivateStep(
  stepId: string,
  stepStates: Record<string, { status: string }>
): boolean {
  const step = ALL_STEPS.find((s) => s.id === stepId);
  if (!step) return false;

  if (step.requires) {
    const deps = step.requires.split(",");
    return deps.every((d) => stepStates[d]?.status === "completed");
  }
  return true;
}

/** 判断 C 阶段是否可以进入（B 阶段所有业务完成） */
export function isBPhaseComplete(
  packageId: PackageId,
  stepStates: Record<string, { status: string }>
): boolean {
  const pkg = PACKAGES[packageId];
  if (!pkg) return false;

  const requiredB = ALL_STEPS.filter((s) => s.phase === "B").filter((s) => {
    if (s.id === "b-quiz" && pkg.hasQuiz) return true;
    if (s.id === "b-quiz-knowledge" && pkg.hasQuiz) return true;
    if (s.id.startsWith("b-consult")) {
      const n = parseInt(s.id.match(/b-consult-(\d+)/)?.[1] || "0");
      return n <= pkg.consultCount;
    }
    if (s.id.startsWith("b-counseling")) return pkg.hasCounseling;
    if (s.id === "b-remaining") return true;
    return false;
  });

  return requiredB.every((s) => stepStates[s.id]?.status === "completed");
}