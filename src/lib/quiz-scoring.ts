import { DIMENSION_ORDER, DIMENSION_CAP, HABITS_WEIGHT, ABILITY_WEIGHT } from "./constants";
import type { Question, QuizConfig, CompetencyVector } from "./types";

type Track = "habits" | "ability";

interface RawScores {
  habits: Record<string, number>;
  ability: Record<string, number>;
  maxHabits: Record<string, number>;
  maxAbility: Record<string, number>;
}

export function accumulateRawScores(
  questions: Question[],
  answers: Record<string, string | string[]>,
  dimensionOrder: readonly string[] = DIMENSION_ORDER
): RawScores {
  const initDim = (): Record<string, number> => {
    const dims: Record<string, number> = {};
    for (const d of dimensionOrder) dims[d] = 0;
    return dims;
  };

  const raw: RawScores = {
    habits: initDim(),
    ability: initDim(),
    maxHabits: initDim(),
    maxAbility: initDim(),
  };

  for (const q of questions) {
    if (q.section !== "objective" || !q.objectiveTrack) continue;

    const track: Track = q.objectiveTrack;
    const trackRaw = track === "habits" ? raw.habits : raw.ability;
    const trackMax = track === "habits" ? raw.maxHabits : raw.maxAbility;

    const answer = answers[q.id];
    if (!answer) continue;

    const chosen = Array.isArray(answer) ? answer : [answer];

    for (const optId of chosen) {
      const option = q.options.find((o) => o.id === optId);
      if (!option) continue;
      for (const [dim, score] of Object.entries(option.scores)) {
        trackRaw[dim] = (trackRaw[dim] ?? 0) + score;
      }
    }

    // Accumulate max possible scores for normalization
    for (const [dim, maxScore] of Object.entries(q.maxScores)) {
      trackMax[dim] = (trackMax[dim] ?? 0) + maxScore;
    }
  }

  return raw;
}

function normalizeDimension(
  raw: number,
  max: number,
  cap: number = DIMENSION_CAP
): number {
  if (max === 0) return 0;
  return Math.max(0, Math.min(cap, (raw / max) * cap));
}

export function normalizeTrack(
  raw: Record<string, number>,
  maxPossible: Record<string, number>,
  cap: number = DIMENSION_CAP,
  dimensionOrder: readonly string[] = DIMENSION_ORDER
): CompetencyVector {
  const result: CompetencyVector = {};
  for (const d of dimensionOrder) {
    result[d] = normalizeDimension(raw[d] ?? 0, maxPossible[d] ?? 0, cap);
  }
  return result;
}

export function blendTracks(
  normH: CompetencyVector,
  normA: CompetencyVector,
  wH: number = HABITS_WEIGHT,
  wA: number = ABILITY_WEIGHT,
  dimensionOrder: readonly string[] = DIMENSION_ORDER
): CompetencyVector {
  const result: CompetencyVector = {};
  const totalW = wH + wA;
  for (const d of dimensionOrder) {
    result[d] = (wH * (normH[d] ?? 0) + wA * (normA[d] ?? 0)) / totalW;
  }
  return result;
}

export function computeObjectiveScores(
  questions: Question[],
  answers: Record<string, string | string[]>,
  config?: QuizConfig,
  dimensionOrder?: readonly string[]
): CompetencyVector {
  const dims = dimensionOrder ?? DIMENSION_ORDER;
  const { habits, ability, maxHabits, maxAbility } = accumulateRawScores(
    questions,
    answers,
    dims
  );

  const cap = config?.scoringCalibration?.objectiveDimensionCap ?? DIMENSION_CAP;
  const wH = config?.scoringCalibration?.objectiveHabitsWeight ?? HABITS_WEIGHT;
  const wA = config?.scoringCalibration?.objectiveAbilityWeight ?? ABILITY_WEIGHT;

  const normH = normalizeTrack(habits, maxHabits, cap, dims);
  const normA = normalizeTrack(ability, maxAbility, cap, dims);
  return blendTracks(normH, normA, wH, wA, dims);
}
