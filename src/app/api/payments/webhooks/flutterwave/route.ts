import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gatewayFor, isRailEnabled, verifyFlutterwaveSignature } from '@/lib/payments';
import { claimWebhookEvent, settlePayment } from '@/lib/payments/settlement';

/**
 * Flutterwave webhook.
 *
 * Every delivery carries a `verif-hash` header matching the secret hash set in
 * the Flutterwave dashboard. Once that is verified the transaction is still
 * re-verified through the API — a webhook body alone is never sufficient proof
 * that money moved.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!isRailEnabled('flutterwave')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!verifyFlutterwaveSignature(req.headers.get('verif-hash'))) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const rawBody = await req.text();

  let payload: { event?: string; data?: { tx_ref?: string; id?: number; status?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 });
  }

  const reference = payload.data?.tx_ref;
  if (!reference) {
    return NextResponse.json({ error: 'Missing transaction reference' }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { transactionRef: reference } });
  if (!payment) {
    return NextResponse.json({ received: true, matched: false });
  }

  const fresh = await claimWebhookEvent('FLUTTERWAVE', `${reference}:${payload.data?.status ?? 'unknown'}`, rawBody);
  if (!fresh) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const authoritative = await gatewayFor('CARD').getStatus(reference, payload.data?.id ? String(payload.data.id) : undefined);
    await settlePayment(reference, authoritative);
  } catch (error) {
    console.error('[payments/webhooks/flutterwave]', error);
    return NextResponse.json({ error: 'Could not verify transaction' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
