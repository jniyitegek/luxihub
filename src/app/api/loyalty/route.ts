import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, handleRouteError, notFound, parseBody, requireUser } from '@/lib/api';
import { nextTierInfo, tierForPoints } from '@/lib/loyalty';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireUser();

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { loyaltyPoints: true, loyaltyTier: true },
    });
    if (!dbUser) throw notFound('User not found');

    const transactions = await prisma.loyaltyTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      points: dbUser.loyaltyPoints,
      tier: dbUser.loyaltyTier,
      ...nextTierInfo(dbUser.loyaltyPoints),
      transactions,
    });
  } catch (error) {
    return handleRouteError(error, 'loyalty GET');
  }
}

const redeemSchema = z.object({
  points: z.coerce.number().int().positive('Enter how many points to redeem'),
  description: z.string().trim().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { points, description } = await parseBody(req, redeemSchema);

    // The balance check and the debit run in one transaction so two concurrent
    // redemptions cannot both pass against the same balance.
    const result = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.findUnique({ where: { id: user.id }, select: { loyaltyPoints: true } });
      if (!dbUser) throw notFound('User not found');
      if (dbUser.loyaltyPoints < points) throw badRequest('You do not have enough points for this redemption');

      await tx.loyaltyTransaction.create({
        data: {
          userId: user.id,
          points: -points,
          type: 'REDEEMED',
          description: description || 'Points redeemed for a booking discount',
        },
      });

      const updated = await tx.user.update({
        where: { id: user.id },
        data: { loyaltyPoints: { decrement: points } },
      });

      const tier = tierForPoints(updated.loyaltyPoints);
      if (tier !== updated.loyaltyTier) {
        await tx.user.update({ where: { id: user.id }, data: { loyaltyTier: tier } });
      }

      return { points: updated.loyaltyPoints, tier };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleRouteError(error, 'loyalty POST');
  }
}
