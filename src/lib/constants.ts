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

/** 维度 → 能力层级（由 LEVEL_NODES 反推） */
export const DIMENSION_LEVELS: Record<string, number> = Object.fromEntries(
  Object.entries(LEVEL_NODES).flatMap(([lvl, dims]) =>
    dims.map((d) => [d, Number(lvl)])
  )
);

/** 结果页呈现的分层均分层级（四级为单一维度「自学」，得分即其本身） */
export const LAYER_AVERAGE_LEVELS = [1, 2, 3] as const;

export interface LayerAverage {
  level: number;
  name: string;
  color: string;
  average: number | null;
  count: number;
}

/**
 * 计算各能力层级的平均得分（0–5）。
 * 锁定维度（体验版未测项）会被跳过，不参与均分。
 */
export function computeLayerAverages(
  scores: Record<string, number>,
  locked: readonly string[] = [],
  levels: readonly number[] = LAYER_AVERAGE_LEVELS
): LayerAverage[] {
  const lockedSet = new Set(locked);
  const buckets = new Map<number, number[]>();
  for (const [dim, raw] of Object.entries(scores || {})) {
    const lvl = DIMENSION_LEVELS[dim];
    if (!lvl || lockedSet.has(dim)) continue;
    const val = Number(raw);
    if (!Number.isFinite(val)) continue;
    if (!buckets.has(lvl)) buckets.set(lvl, []);
    buckets.get(lvl)!.push(val);
  }
  return levels.map((lvl) => {
    const arr = buckets.get(lvl) || [];
    const average = arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null;
    return {
      level: lvl,
      name: LEVEL_LABELS[lvl] || `第${lvl}层`,
      color: LEVEL_COLORS[lvl] || "#2563eb",
      average,
      count: arr.length,
    };
  });
}

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

export const GLOW_POWER = 1.85;
export const GLOW_EMISSIVE_MIN = 0.04;
export const GLOW_EMISSIVE_RANGE = 3.4;
export const GLOW_HALO_OPACITY_MIN = 0.02;
export const GLOW_HALO_OPACITY_RANGE = 0.78;
export const GLOW_HALO_RING_BASE = 0.72;
export const GLOW_HALO_RING_FACTOR = 0.22;

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
