import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleRouteError, parseBody, requireRole } from '@/lib/api';

export const dynamic = 'force-dynamic';

const mergeSchema = z.object({
  unregisteredId: z.string().trim().min(1, 'Unregistered placeholder ID or rating ID is required'),
  targetBusinessId: z.string().trim().min(1, 'Target registered business ID is required'),
});

export async function GET() {
  try {
    await requireRole('ADMIN');

    // Get all unregistered ratings
    const ratings = await prisma.serviceRating.findMany({
      where: { isUnregistered: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        serviceId: true,
        serviceName: true,
        serviceType: true,
        isUnregistered: true,
        rating: true,
        comment: true,
        reviewerName: true,
        createdAt: true,
      },
    });

    // Also get unverified businesses created from public reviews
    const unverifiedBusinesses = await prisma.business.findMany({
      where: { verificationSource: 'PUBLIC_REVIEW', isVerified: false },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        ratingAvg: true,
        reviewCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      unregisteredRatings: ratings.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      unverifiedBusinesses: unverifiedBusinesses.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })),
    });
  } catch (error) {
    return handleRouteError(error, 'unregistered-ratings GET');
  }
}

export async function POST(req: Request) {
  try {
    await requireRole('ADMIN');
    const input = await parseBody(req, mergeSchema);

    // Verify target registered business exists
    const targetBusiness = await prisma.business.findUnique({
      where: { id: input.targetBusinessId },
    });

    if (!targetBusiness) {
      return NextResponse.json({ success: false, error: 'Target registered business not found' }, { status: 404 });
    }

    // Find the placeholder business or ratings to merge
    const placeholderBusiness = await prisma.business.findFirst({
      where: {
        OR: [{ id: input.unregisteredId }, { slug: input.unregisteredId }],
        verificationSource: 'PUBLIC_REVIEW',
      },
    });

    let updatedCount = 0;

    if (placeholderBusiness) {
      // Re-assign all service ratings from placeholder to target business
      const result = await prisma.serviceRating.updateMany({
        where: { serviceId: placeholderBusiness.id },
        data: {
          serviceId: targetBusiness.id,
          serviceName: targetBusiness.name,
          isUnregistered: false,
        },
      });
      updatedCount = result.count;

      // Delete the placeholder business
      await prisma.business.delete({ where: { id: placeholderBusiness.id } });
    } else {
      // Merge single rating by ID
      const singleRating = await prisma.serviceRating.findUnique({
        where: { id: input.unregisteredId },
      });

      if (singleRating) {
        await prisma.serviceRating.update({
          where: { id: singleRating.id },
          data: {
            serviceId: targetBusiness.id,
            serviceName: targetBusiness.name,
            isUnregistered: false,
          },
        });
        updatedCount = 1;
      }
    }

    // Recalculate rating stats for target business
    const [publicStats, verifiedStats] = await Promise.all([
      prisma.serviceRating.aggregate({
        where: { serviceId: targetBusiness.id },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      prisma.review.aggregate({
        where: { businessId: targetBusiness.id },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);

    const publicCount = publicStats._count._all;
    const verifiedCount = verifiedStats._count._all;
    const total = publicCount + verifiedCount;

    if (total > 0) {
      const sum = (publicStats._avg.rating ?? 0) * publicCount + (verifiedStats._avg.rating ?? 0) * verifiedCount;
      await prisma.business.update({
        where: { id: targetBusiness.id },
        data: { ratingAvg: Number((sum / total).toFixed(2)), reviewCount: total },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully merged ${updatedCount} rating(s) into ${targetBusiness.name}`,
    });
  } catch (error) {
    return handleRouteError(error, 'unregistered-ratings POST');
  }
}
