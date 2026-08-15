import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const TIER_THRESHOLDS: { tier: string; minPoints: number }[] = [
  { tier: 'AMBASSADOR', minPoints: 2000 },
  { tier: 'CONNOISSEUR', minPoints: 500 },
  { tier: 'EXPLORER', minPoints: 0 },
];

function tierForPoints(points: number): string {
  return TIER_THRESHOLDS.find((t) => points >= t.minPoints)!.tier;
}

function nextTierInfo(points: number): { nextTier: string | null; pointsToNextTier: number } {
  const ordered = [...TIER_THRESHOLDS].sort((a, b) => a.minPoints - b.minPoints);
  const next = ordered.find((t) => t.minPoints > points);
  return next ? { nextTier: next.tier, pointsToNextTier: next.minPoints - points } : { nextTier: null, pointsToNextTier: 0 };
}

// Loyalty Integration: fetch the caller's rewards status
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const { nextTier, pointsToNextTier } = nextTierInfo(dbUser.loyaltyPoints);

    return NextResponse.json({
      success: true,
      points: dbUser.loyaltyPoints,
      tier: dbUser.loyaltyTier,
      nextTier,
      pointsToNextTier,
      transactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch loyalty status' }, { status: 500 });
  }
}

// Redeem loyalty points (e.g. for booking discounts)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { points, description } = body;
    const redeemPoints = parseInt((points ?? '').toString(), 10);

    if (!redeemPoints || redeemPoints <= 0) {
      return NextResponse.json({ error: 'Invalid points amount' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || dbUser.loyaltyPoints < redeemPoints) {
      return NextResponse.json({ error: 'Insufficient loyalty points' }, { status: 400 });
    }

    await prisma.loyaltyTransaction.create({
      data: {
        userId: user.id,
        points: -redeemPoints,
        type: 'REDEEMED',
        description: description || 'Points redeemed for a booking discount',
      },
    });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        loyaltyPoints: { decrement: redeemPoints },
      },
    });

    const newTier = tierForPoints(updated.loyaltyPoints);
    if (newTier !== updated.loyaltyTier) {
      await prisma.user.update({ where: { id: user.id }, data: { loyaltyTier: newTier } });
    }

    return NextResponse.json({ success: true, points: updated.loyaltyPoints, tier: newTier });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to redeem points' }, { status: 500 });
  }
}
