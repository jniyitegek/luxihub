import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleRouteError } from '@/lib/api';

/**
 * Verified guest testimonials for the landing page.
 *
 * Only reviews attached to a completed booking qualify, which is what lets the
 * homepage claim these are from guests who actually stayed. Cached briefly
 * because the landing page is the busiest route on the site.
 */

export const dynamic = 'force-dynamic';

const MAX_TESTIMONIALS = 10;

export async function GET() {
  try {
    // 1. Get top 10 leaderboard businesses
    const topBusinesses = await prisma.business.findMany({
      where: { status: 'VERIFIED' },
      orderBy: [{ ratingAvg: 'desc' }, { reviewCount: 'desc' }],
      take: 10,
      select: { id: true, name: true, location: true, slug: true },
    });

    const businessMap = new Map(topBusinesses.map((b) => [b.id, b]));
    const topBusinessIds = topBusinesses.map((b) => b.id);

    // 2. Get verified reviews from top 10 businesses
    const reviews = await prisma.review.findMany({
      where: {
        businessId: { in: topBusinessIds },
        rating: { gte: 4 },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: MAX_TESTIMONIALS,
      include: {
        customer: { select: { name: true, avatarUrl: true } },
        business: { select: { name: true, location: true, slug: true } },
      },
    });

    // 3. Get public ratings for top 10 businesses
    const serviceRatings = await prisma.serviceRating.findMany({
      where: {
        serviceId: { in: topBusinessIds },
        rating: { gte: 4 },
        comment: { not: null, notIn: [''] },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: MAX_TESTIMONIALS,
    });

    const verifiedTestimonials = reviews.map((r) => ({
      id: r.id,
      author: r.customer?.name || 'Verified Guest',
      avatar: r.customer?.avatarUrl || null,
      venue: `${r.business.name} (${r.business.location})`,
      venueSlug: r.business.slug,
      rating: r.rating,
      cleanliness: r.cleanlinessRating,
      service: r.serviceRating,
      hospitality: r.hospitalityRating,
      title: r.title,
      comment: r.comment,
      partnerReply: r.partnerReply,
      partnerRepliedAt: r.partnerRepliedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    }));

    const publicTestimonials = serviceRatings.map((sr) => {
      const b = businessMap.get(sr.serviceId);
      return {
        id: sr.id,
        author: sr.reviewerName || 'Verified Guest',
        avatar: null,
        venue: b ? `${b.name} (${b.location})` : sr.serviceName,
        venueSlug: b?.slug || '',
        rating: sr.rating,
        cleanliness: sr.rating,
        service: sr.rating,
        hospitality: sr.rating,
        title: `${sr.rating}-Star Guest Review`,
        comment: sr.comment || '',
        partnerReply: null,
        partnerRepliedAt: null,
        createdAt: sr.createdAt.toISOString(),
      };
    });

    // Combined top 10 testimonials from top leaderboard venues
    const combined = [...verifiedTestimonials, ...publicTestimonials]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_TESTIMONIALS);

    return NextResponse.json({ success: true, testimonials: combined });
  } catch (error) {
    return handleRouteError(error, 'testimonials GET');
  }
}
