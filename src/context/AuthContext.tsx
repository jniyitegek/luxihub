'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserSession, UserRole } from '@/lib/types';
import { publicConfig } from '@/lib/publicConfig';

export interface AuthResult {
  ok: boolean;
  error?: string;
  /** Field-level messages keyed by input name, for inline form errors. */
  fieldErrors?: Record<string, string>;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  acceptedTerms: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function readAuthResponse(res: Response): Promise<{ result: AuthResult; user?: UserSession }> {
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // An empty or non-JSON body is handled by the status check below.
  }

  if (res.ok && data?.user) {
    return { result: { ok: true }, user: data.user as UserSession };
  }

  return {
    result: {
      ok: false,
      error: data?.error || 'Something went wrong. Please try again.',
      fieldErrors: data?.details && typeof data.details === 'object' ? data.details : undefined,
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const { result, user: signedIn } = await readAuthResponse(res);
      if (signedIn) setUser(signedIn);
      return result;
    } catch {
      return { ok: false, error: 'Could not reach the server. Check your connection and try again.' };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<AuthResult> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const { result, user: created } = await readAuthResponse(res);
      if (created) setUser(created);
      return result;
    } catch {
      return { ok: false, error: 'Could not reach the server. Check your connection and try again.' };
    }
  }, []);

  const switchRole = useCallback(async (role: UserRole) => {
    if (!publicConfig.demoMode) return;
    try {
      setLoading(true);
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok && data.user) setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, switchRole, refreshUser }),
    [user, loading, login, register, logout, switchRole, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
