import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function getDb(): any {
  const p = prisma as any;
  if (p && p.serviceRating) {
    return p;
  }
  return new PrismaClient() as any;
}



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      serviceId,
      serviceName,
      rating,
      comment,
      reviewerName,
      hp_field, // Honeypot field
    } = body;

    // 1. Honeypot check (anti-spam)
    if (hp_field && hp_field.trim() !== '') {
      return NextResponse.json(
        { error: 'Spam submission detected.' },
        { status: 400 }
      );
    }

    // 2. Data validation
    if (!serviceId || typeof serviceId !== 'string') {
      return NextResponse.json(
        { error: 'Service ID is required.' },
        { status: 400 }
      );
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5 stars.' },
        { status: 400 }
      );
    }

    // 3. Extract and hash client IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const rawIp = (forwarded ? forwarded.split(',')[0] : realIp) || '127.0.0.1';
    const ipHash = crypto
      .createHash('sha256')
      .update(`${rawIp.trim()}_HIGA_PUBLIC_RATING_SALT_2026`)
      .digest('hex');

    // 4. Rate-Limiting Anti-Spam checks
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const db = getDb();

    // Rate limit rule A: Max 5 total ratings per IP in 10 minutes
    const recentRatingsFromIpCount = await db.serviceRating.count({
      where: {
        ipHash,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentRatingsFromIpCount >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You have submitted too many ratings recently. Please try again later.' },
        { status: 429 }
      );
    }

    // Rate limit rule B: Duplicate rating for same service from same IP within 3 minutes
    const duplicateRating = await db.serviceRating.findFirst({
      where: {
        serviceId,
        ipHash,
        createdAt: { gte: threeMinutesAgo },
      },
    });

    if (duplicateRating) {
      return NextResponse.json(
        { error: 'You have recently submitted a rating for this service. Please wait a few minutes before rating again.' },
        { status: 429 }
      );
    }

    // 5. Determine display service name if not explicitly passed
    let finalServiceName = serviceName || 'Verified Luxury Service';
    let targetBusiness = await prisma.business.findFirst({
      where: {
        OR: [{ id: serviceId }, { slug: serviceId }],
      },
    });

    if (targetBusiness) {
      finalServiceName = targetBusiness.name;
    } else {
      // Check if it's a ServiceOffering ID
      const offering = await prisma.serviceOffering.findUnique({
        where: { id: serviceId },
        include: { business: true },
      });
      if (offering) {
        finalServiceName = `${offering.title} (${offering.business.name})`;
        targetBusiness = offering.business;
      }
    }

    const cleanReviewerName = reviewerName && reviewerName.trim() !== ''
      ? reviewerName.trim()
      : 'Anonymous';

    const cleanComment = comment && comment.trim() !== ''
      ? comment.trim()
      : null;

    // 6. Create ServiceRating record
    const newRating = await db.serviceRating.create({
      data: {
        serviceId,
        serviceName: finalServiceName,
        rating: ratingNum,
        comment: cleanComment,
        reviewerName: cleanReviewerName,
        ipHash,
      },
    });

    // 7. Update business rating statistics if tied to a Business
    if (targetBusiness) {
      const allPublicRatings: Array<{ rating: number }> = await db.serviceRating.findMany({
        where: {
          OR: [
            { serviceId: targetBusiness.id },
            { serviceId: targetBusiness.slug },
          ],
        },
        select: { rating: true },
      });

      const totalPublicRatings = allPublicRatings.length;
      const sumPublicRatings = allPublicRatings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0);

      // Also combine with verified booking reviews if any exist
      const verifiedReviews = await prisma.review.findMany({
        where: { businessId: targetBusiness.id },
        select: { rating: true },
      });

      const totalVerified = verifiedReviews.length;
      const sumVerified = verifiedReviews.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0);

      const grandTotalCount = totalPublicRatings + totalVerified;
      const grandSum = sumPublicRatings + sumVerified;
      const newRatingAvg = grandTotalCount > 0 ? Number((grandSum / grandTotalCount).toFixed(2)) : 5.0;

      await prisma.business.update({
        where: { id: targetBusiness.id },
        data: {
          ratingAvg: newRatingAvg,
          reviewCount: grandTotalCount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      rating: {
        id: newRating.id,
        serviceId: newRating.serviceId,
        serviceName: newRating.serviceName,
        rating: newRating.rating,
        comment: newRating.comment,
        reviewerName: newRating.reviewerName,
        createdAt: newRating.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error submitting public service rating:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing rating submission.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');
    const db = getDb();

    const whereClause: any = {};
    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    const ratings = await db.serviceRating.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const formatted = ratings.map((r: any) => ({
      id: r.id,
      serviceId: r.serviceId,
      serviceName: r.serviceName,
      rating: r.rating,
      comment: r.comment,
      reviewerName: r.reviewerName,
      createdAt: r.createdAt.toISOString(),
    }));


    return NextResponse.json({ success: true, ratings: formatted });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch public ratings' },
      { status: 500 }
    );
  }
}
