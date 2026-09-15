import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sessionCookie, signToken, toSession, verifyPassword } from '@/lib/auth';
import { clientIp, handleRouteError, jsonError, parseBody } from '@/lib/api';
import { consume, reset } from '@/lib/rateLimit';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const MAX_ATTEMPTS = 8;
const WINDOW_SECONDS = 15 * 60;

/**
 * A valid bcrypt hash of a value nobody knows. Comparing against it when the
 * email is unknown keeps the response time of "no such user" and "wrong
 * password" in the same range, so the endpoint does not leak which emails are
 * registered.
 */
const TIMING_EQUALISER_HASH = '$2a$12$k93dpcseXDNSvdqJSll5B.qGRMISm2WDDj0ZwhHEeA6LyzsYhDBUO';

export async function POST(req: Request) {
  try {
    const { email, password } = await parseBody(req, loginSchema);

    // Throttled per IP *and* per account, so neither a single host nor a
    // distributed attempt can brute-force one inbox unchecked.
    const ip = clientIp(req);
    for (const key of [`login:ip:${ip}`, `login:email:${email}`]) {
      const limit = consume(key, MAX_ATTEMPTS, WINDOW_SECONDS);
      if (!limit.allowed) {
        return jsonError('Too many sign-in attempts. Please try again later.', 429);
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });

    const passwordMatches = await verifyPassword(password, user?.passwordHash ?? TIMING_EQUALISER_HASH);

    if (!user || !passwordMatches) {
      return jsonError('Invalid email or password', 401);
    }

    reset(`login:email:${email}`);
    reset(`login:ip:${ip}`);

    const session = toSession(user);
    const response = NextResponse.json({ success: true, user: session });
    response.cookies.set(sessionCookie(await signToken(session)));
    return response;
  } catch (error) {
    return handleRouteError(error, 'auth/login');
  }
}
