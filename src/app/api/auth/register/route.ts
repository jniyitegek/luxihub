import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, sessionCookie, signToken, toSession } from '@/lib/auth';
import { clientIp, conflict, handleRouteError, jsonError, parseBody } from '@/lib/api';
import { consume } from '@/lib/rateLimit';
import { isRwandanMobile, formatMsisdn } from '@/lib/payments/phone';

/**
 * Guest self-registration.
 *
 * Only CUSTOMER accounts can be created here — partner and administrator
 * accounts are provisioned by the Higa Lux team, so the role is never read
 * from the request body.
 */

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(10, 'Use at least 10 characters')
    .max(200, 'Password is too long')
    .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), 'Include at least one letter and one number'),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || isRwandanMobile(v), 'Enter a valid Rwandan number, e.g. +250 788 000 000'),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Use to create an account' }),
  }),
});

export async function POST(req: Request) {
  try {
    const limit = consume(`register:ip:${clientIp(req)}`, 5, 60 * 60);
    if (!limit.allowed) {
      return jsonError('Too many accounts created from this network. Please try again later.', 429);
    }

    const { name, email, password, phone } = await parseBody(req, registerSchema);

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw conflict('An account already exists for this email address. Try signing in instead.');
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hashPassword(password),
        role: 'CUSTOMER',
        phone: phone ? formatMsisdn(phone) : null,
      },
    });

    const session = toSession(user);
    const response = NextResponse.json({ success: true, user: session }, { status: 201 });
    response.cookies.set(sessionCookie(await signToken(session)));
    return response;
  } catch (error) {
    return handleRouteError(error, 'auth/register');
  }
}
