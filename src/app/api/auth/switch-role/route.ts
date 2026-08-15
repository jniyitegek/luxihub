import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, DEMO_ACCOUNTS, getCurrentUser } from '@/lib/auth';

const DEMO_EMAILS = new Set([
  DEMO_ACCOUNTS.customer.email,
  DEMO_ACCOUNTS.partner.email,
  DEMO_ACCOUNTS.admin.email,
]);

export async function POST(req: Request) {
  try {
    // Demo-mode role switcher: only usable by a caller who already holds a
    // valid session for one of the fixed demo accounts, so it can't be used
    // to mint an unauthenticated admin session.
    const currentUser = await getCurrentUser();
    if (!currentUser || !DEMO_EMAILS.has(currentUser.email)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { role } = await req.json(); // CUSTOMER | PARTNER | ADMIN

    let targetEmail = DEMO_ACCOUNTS.customer.email;
    if (role === 'PARTNER') targetEmail = DEMO_ACCOUNTS.partner.email;
    if (role === 'ADMIN') targetEmail = DEMO_ACCOUNTS.admin.email;

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      phone: user.phone || undefined,
      avatarUrl: user.avatarUrl || undefined,
    };

    const token = signToken(userSession);

    const response = NextResponse.json({ success: true, user: userSession });
    response.cookies.set('lux_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Switch role failed' }, { status: 500 });
  }
}
