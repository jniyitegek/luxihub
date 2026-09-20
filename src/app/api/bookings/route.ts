import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, handleRouteError, notFound, parseBody, requireUser } from '@/lib/api';
import { generateRef } from '@/lib/utils';
import { formatMsisdn, isRwandanMobile } from '@/lib/payments/phone';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireUser();

    const whereClause =
      user.role === 'CUSTOMER'
        ? { customerId: user.id }
        : user.role === 'SERVICE_OWNER' || (user.role as any) === 'PARTNER'
          ? { business: { ownerId: user.id } }
          : {}; // ADMIN sees every booking on the platform

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { business: true, serviceOffering: true, payment: true, review: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookings.map((b) => ({
      ...b,
      business: {
        ...b.business,
        images: JSON.parse(b.business.images || '[]'),
        amenities: JSON.parse(b.business.amenities || '[]'),
      },
      serviceOffering: {
        ...b.serviceOffering,
        images: JSON.parse(b.serviceOffering.images || '[]'),
        inclusions: JSON.parse(b.serviceOffering.inclusions || '[]'),
      },
    }));

    return NextResponse.json({ success: true, bookings: formatted });
  } catch (error) {
    return handleRouteError(error, 'bookings GET');
  }
}

const isoDate = z.coerce.date({ invalid_type_error: 'Enter a valid date' });

const createSchema = z.object({
  serviceOfferingId: z.string().min(1, 'Select a package to book'),
  checkInDate: isoDate,
  checkOutDate: isoDate,
  guests: z.coerce.number().int().min(1).max(50).default(1),
  depositOnly: z.boolean().default(false),
  specialRequests: z.string().trim().max(1000).optional(),
  guestName: z.string().trim().min(2).max(80).optional(),
  guestEmail: z.string().trim().toLowerCase().email().optional(),
  guestPhone: z.string().trim().max(32).optional(),
});

const COMMISSION_RATE = 0.1;
const DEPOSIT_RATE = 0.3;

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = await parseBody(req, createSchema);

    // The business is resolved from the offering rather than accepted from the
    // client, so a reservation can never be attributed to a different listing
    // than the one whose price is being charged.
    const offering = await prisma.serviceOffering.findUnique({
      where: { id: input.serviceOfferingId },
      include: { business: true },
    });

    if (!offering) throw notFound('That package is no longer available');
    if (!offering.isAvailable) throw badRequest('That package is not currently open for booking');
    if (offering.business.status !== 'VERIFIED') {
      throw badRequest('This listing is not accepting reservations at the moment');
    }
    if (input.guests > offering.capacity) {
      throw badRequest(`This package accommodates up to ${offering.capacity} guest(s)`);
    }

    const checkIn = startOfDay(input.checkInDate);
    const checkOut = startOfDay(input.checkOutDate);
    const today = startOfDay(new Date());

    if (checkIn < today) throw badRequest('Check-in cannot be in the past');
    if (offering.unit === 'per_night' && checkOut <= checkIn) {
      throw badRequest('Check-out must be after check-in');
    }
    if (checkOut < checkIn) throw badRequest('Check-out cannot be before check-in');

    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
    const totalAmount = Math.round(
      offering.unit === 'per_night'
        ? offering.price * nights
        : offering.unit === 'per_person'
          ? offering.price * input.guests
          : offering.price
    );

    const guestPhone = input.guestPhone || user.phone || '';
    if (guestPhone && !isRwandanMobile(guestPhone) && !/^\+\d{7,15}$/.test(guestPhone.replace(/[\s-]/g, ''))) {
      throw badRequest('Enter a valid contact number, e.g. +250 788 000 000');
    }

    const commissionAmount = Math.round(totalAmount * COMMISSION_RATE);

    const booking = await prisma.booking.create({
      data: {
        bookingRef: generateRef('LUX'),
        customerId: user.id,
        businessId: offering.businessId,
        serviceOfferingId: offering.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: input.guests,
        totalAmount,
        depositAmount: input.depositOnly ? Math.round(totalAmount * DEPOSIT_RATE) : totalAmount,
        commissionAmount,
        payoutAmount: totalAmount - commissionAmount,
        currency: offering.currency || 'RWF',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        specialRequests: input.specialRequests || null,
        guestName: input.guestName || user.name,
        guestEmail: input.guestEmail || user.email,
        guestPhone: isRwandanMobile(guestPhone) ? formatMsisdn(guestPhone) : guestPhone,
      },
      include: { business: true, serviceOffering: true },
    });

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, 'bookings POST');
  }
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
