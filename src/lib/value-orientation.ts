import type { ValueOrientationTier } from "./types";

const EPSILON = 1e-10;

export function calculatePracticalShare(
  interestAmbition: number,
  practicalBenefit: number
): number {
  return practicalBenefit / (interestAmbition + practicalBenefit + EPSILON);
}

export function getValueOrientationTier(
  practicalRaw: number,
  maxPractical: number,
  tiers: ValueOrientationTier[]
): ValueOrientationTier | null {
  const share = maxPractical > 0 ? practicalRaw / maxPractical : 0;
  const tierIndex = Math.min(Math.floor(share * 5), 4);
  return tiers.find((t) => t.tier === tierIndex + 1) ?? tiers[tiers.length - 1] ?? null;
}
