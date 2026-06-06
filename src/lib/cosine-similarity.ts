import { DIMENSION_ORDER } from "./constants";
import type { CompetencyVector, MajorMatchResult, Level2Major } from "./types";

function dotProduct(
  u: CompetencyVector,
  p: CompetencyVector,
  weights: Record<string, number>,
  dimensionOrder: readonly string[]
): number {
  let sum = 0;
  for (const d of dimensionOrder) {
    const w = weights[d] ?? 1;
    const uv = u[d] ?? 0;
    const pv = p[d] ?? 3; // missing profile value defaults to neutral (3)
    sum += w * uv * pv;
  }
  return sum;
}

function magnitude(
  v: CompetencyVector,
  weights: Record<string, number>,
  dimensionOrder: readonly string[]
): number {
  let sum = 0;
  for (const d of dimensionOrder) {
    const w = weights[d] ?? 1;
    const val = v[d] ?? 0;
    sum += w * val * val;
  }
  return Math.sqrt(sum);
}

const EPSILON = 1e-10;

export function weightedCosineSimilarity(
  user: CompetencyVector,
  profile: CompetencyVector,
  weights: Record<string, number> = {},
  dimensionOrder: readonly string[] = DIMENSION_ORDER
): number {
  const dot = dotProduct(user, profile, weights, dimensionOrder);
  const magU = magnitude(user, weights, dimensionOrder);
  const magP = magnitude(profile, weights, dimensionOrder);
  return dot / (magU * magP + EPSILON);
}

export function rankMajors(
  userVector: CompetencyVector,
  level2Majors: Level2Major[],
  dimensionWeights: Record<string, number> = {},
  dimensionOrder?: readonly string[]
): MajorMatchResult[] {
  const dims = dimensionOrder ?? DIMENSION_ORDER;
  return level2Majors
    .map((major) => ({
      majorId: major.id,
      majorName: major.name,
      score: weightedCosineSimilarity(userVector, major.profile, dimensionWeights, dims),
      officialIntro: major.officialIntro,
      parents: major.parents,
    }))
    .sort((a, b) => b.score - a.score);
}

export function topKMajors(
  matches: MajorMatchResult[],
  k: number = 5
): MajorMatchResult[] {
  return matches.slice(0, k);
}

export const INTEREST_SUBJECT_KEYS = ["数学", "物理", "化学", "生物", "计算机"];

export function normalizeInterestScores(
  subjectInterest: Record<string, number> | undefined,
  opts: { min?: number; max?: number } = {}
): Record<string, number> {
  const min = opts.min ?? 1;
  const max = opts.max ?? 10;
  const span = max - min || 1;
  const out: Record<string, number> = {};
  for (const sub of INTEREST_SUBJECT_KEYS) {
    const v = Number(subjectInterest?.[sub] ?? (min + max) / 2);
    out[sub] = Math.max(0, Math.min(1, (v - min) / span));
  }
  return out;
}

export function l2InterestAffiliationVector(parents: string[]): Record<string, number> {
  const relevant = INTEREST_SUBJECT_KEYS.filter((s) => (parents || []).includes(s));
  const vec: Record<string, number> = {};
  if (!relevant.length) {
    for (const s of INTEREST_SUBJECT_KEYS) vec[s] = 0;
    return vec;
  }
  const w = 1 / relevant.length;
  for (const s of INTEREST_SUBJECT_KEYS) {
    vec[s] = relevant.includes(s) ? w : 0;
  }
  return vec;
}

export function interestMatchScore(
  subjectInterest: Record<string, number> | undefined,
  parents: string[],
  opts: { min?: number; max?: number } = {}
): number {
  const userNorm = normalizeInterestScores(subjectInterest, opts);
  const l2Vec = l2InterestAffiliationVector(parents);
  let num = 0;
  let du = 0;
  let dp = 0;
  for (const s of INTEREST_SUBJECT_KEYS) {
    const u = userNorm[s] || 0;
    const p = l2Vec[s] || 0;
    num += u * p;
    du += u * u;
    dp += p * p;
  }
  if (dp < 1e-9) return 0;
  return num / (Math.sqrt(du) * Math.sqrt(dp) + 1e-9);
}

export function valueOrientationMatchScore(
  userPractical01: number,
  majorPragmatism: number | undefined
): number {
  const userP = Math.max(0, Math.min(1, Number(userPractical01 ?? 0.5)));
  const majorP = Math.max(0, Math.min(1, Number(majorPragmatism ?? 0.5)));
  return 1 - Math.abs(userP - majorP);
}

