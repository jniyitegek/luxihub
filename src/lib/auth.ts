import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { TOKEN_COOKIE_NAME, verifyToken } from './session';
import { UserSession } from './types';

export {
  TOKEN_COOKIE_NAME,
  TOKEN_TTL_SECONDS,
  signToken,
  verifyToken,
  sessionCookie,
  clearedSessionCookie,
  sessionCookieOptions,
  toSession,
} from './session';

/** Reads and verifies the session cookie on the current request. */
export async function getCurrentUser(): Promise<UserSession | null> {
  const token = cookies().get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// --- Passwords -------------------------------------------------------------

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
