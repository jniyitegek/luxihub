import { UserRole } from './types';

/**
 * Seeded accounts used by the demo/staging experience.
 *
 * These are identities only — no passwords live here. They are referenced by
 * the role switcher and the login quick-fill buttons, both of which are
 * disabled unless demo mode is explicitly enabled outside production.
 */
export const DEMO_ACCOUNTS: Record<'customer' | 'partner' | 'admin', { email: string; role: UserRole; label: string }> = {
  customer: { email: 'customer@higalux.rw', role: 'CUSTOMER', label: 'Guest' },
  partner: { email: 'partner@retreat.rw', role: 'SERVICE_OWNER', label: 'Service Owner' },
  admin: { email: 'admin@higalux.rw', role: 'ADMIN', label: 'Admin' },
};

export const DEMO_EMAILS: ReadonlySet<string> = new Set(Object.values(DEMO_ACCOUNTS).map((a) => a.email));

export function demoAccountForRole(role: UserRole) {
  if (role === 'ADMIN') return DEMO_ACCOUNTS.admin;
  if (role === 'SERVICE_OWNER' || (role as any) === 'PARTNER') return DEMO_ACCOUNTS.partner;
  return DEMO_ACCOUNTS.customer;
}
