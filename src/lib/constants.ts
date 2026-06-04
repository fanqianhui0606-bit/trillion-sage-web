// ============================================================
// 14-dimension order — single source of truth
// All scoring, charting, and data loading MUST reference this.
// ============================================================

export const DIMENSION_ORDER = [
  "抽象",
  "操作",
  "记忆",
  "空间",
  "整理",
  "观察",
  "执行",
  "好奇",
  "计算",
  "推导",
  "自主",
  "联想",
  "构建",
  "自学",
] as const;

export type DimensionKey = (typeof DIMENSION_ORDER)[number];

export const DIMENSION_COUNT = DIMENSION_ORDER.length;

// ============================================================
// 3D graph — level metadata
// ============================================================

export const LEVEL_LABELS: Record<number, string> = {
  1: "一级基础能力",
  2: "二级进阶能力",
  3: "三级高级能力",
  4: "四级综合能力",
};

export const LEVEL_COLORS: Record<number, string> = {
  1: "#2d7dd2",
  2: "#38a169",
  3: "#7c3aed",
  4: "#f59e0b",
};

export const LEVEL_NODES: Record<number, readonly string[]> = {
  1: ["抽象", "操作", "执行", "整理", "记忆", "观察", "好奇"],
  2: ["计算", "推导", "空间", "联想"],
  3: ["构建", "自主"],
  4: ["自学"],
};

// ============================================================
// Simple edition defaults
// ============================================================

/** 体验版默认锁定的 6 个维度 */
export const SIMPLE_LOCKED_DIMENSIONS = [
  "记忆",
  "整理",
  "联想",
  "好奇",
  "自学",
  "构建",
] as const;

/** 完整 14 维展示顺序（体验版结果页用，包含锁定维度） */
export const FULL_DIMENSION_ORDER = [
  "抽象",
  "操作",
  "记忆",
  "空间",
  "整理",
  "观察",
  "执行",
  "好奇",
  "计算",
  "推导",
  "自主",
  "联想",
  "构建",
  "自学",
] as const;

// ============================================================
// Scoring calibration constants
// ============================================================

export const HABITS_WEIGHT = 0.2;
export const ABILITY_WEIGHT = 0.8;
export const DIMENSION_CAP = 5;
export const OBJECTIVE_WEIGHT = 1;
export const SUBJECTIVE_WEIGHT = 0;

// ============================================================
// Value orientation
// ============================================================

export const VALUE_TIER_COUNT = 5;

// ============================================================
// 3D glow mapping
// ============================================================

export const GLOW_POWER = 1.35;
export const GLOW_EMISSIVE_MIN = 0.12;
export const GLOW_EMISSIVE_RANGE = 2.35;
export const GLOW_HALO_OPACITY_MIN = 0.08;
export const GLOW_HALO_OPACITY_RANGE = 0.52;
export const GLOW_HALO_RING_BASE = 0.86;
export const GLOW_HALO_RING_FACTOR = 0.178;

// ============================================================
// 3D spring physics
// ============================================================

export const SPRING_FORCE_FACTOR = 0.035;
export const SPRING_OFFSET_FACTOR = 1.6;
export const SPRING_LINEAR_FACTOR = 0.02;
export const SPRING_DAMPING = 0.84;
export const SPRING_MAX_OFFSET = 2.1;

export const EDGE_SPRING_STIFFNESS = 0.22;
export const EDGE_SPRING_DAMPING = 0.86;

// ============================================================
// 3D camera defaults
// ============================================================

export const DEFAULT_CAMERA_POSITION: [number, number, number] = [5.8, 4.2, 7.2];
export const DEFAULT_CAMERA_FOV = 50;
