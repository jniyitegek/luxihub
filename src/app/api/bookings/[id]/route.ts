import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, forbidden, handleRouteError, notFound, parseBody, requireUser } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();

    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id: params.id }, { bookingRef: params.id }] },
      include: { business: true, serviceOffering: true, payment: true, review: true },
    });

    if (!booking) throw notFound('Booking not found');

    if (user.role === 'CUSTOMER' && booking.customerId !== user.id) throw forbidden();
    if (user.role === 'PARTNER' && booking.business.ownerId !== user.id) throw forbidden();

    return NextResponse.json({
      success: true,
      booking: {
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
      },
    });
  } catch (error) {
    return handleRouteError(error, 'bookings/[id] GET');
  }
}

const patchSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'CANCELLED']),
});

/**
 * Status transitions are role-scoped: a guest may only cancel their own
 * reservation, and only the host or an administrator may confirm or complete
 * one. Previously any signed-in user could set any booking to any status.
 */
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { status } = await parseBody(req, patchSchema);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { business: { select: { ownerId: true } } },
    });

    if (!booking) throw notFound('Booking not found');

    const isGuest = booking.customerId === user.id;
    const isHost = user.role === 'PARTNER' && booking.business.ownerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isGuest && !isHost && !isAdmin) {
      throw forbidden('You do not have access to this booking');
    }
    if (isGuest && !isHost && !isAdmin && status !== 'CANCELLED') {
      throw forbidden('Guests can only cancel a reservation');
    }

    if (!ALLOWED_TRANSITIONS[booking.status]?.includes(status)) {
      throw badRequest(`A ${booking.status.toLowerCase()} booking cannot be changed to ${status.toLowerCase()}`);
    }

    const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status } });
    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    return handleRouteError(error, 'bookings/[id] PATCH');
  }
}
