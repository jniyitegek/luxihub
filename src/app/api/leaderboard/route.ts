import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Must be computed fresh on every request — this is the live leaderboard.
export const dynamic = 'force-dynamic';

const BOARD_TYPES = ['HOTEL', 'RESTAURANT', 'TOUR'] as const;
const ENTRIES_PER_BOARD = 10;
const DAY_MS = 1000 * 60 * 60 * 24;

// Live, review-driven ranking: this powers the homepage/explore leaderboard
// that surfaces whichever businesses guests are actively praising right now.
// It is recomputed fresh on every request (no cache), so a new review moves
// a business up the board immediately.
export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      where: { status: 'VERIFIED' },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { customer: { select: { name: true } } },
        },
      },
    });

    const now = Date.now();

    const scored = businesses.map((b) => {
      const images = JSON.parse(b.images || '[]');

      // Reputation baseline from the aggregate rating/review volume.
      const baseScore = (b.ratingAvg / 5) * 70;
      const volumeBonus = Math.min(b.reviewCount, 50) / 50 * 15;

      // Live bonus from actual recent review activity on record.
      const recentReviews = b.reviews.filter((r) => now - r.createdAt.getTime() <= 30 * DAY_MS);
      const velocityBonus = Math.min(recentReviews.length, 5) * 2; // up to 10
      const newest = b.reviews[0];
      let freshnessBonus = 0;
      if (newest) {
        const ageDays = (now - newest.createdAt.getTime()) / DAY_MS;
        if (ageDays <= 2) freshnessBonus = 5;
        else if (ageDays <= 7) freshnessBonus = 3;
        else if (ageDays <= 30) freshnessBonus = 1;
      }

      const liveScore = Math.round(Math.min(100, baseScore + volumeBonus + velocityBonus + freshnessBonus));
      const trend: 'rising' | 'steady' = newest && now - newest.createdAt.getTime() <= 7 * DAY_MS ? 'rising' : 'steady';

      const highlight = newest
        ? {
            quote: newest.title || newest.comment,
            reviewerName: newest.customer?.name || 'Verified Guest',
            rating: newest.rating,
            createdAt: newest.createdAt.toISOString(),
            isRealReview: true,
          }
        : {
            quote: `Guests consistently rate ${b.name} ${b.ratingAvg.toFixed(1)}★ across ${b.reviewCount} verified stays.`,
            reviewerName: 'Verified Guests',
            rating: Math.round(b.ratingAvg),
            createdAt: b.updatedAt.toISOString(),
            isRealReview: false,
          };

      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        type: b.type,
        location: b.location,
        image: images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        certificationBadge: b.certificationBadge,
        ratingAvg: b.ratingAvg,
        reviewCount: b.reviewCount,
        liveScore,
        trend,
        highlight,
      };
    });

    const boards = BOARD_TYPES.reduce((acc, type) => {
      acc[type] = scored
        .filter((s) => s.type === type)
        .sort((a, b) => b.liveScore - a.liveScore)
        .slice(0, ENTRIES_PER_BOARD);
      return acc;
    }, {} as Record<(typeof BOARD_TYPES)[number], typeof scored>);

    // "ALL": every category ranked together on one board.
    (boards as any).ALL = [...scored].sort((a, b) => b.liveScore - a.liveScore).slice(0, ENTRIES_PER_BOARD);

    return NextResponse.json({ success: true, updatedAt: new Date().toISOString(), boards });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load leaderboard' }, { status: 500 });
  }
}
