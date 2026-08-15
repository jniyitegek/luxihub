import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      bookingId,
      rating = 5,
      cleanlinessRating = 5,
      serviceRating = 5,
      hospitalityRating = 5,
      valueRating = 5,
      title,
      comment,
    } = body;

    if (!bookingId || !comment || !title) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    // Verify that the booking exists, belongs to this customer, and is COMPLETED
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { business: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'You can only review your own bookings' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Reviews can only be submitted for completed bookings' }, { status: 400 });
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'A verified review has already been submitted for this booking' }, { status: 400 });
    }

    // Create the verified review
    const review = await prisma.review.create({
      data: {
        bookingId,
        businessId: booking.businessId,
        customerId: user.id,
        rating: parseInt(rating.toString(), 10),
        cleanlinessRating: parseInt(cleanlinessRating.toString(), 10),
        serviceRating: parseInt(serviceRating.toString(), 10),
        hospitalityRating: parseInt(hospitalityRating.toString(), 10),
        valueRating: parseInt(valueRating.toString(), 10),
        title,
        comment,
        isVerified: true,
      },
    });

    // Recalculate business average rating and review count
    const allReviews = await prisma.review.findMany({
      where: { businessId: booking.businessId },
    });

    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await prisma.business.update({
      where: { id: booking.businessId },
      data: {
        ratingAvg: parseFloat(avgRating.toFixed(2)),
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Review submission failed' }, { status: 500 });
  }
}

// Partner reply to review
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PARTNER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { reviewId, partnerReply } = await req.json();
    if (!reviewId || !partnerReply) {
      return NextResponse.json({ error: 'Missing reviewId or reply' }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        partnerReply,
        partnerRepliedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit partner reply' }, { status: 500 });
  }
}
