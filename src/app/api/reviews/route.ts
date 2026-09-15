import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, conflict, forbidden, handleRouteError, notFound, parseBody, requireRole, requireUser } from '@/lib/api';

export const dynamic = 'force-dynamic';

const starRating = z.coerce.number().int().min(1).max(5);

const createSchema = z.object({
  bookingId: z.string().min(1),
  rating: starRating.default(5),
  cleanlinessRating: starRating.default(5),
  serviceRating: starRating.default(5),
  hospitalityRating: starRating.default(5),
  valueRating: starRating.default(5),
  title: z.string().trim().min(3, 'Give your review a title').max(120),
  comment: z.string().trim().min(10, 'Tell us a little more about your stay').max(4000),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(req, createSchema);

    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: { review: { select: { id: true } } },
    });

    if (!booking) throw notFound('Booking not found');
    if (booking.customerId !== user.id) throw forbidden('You can only review your own stays');
    if (booking.status !== 'COMPLETED') {
      throw badRequest('Reviews can only be submitted once a stay is completed');
    }
    if (booking.review) {
      throw conflict('A verified review has already been submitted for this booking');
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          bookingId: booking.id,
          businessId: booking.businessId,
          customerId: user.id,
          rating: input.rating,
          cleanlinessRating: input.cleanlinessRating,
          serviceRating: input.serviceRating,
          hospitalityRating: input.hospitalityRating,
          valueRating: input.valueRating,
          title: input.title,
          comment: input.comment,
          isVerified: true,
        },
      });

      // Recompute from aggregates rather than loading every row.
      const stats = await tx.review.aggregate({
        where: { businessId: booking.businessId },
        _avg: { rating: true },
        _count: { _all: true },
      });

      await tx.business.update({
        where: { id: booking.businessId },
        data: {
          ratingAvg: Number((stats._avg.rating ?? 5).toFixed(2)),
          reviewCount: stats._count._all,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'reviews POST');
  }
}

const replySchema = z.object({
  reviewId: z.string().min(1),
  partnerReply: z.string().trim().min(2, 'Write a reply').max(2000),
});

/** Partner reply. Restricted to the owner of the reviewed listing. */
export async function PATCH(req: Request) {
  try {
    const user = await requireRole('PARTNER', 'ADMIN');
    const { reviewId, partnerReply } = await parseBody(req, replySchema);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { business: { select: { ownerId: true } } },
    });

    if (!review) throw notFound('Review not found');
    if (user.role !== 'ADMIN' && review.business.ownerId !== user.id) {
      throw forbidden('You can only reply to reviews of your own listings');
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { partnerReply, partnerRepliedAt: new Date() },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    return handleRouteError(error, 'reviews PATCH');
  }
}
