import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { UserSession, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'luxe-hub-rwanda-secret-key-2026-quality-assured';
const TOKEN_COOKIE_NAME = 'lux_token';

export function signToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const DEMO_ACCOUNTS = {
  customer: {
    email: 'customer@luxehub.rw',
    password: 'password123',
    role: 'CUSTOMER' as UserRole,
    name: 'Clarisse Mutoni',
    phone: '+250 788 123 456',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  partner: {
    email: 'partner@retreat.rw',
    password: 'password123',
    role: 'PARTNER' as UserRole,
    name: 'Jean-Paul Nsengiyumva',
    phone: '+250 788 654 321',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  admin: {
    email: 'admin@luxehub.rw',
    password: 'password123',
    role: 'ADMIN' as UserRole,
    name: 'Dr. Vanessa Uwase (Chief QA Officer)',
    phone: '+250 788 999 000',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
};
