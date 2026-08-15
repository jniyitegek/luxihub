import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingRef: id }],
      },
      include: {
        business: true,
        serviceOffering: true,
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify permission: customer, partner business owner, or admin
    if (user.role === 'CUSTOMER' && booking.customerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (user.role === 'PARTNER' && booking.business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formatted = {
      ...booking,
      business: {
        ...booking.business,
        images: JSON.parse(booking.business.images || '[]'),
        amenities: JSON.parse(booking.business.amenities || '[]'),
      },
      serviceOffering: {
        ...booking.serviceOffering,
        images: JSON.parse(booking.serviceOffering.images || '[]'),
        inclusions: JSON.parse(booking.serviceOffering.inclusions || '[]'),
      },
    };

    return NextResponse.json({ success: true, booking: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { status } = body; // 'CANCELLED' | 'COMPLETED' | 'CONFIRMED'

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Allow customer to cancel or partner/admin to complete
    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update booking' }, { status: 500 });
  }
}
