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

export const revalidate = 300;

const MAX_TESTIMONIALS = 3;

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isVerified: true,
        rating: { gte: 4 },
        booking: { status: 'COMPLETED' },
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: MAX_TESTIMONIALS,
      include: {
        customer: { select: { name: true, avatarUrl: true } },
        business: { select: { name: true, location: true, slug: true } },
      },
    });

    const testimonials = reviews.map((r) => ({
      id: r.id,
      author: r.customer.name,
      avatar: r.customer.avatarUrl,
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

    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    return handleRouteError(error, 'testimonials GET');
  }
}
