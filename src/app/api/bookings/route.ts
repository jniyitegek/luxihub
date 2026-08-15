import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateRef } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let whereClause: any = {};
    if (user.role === 'CUSTOMER') {
      whereClause.customerId = user.id;
    } else if (user.role === 'PARTNER') {
      whereClause.business = {
        ownerId: user.id,
      };
    } // If ADMIN, whereClause stays empty to see all platform bookings

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        business: true,
        serviceOffering: true,
        payment: true,
        review: true,
      },
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to make a booking' }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessId,
      serviceOfferingId,
      checkInDate,
      checkOutDate,
      guests = 1,
      depositOnly = false,
      specialRequests,
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    if (!businessId || !serviceOfferingId || !checkInDate || !checkOutDate) {
      return NextResponse.json({ error: 'Missing required reservation fields' }, { status: 400 });
    }

    const serviceOffering = await prisma.serviceOffering.findUnique({
      where: { id: serviceOfferingId },
      include: { business: true },
    });

    if (!serviceOffering) {
      return NextResponse.json({ error: 'Service offering not found' }, { status: 404 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let totalAmount = serviceOffering.price;
    if (serviceOffering.unit === 'per_night') {
      totalAmount = serviceOffering.price * diffDays;
    } else if (serviceOffering.unit === 'per_person') {
      totalAmount = serviceOffering.price * guests;
    }

    const depositAmount = depositOnly ? Math.round(totalAmount * 0.3) : totalAmount;
    const bookingRef = generateRef('LUX');

    // 10% platform booking commission (Business Model: Booking Commission)
    const commissionRate = 0.1;
    const commissionAmount = Math.round(totalAmount * commissionRate);
    const payoutAmount = totalAmount - commissionAmount;

    const newBooking = await prisma.booking.create({
      data: {
        bookingRef,
        customerId: user.id,
        businessId,
        serviceOfferingId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: parseInt(guests.toString(), 10),
        totalAmount,
        depositAmount,
        commissionAmount,
        payoutAmount,
        currency: serviceOffering.currency || 'RWF',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        specialRequests: specialRequests || null,
        guestName: guestName || user.name,
        guestEmail: guestEmail || user.email,
        guestPhone: guestPhone || user.phone || '+250 788 000 000',
      },
      include: {
        business: true,
        serviceOffering: true,
      },
    });

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Booking creation failed' }, { status: 500 });
  }
}