export interface FourFactorWeights {
  value?: number;
  interest?: number;
  habits?: number;
  ability?: number;
}

export interface FourFactorInput {
  normH: CompetencyVector;
  normA: CompetencyVector;
  userPractical01: number;
  subjectInterest: Record<string, number> | undefined;
  dimensions: string[];
  weights: Record<string, number>;
  majors: Level2Major[];
  pragmatismByCode: Record<string, number>;
  factorWeights?: FourFactorWeights;
}

export function mergeObjectiveTracks(
  normH: CompetencyVector,
  normA: CompetencyVector,
  hw: number,
  aw: number,
  dimensions: readonly string[]
): CompetencyVector {
  const wsum = hw + aw || 1;
  const out: CompetencyVector = {};
  for (const d of dimensions) {
    out[d] = (hw * (normH?.[d] ?? 0) + aw * (normA?.[d] ?? 0)) / wsum;
  }
  return out;
}

export function rankMajorsFourFactor(input: FourFactorInput): MajorMatchResult[] {
  const {
    normH,
    normA,
    userPractical01,
    subjectInterest,
    dimensions,
    weights,
    majors,
    pragmatismByCode = {},
    factorWeights = {},
  } = input;

  const fw = {
    value: Number(factorWeights.value ?? 1),
    interest: Number(factorWeights.interest ?? 2),
    habits: Number(factorWeights.habits ?? 1),
    ability: Number(factorWeights.ability ?? 4),
  };
  const wSum = fw.value + fw.interest + fw.habits + fw.ability || 1;

  // Calculate similarity for habits
  const habitsScores = Object.fromEntries(
    majors.map((m) => [
      m.id,
      weightedCosineSimilarity(normH, m.profile, weights, dimensions),
    ])
  );

  // Calculate similarity for ability
  const abilityScores = Object.fromEntries(
    majors.map((m) => [
      m.id,
      weightedCosineSimilarity(normA, m.profile, weights, dimensions),
    ])
  );

  // Calculate legacy objective scores for comparison
  const mergedObj = mergeObjectiveTracks(normH, normA, 0.2, 0.8, dimensions);
  const legacyScores = Object.fromEntries(
    majors.map((m) => [
      m.id,
      weightedCosineSimilarity(mergedObj, m.profile, weights, dimensions),
    ])
  );

  const out: MajorMatchResult[] = majors.map((m) => {
    const valueSim = valueOrientationMatchScore(userPractical01, pragmatismByCode[m.id]);
    const interestSim = interestMatchScore(subjectInterest, m.parents || []);
    const habitsSim = habitsScores[m.id] ?? 0;
    const abilitySim = abilityScores[m.id] ?? 0;
    const score =
      (fw.value * valueSim +
        fw.interest * interestSim +
        fw.habits * habitsSim +
        fw.ability * abilitySim) /
      wSum;

    return {
      majorId: m.id,
      majorName: m.name,
      score,
      officialIntro: m.officialIntro,
      parents: m.parents,
      valueSim,
      interestSim,
      habitsSim,
      abilitySim,
      objectiveSimLegacy: legacyScores[m.id] ?? 0,
    };
  });

  out.sort((a, b) => b.score - a.score);
  return out;
}

/**
 * 校验激活码
 * 格式：TSG + 4位数字 (如 1024) + 5位校验和
 * 校验和生成逻辑：计算 "TSGxxxx" 每个字符与字符位置(1-based)乘积的累加和，并模 100000 补足 5 位
 */
export function validateActivationCode(code: string): boolean {
  const clean = code.trim().toUpperCase();
  if (clean === "TSG_ADMIN_PAGE") return true; // 后门，管理员激活码
  if (clean.length !== 12) return false;
  if (!clean.startsWith("TSG")) return false;
  
  const nums = clean.slice(3, 7);
  if (!/^\d{4}$/.test(nums)) return false;
  
  const content = "TSG" + nums;
  let sum = 0;
  for (let i = 0; i < content.length; i++) {
    sum += content.charCodeAt(i) * (i + 1);
  }
  const checksum = (sum % 100000).toString().padStart(5, "0");
  const inputChecksum = clean.slice(7);
  return checksum === inputChecksum;
}
