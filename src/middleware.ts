import { NextResponse, type NextRequest } from 'next/server';
import { TOKEN_COOKIE_NAME, verifyToken } from '@/lib/session';
import { UserRole } from '@/lib/types';

/**
 * Edge route guard.
 *
 * Dashboard pages are client components that fetch their own data, so without
 * this an unauthenticated visitor could still render the admin or partner
 * shell. The API routes remain the authoritative check — this layer stops the
 * navigation before any protected UI is served.
 */

const ROUTE_ROLES: Array<{ prefix: string; roles: (UserRole | 'PARTNER')[] }> = [
  { prefix: '/admin', roles: ['ADMIN'] },
  { prefix: '/partner', roles: ['SERVICE_OWNER', 'PARTNER', 'ADMIN'] },
  { prefix: '/customer', roles: ['CUSTOMER', 'SERVICE_OWNER', 'PARTNER', 'ADMIN'] },
];

function homeForRole(role: string): string {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'SERVICE_OWNER' || role === 'PARTNER') return '/partner/dashboard';
  return '/customer/bookings';
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // An expired or tampered cookie should not keep bouncing the visitor around.
  const staleCookie = Boolean(token) && !session;

  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
    }
    const response = NextResponse.next();
    if (staleCookie) response.cookies.delete(TOKEN_COOKIE_NAME);
    return response;
  }

  const rule = ROUTE_ROLES.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!rule) return NextResponse.next();

  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    if (staleCookie) response.cookies.delete(TOKEN_COOKIE_NAME);
    return response;
  }

  if (!rule.roles.includes(session.role)) {
    // Signed in, wrong portal: send them to the one they do have access to
    // rather than to a login screen they have already passed.
    return NextResponse.redirect(new URL(homeForRole(session.role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/partner/:path*', '/customer/:path*', '/login'],
};
