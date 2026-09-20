import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { env, isProd } from './env';
import { UserSession, UserRole } from './types';

/**
 * Session token primitives.
 *
 * This module is deliberately free of Node-only imports (`next/headers`,
 * `bcryptjs`, `crypto`) so the exact same verification logic can run inside the
 * Edge middleware that guards the dashboard routes. `jose` is used instead of
 * `jsonwebtoken` for the same reason.
 */

export const TOKEN_COOKIE_NAME = 'lux_token';
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const ISSUER = 'higa-lux';
const AUDIENCE = 'higa-lux-web';

const signingKey = new TextEncoder().encode(env.JWT_SECRET);

export interface SessionClaims extends JWTPayload {}

export async function signToken(user: UserSession): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(signingKey);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, signingKey, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'],
    });

    if (!payload.sub || typeof payload.email !== 'string' || typeof payload.role !== 'string') {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : '',
      role: payload.role as UserRole,
      phone: typeof payload.phone === 'string' ? payload.phone : undefined,
      avatarUrl: typeof payload.avatarUrl === 'string' ? payload.avatarUrl : undefined,
    };
  } catch {
    // Expired, tampered with, or signed by a different secret — all "no session".
    return null;
  }
}

/** Cookie attributes shared by every route that issues or clears a session. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/',
} as const;

export function sessionCookie(token: string) {
  return { name: TOKEN_COOKIE_NAME, value: token, ...sessionCookieOptions, maxAge: TOKEN_TTL_SECONDS };
}

export function clearedSessionCookie() {
  return { name: TOKEN_COOKIE_NAME, value: '', ...sessionCookieOptions, maxAge: 0 };
}

export function toSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
}): UserSession {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    phone: user.phone || undefined,
    avatarUrl: user.avatarUrl || undefined,
  };
}
