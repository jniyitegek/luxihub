import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sessionCookie, signToken, toSession } from '@/lib/auth';
import { forbidden, handleRouteError, parseBody, requireUser } from '@/lib/api';
import { demoModeEnabled } from '@/lib/env';
import { DEMO_EMAILS, demoAccountForRole } from '@/lib/demoAccounts';

/**
 * One-click role switcher for the guided demo.
 *
 * This mints a session for a different seeded account without a password, so
 * it is hard-gated twice: the deployment must have demo mode enabled (which
 * `env.ts` refuses to allow in production), and the caller must already hold a
 * session for one of the seeded demo accounts.
 */

const switchSchema = z.object({
  role: z.enum(['CUSTOMER', 'PARTNER', 'ADMIN']),
});

export async function POST(req: Request) {
  try {
    if (!demoModeEnabled) {
      throw forbidden('Role switching is only available in demo environments');
    }

    const current = await requireUser();
    if (!DEMO_EMAILS.has(current.email)) {
      throw forbidden('Role switching is limited to the seeded demo accounts');
    }

    const { role } = await parseBody(req, switchSchema);
    const target = demoAccountForRole(role);

    const user = await prisma.user.findUnique({ where: { email: target.email } });
    if (!user) {
      throw forbidden('The demo account for this role has not been seeded');
    }

    const session = toSession(user);
    const response = NextResponse.json({ success: true, user: session });
    response.cookies.set(sessionCookie(await signToken(session)));
    return response;
  } catch (error) {
    return handleRouteError(error, 'auth/switch-role');
  }
}
