import { LoyaltyTier } from './types';

/** Ordered high to low so the first match is the highest tier earned. */
export const TIER_THRESHOLDS: { tier: LoyaltyTier; minPoints: number }[] = [
  { tier: 'AMBASSADOR', minPoints: 2000 },
  { tier: 'CONNOISSEUR', minPoints: 500 },
  { tier: 'EXPLORER', minPoints: 0 },
];

export function tierForPoints(points: number): LoyaltyTier {
  return TIER_THRESHOLDS.find((t) => points >= t.minPoints)!.tier;
}

export function nextTierInfo(points: number): { nextTier: LoyaltyTier | null; pointsToNextTier: number } {
  const ascending = [...TIER_THRESHOLDS].sort((a, b) => a.minPoints - b.minPoints);
  const next = ascending.find((t) => t.minPoints > points);
  return next ? { nextTier: next.tier, pointsToNextTier: next.minPoints - points } : { nextTier: null, pointsToNextTier: 0 };
}
