import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forbidden, handleRouteError, notFound, requireUser } from '@/lib/api';
import { gatewayFor, type PaymentProviderId } from '@/lib/payments';
import { settlePayment } from '@/lib/payments/settlement';

/**
 * Status endpoint the checkout UI polls while a mobile money prompt or a
 * hosted card checkout is outstanding. It re-reads the gateway rather than
 * trusting our own stored row, so a missed webhook still resolves.
 */

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { reference: string } }) {
  try {
    const user = await requireUser();

    const payment = await prisma.payment.findUnique({
      where: { transactionRef: params.reference },
      include: { booking: { include: { business: { select: { ownerId: true } } } } },
    });

    if (!payment) throw notFound('Payment not found');

    const isOwner = payment.booking.customerId === user.id;
    const isHost = payment.booking.business.ownerId === user.id;
    if (!isOwner && !isHost && user.role !== 'ADMIN') {
      throw forbidden('You do not have access to this payment');
    }

    if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
      return NextResponse.json({
        success: payment.status === 'SUCCESS',
        status: payment.status,
        bookingStatus: payment.booking.status,
        paymentStatus: payment.booking.paymentStatus,
      });
    }

    const gateway = gatewayFor(payment.provider as PaymentProviderId);
    const current = await gateway.getStatus(payment.transactionRef, payment.providerRef ?? undefined);
    const outcome = await settlePayment(payment.transactionRef, current);

    return NextResponse.json({
      success: current.status === 'SUCCESS',
      status: current.status,
      message: current.message,
      bookingStatus: outcome.bookingStatus,
      paymentStatus: outcome.bookingPaymentStatus,
    });
  } catch (error) {
    return handleRouteError(error, 'payments/status');
  }
}
