import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { badRequest, clientIp, handleRouteError, jsonError, parseBody } from '@/lib/api';
import { env } from '@/lib/env';
import { consume } from '@/lib/rateLimit';

/**
 * Newsletter sign-up for the footer form.
 *
 * Re-subscribing an address that previously unsubscribed reactivates the same
 * record rather than creating a duplicate, and the response is identical
 * either way so the endpoint cannot be used to test whether an address is
 * already on the list.
 */

export const dynamic = 'force-dynamic';

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  source: z.enum(['FOOTER', 'CHECKOUT', 'CAMPAIGN']).default('FOOTER'),
  hp_field: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    const { email, source, hp_field } = await parseBody(req, subscribeSchema);

    if (hp_field && hp_field.trim() !== '') {
      throw badRequest('Spam submission detected');
    }

    const ipHash = crypto.createHash('sha256').update(`${clientIp(req)}|${env.RATING_IP_SALT}`).digest('hex');

    if (!consume(`newsletter:${ipHash}`, 5, 60 * 60).allowed) {
      return jsonError('Too many sign-ups from this network. Please try again later.', 429);
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source, ipHash },
      update: { status: 'SUBSCRIBED', unsubscribedAt: null },
    });

    return NextResponse.json({
      success: true,
      message: 'You are on the list. Watch your inbox for Rwandan luxury updates.',
    });
  } catch (error) {
    return handleRouteError(error, 'newsletter POST');
  }
}

const unsubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function DELETE(req: Request) {
  try {
    const { email } = await parseBody(req, unsubscribeSchema);

    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { status: 'UNSUBSCRIBED', unsubscribedAt: new Date() },
    });

    return NextResponse.json({ success: true, message: 'You have been unsubscribed.' });
  } catch (error) {
    return handleRouteError(error, 'newsletter DELETE');
  }
}
