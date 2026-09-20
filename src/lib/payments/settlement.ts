import { prisma } from '../prisma';
import { tierForPoints } from '../loyalty';
import { ChargeResult } from './types';

/**
 * Applies a gateway outcome to our own records.
 *
 * Every path that can learn a payment's fate — the initial charge, a webhook,
 * a status poll — funnels through here so the booking, the ledger and the
 * loyalty award stay consistent. It is idempotent: a payment that has already
 * settled is left untouched, which matters because gateways retry webhooks.
 */

export interface SettlementOutcome {
  changed: boolean;
  paymentStatus: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
  bookingStatus?: string;
  bookingPaymentStatus?: string;
}

export async function settlePayment(transactionRef: string, result: ChargeResult): Promise<SettlementOutcome> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { transactionRef },
      include: { booking: true },
    });

    if (!payment) {
      throw new Error(`No payment found for reference ${transactionRef}`);
    }

    // Already final: gateways retry webhooks, and a poll can race a callback.
    if (payment.status === 'SUCCESS' || (payment.status === 'FAILED' && result.status !== 'SUCCESS')) {
      return {
        changed: false,
        paymentStatus: payment.status as SettlementOutcome['paymentStatus'],
        bookingStatus: payment.booking.status,
        bookingPaymentStatus: payment.booking.paymentStatus,
      };
    }

    const channelResponse = JSON.stringify({
      status: result.status,
      message: result.message,
      providerRef: result.providerRef,
      raw: result.raw ?? null,
      recordedAt: new Date().toISOString(),
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: result.status,
        providerRef: result.providerRef ?? payment.providerRef,
        channelResponse,
        paidAt: result.status === 'SUCCESS' ? new Date() : null,
      },
    });

    if (result.status !== 'SUCCESS') {
      return {
        changed: true,
        paymentStatus: result.status,
        bookingStatus: payment.booking.status,
        bookingPaymentStatus: payment.booking.paymentStatus,
      };
    }

    const booking = payment.booking;
    // A deposit leaves a balance outstanding; anything covering the full price
    // confirms the reservation outright.
    const fullySettled = payment.amount >= booking.totalAmount - 0.5;
    const bookingPaymentStatus = fullySettled ? 'FULLY_PAID' : 'DEPOSIT_PAID';

    await tx.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: bookingPaymentStatus, status: 'CONFIRMED' },
    });

    if (fullySettled) {
      await awardLoyalty(tx, booking.customerId, booking.id, booking.bookingRef, payment.amount);
    }

    return {
      changed: true,
      paymentStatus: 'SUCCESS',
      bookingStatus: 'CONFIRMED',
      bookingPaymentStatus,
    };
  });
}

/** 1 point per 1,000 RWF, granted at most once per booking. */
async function awardLoyalty(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  bookingId: string,
  bookingRef: string,
  amount: number
) {
  const alreadyAwarded = await tx.loyaltyTransaction.findFirst({
    where: { bookingId, userId, type: 'EARNED' },
  });
  if (alreadyAwarded) return;

  const points = Math.floor(amount / 1000);
  if (points <= 0) return;

  await tx.loyaltyTransaction.create({
    data: { userId, bookingId, points, type: 'EARNED', description: `Earned from booking #${bookingRef}` },
  });

  const updated = await tx.user.update({
    where: { id: userId },
    data: { loyaltyPoints: { increment: points } },
  });

  const tier = tierForPoints(updated.loyaltyPoints);
  if (tier !== updated.loyaltyTier) {
    await tx.user.update({ where: { id: userId }, data: { loyaltyTier: tier } });
  }
}

/**
 * Records that a webhook event was handled, returning false when the same
 * event has already been processed.
 */
export async function claimWebhookEvent(provider: string, externalId: string, payload: string): Promise<boolean> {
  // `skipDuplicates` lets the unique constraint on (provider, externalId) do
  // the de-duplication without raising — a repeat delivery is routine, not an
  // error worth logging.
  const { count } = await prisma.webhookEvent.createMany({
    data: [{ provider, externalId, payload }],
    skipDuplicates: true,
  });
  return count === 1;
}
