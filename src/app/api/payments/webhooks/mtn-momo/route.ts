import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { gatewayFor, isRailEnabled } from '@/lib/payments';
import { claimWebhookEvent, settlePayment } from '@/lib/payments/settlement';

/**
 * MTN MoMo collection callback.
 *
 * MTN does not sign its callbacks, so the agreed protection is a shared secret
 * carried in the callback URL we registered with the request. Even once that
 * passes, the posted body is treated as a *hint* only: the authoritative
 * status is re-read from MTN before anything is settled.
 */

export const dynamic = 'force-dynamic';

function secretMatches(provided: string | null): boolean {
  const expected = env.MTN_MOMO_CALLBACK_SECRET;
  if (!expected || !provided) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!isRailEnabled('mtn_momo')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  if (!secretMatches(url.searchParams.get('secret'))) {
    return NextResponse.json({ error: 'Invalid callback signature' }, { status: 401 });
  }

  const rawBody = await req.text();

  let payload: { referenceId?: string; externalId?: string; status?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  const reference = payload.referenceId || payload.externalId;
  if (!reference) {
    return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { transactionRef: reference } });
  if (!payment) {
    // Acknowledge so MTN stops retrying a callback we can never match.
    return NextResponse.json({ received: true, matched: false });
  }

  const fresh = await claimWebhookEvent('MTN_MOMO', `${reference}:${payload.status ?? 'unknown'}`, rawBody);
  if (!fresh) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const authoritative = await gatewayFor('MTN_MOMO').getStatus(reference);
    await settlePayment(reference, authoritative);
  } catch (error) {
    console.error('[payments/webhooks/mtn-momo]', error);
    // 500 asks MTN to retry; the event row is keyed by status so a retry that
    // carries the same status is still de-duplicated once it succeeds.
    return NextResponse.json({ error: 'Could not verify transaction' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
