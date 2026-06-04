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
