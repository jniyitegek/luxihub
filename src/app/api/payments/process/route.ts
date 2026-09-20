import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, conflict, forbidden, handleRouteError, notFound, parseBody, requireUser } from '@/lib/api';
import { env } from '@/lib/env';
import { gatewayFor, SUPPORTED_PROVIDERS, type PaymentProviderId } from '@/lib/payments';
import { settlePayment } from '@/lib/payments/settlement';

/**
 * Initiates a payment against a booking.
 *
 * The amount is always derived from the booking record — never taken from the
 * request — and the response only ever reports what the gateway actually said.
 * A reservation is confirmed by `settlePayment`, which runs when the gateway
 * reports success here, on its webhook, or on a status poll.
 */

const processSchema = z.object({
  bookingId: z.string().min(1),
  provider: z.enum(SUPPORTED_PROVIDERS as [PaymentProviderId, ...PaymentProviderId[]]),
  paymentType: z.enum(['FULL', 'DEPOSIT']).default('FULL'),
  payerPhone: z.string().trim().max(32).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { bookingId, provider, paymentType, payerPhone } = await parseBody(req, processSchema);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { business: true, payment: true },
    });

    if (!booking) throw notFound('Booking not found');
    if (booking.customerId !== user.id && user.role !== 'ADMIN') {
      throw forbidden('You can only pay for your own bookings');
    }
    if (booking.status === 'CANCELLED') {
      throw badRequest('This booking has been cancelled and can no longer be paid for');
    }
    if (booking.paymentStatus === 'FULLY_PAID') {
      throw conflict('This booking has already been paid in full');
    }

    const gateway = gatewayFor(provider);

    // A payment already in flight is resolved against the gateway rather than
    // started again, so a customer who retries is never charged twice.
    if (booking.payment && booking.payment.status === 'PENDING') {
      const current = await gateway.getStatus(booking.payment.transactionRef, booking.payment.providerRef ?? undefined);
      const settled = await settlePayment(booking.payment.transactionRef, current);

      if (current.status !== 'FAILED') {
        return NextResponse.json({
          success: current.status === 'SUCCESS',
          status: current.status,
          message: current.message,
          transactionRef: booking.payment.transactionRef,
          booking: await loadBookingView(booking.id),
          settled,
        });
      }
    }

    const alreadyPaid = booking.paymentStatus === 'DEPOSIT_PAID' ? booking.depositAmount : 0;
    const outstanding = Math.max(0, booking.totalAmount - alreadyPaid);
    const depositDue = booking.depositAmount > 0 ? booking.depositAmount : Math.round(booking.totalAmount * 0.3);
    const amount = paymentType === 'DEPOSIT' && alreadyPaid === 0 ? Math.min(depositDue, outstanding) : outstanding;

    if (amount <= 0) {
      throw badRequest('There is nothing left to pay on this booking');
    }

    // MTN keys its collection request on this value, which must be a UUID.
    const transactionRef = randomUUID();

    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        transactionRef,
        provider,
        amount,
        currency: booking.currency,
        status: 'INITIATED',
        payerPhone: payerPhone || user.phone || null,
      },
      update: {
        transactionRef,
        providerRef: null,
        provider,
        amount,
        currency: booking.currency,
        status: 'INITIATED',
        payerPhone: payerPhone || user.phone || null,
        channelResponse: null,
        paidAt: null,
      },
    });

    const result = await gateway.charge({
      reference: transactionRef,
      amount,
      currency: booking.currency,
      provider,
      payerPhone: payerPhone || user.phone || undefined,
      customer: { name: booking.guestName, email: booking.guestEmail },
      description: `Higa Lux reservation ${booking.bookingRef} — ${booking.business.name}`,
      returnUrl: `${env.NEXT_PUBLIC_APP_URL}/customer/bookings?ref=${booking.bookingRef}`,
      callbackUrl: callbackUrlFor(gateway.id),
    });

    await settlePayment(transactionRef, result);

    return NextResponse.json({
      success: result.status === 'SUCCESS',
      status: result.status,
      message: result.message,
      transactionRef,
      redirectUrl: result.redirectUrl,
      booking: await loadBookingView(booking.id),
    });
  } catch (error) {
    return handleRouteError(error, 'payments/process');
  }
}

function callbackUrlFor(gatewayId: string): string {
  if (gatewayId === 'mtn_momo') {
    const secret = env.MTN_MOMO_CALLBACK_SECRET;
    return `${env.NEXT_PUBLIC_APP_URL}/api/payments/webhooks/mtn-momo${secret ? `?secret=${encodeURIComponent(secret)}` : ''}`;
  }
  if (gatewayId === 'flutterwave') {
    return `${env.NEXT_PUBLIC_APP_URL}/api/payments/webhooks/flutterwave`;
  }
  return `${env.NEXT_PUBLIC_APP_URL}/api/payments/webhooks/${gatewayId}`;
}

async function loadBookingView(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { business: true, serviceOffering: true, payment: true },
  });
  if (!booking) return null;

  return {
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
}
