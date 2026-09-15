import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, clientIp, handleRouteError, jsonError, parseBody, parseQuery } from '@/lib/api';
import { env } from '@/lib/env';
import { consume } from '@/lib/rateLimit';

/**
 * Public, unauthenticated service ratings.
 *
 * Because anyone can post here, submissions are defended by a honeypot field,
 * per-IP rate limits, and a per-service cool-down. The visitor's IP is never
 * stored in the clear — only a salted SHA-256 digest, which is enough to group
 * repeat submissions without retaining personal data.
 */

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  serviceId: z.string().trim().min(1, 'Service ID is required').max(200),
  serviceName: z.string().trim().max(200).optional(),
  rating: z.coerce.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(2000).optional(),
  reviewerName: z.string().trim().max(80).optional(),
  hp_field: z.string().max(200).optional(),
});

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`${ip}|${env.RATING_IP_SALT}`).digest('hex');
}

export async function POST(req: Request) {
  try {
    const input = await parseBody(req, createSchema);

    // Honeypot: a real browser leaves this hidden field empty.
    if (input.hp_field && input.hp_field.trim() !== '') {
      throw badRequest('Spam submission detected');
    }

    const ipHash = hashIp(clientIp(req));

    if (!consume(`rating:ip:${ipHash}`, 5, 10 * 60).allowed) {
      return jsonError('You have submitted too many ratings recently. Please try again later.', 429);
    }
    if (!consume(`rating:service:${ipHash}:${input.serviceId}`, 1, 3 * 60).allowed) {
      return jsonError('You have already rated this service. Please wait a few minutes before rating again.', 429);
    }

    // A rating may reference a listing by id or slug, or one of its packages.
    let business = await prisma.business.findFirst({
      where: { OR: [{ id: input.serviceId }, { slug: input.serviceId }] },
    });
    let serviceName = input.serviceName?.trim() || 'Verified Luxury Service';

    if (business) {
      serviceName = business.name;
    } else {
      const offering = await prisma.serviceOffering.findUnique({
        where: { id: input.serviceId },
        include: { business: true },
      });
      if (offering) {
        serviceName = `${offering.title} (${offering.business.name})`;
        business = offering.business;
      }
    }

    const rating = await prisma.serviceRating.create({
      data: {
        serviceId: input.serviceId,
        serviceName,
        rating: input.rating,
        comment: input.comment || null,
        reviewerName: input.reviewerName || 'Anonymous',
        ipHash,
      },
    });

    if (business) {
      await recalculateBusinessRating(business.id, business.slug);
    }

    return NextResponse.json(
      {
        success: true,
        rating: {
          id: rating.id,
          serviceId: rating.serviceId,
          serviceName: rating.serviceName,
          rating: rating.rating,
          comment: rating.comment,
          reviewerName: rating.reviewerName,
          createdAt: rating.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error, 'ratings POST');
  }
}

/** Blends verified booking reviews with public ratings into one headline score. */
async function recalculateBusinessRating(businessId: string, slug: string) {
  const [publicStats, verifiedStats] = await Promise.all([
    prisma.serviceRating.aggregate({
      where: { serviceId: { in: [businessId, slug] } },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.review.aggregate({
      where: { businessId },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  const publicCount = publicStats._count._all;
  const verifiedCount = verifiedStats._count._all;
  const total = publicCount + verifiedCount;
  if (total === 0) return;

  const sum = (publicStats._avg.rating ?? 0) * publicCount + (verifiedStats._avg.rating ?? 0) * verifiedCount;

  await prisma.business.update({
    where: { id: businessId },
    data: { ratingAvg: Number((sum / total).toFixed(2)), reviewCount: total },
  });
}

const querySchema = z.object({
  serviceId: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: Request) {
  try {
    const { serviceId, limit } = parseQuery(req, querySchema);

    const ratings = await prisma.serviceRating.findMany({
      where: serviceId ? { serviceId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      // ipHash is an anti-abuse artefact and is never exposed.
      select: {
        id: true,
        serviceId: true,
        serviceName: true,
        rating: true,
        comment: true,
        reviewerName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      ratings: ratings.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    });
  } catch (error) {
    return handleRouteError(error, 'ratings GET');
  }
}
