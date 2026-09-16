'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { publicConfig } from '@/lib/publicConfig';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

type Mode = 'login' | 'signup';

const DEMO_QUICK_FILL = [
  { label: 'Root Admin', email: 'admin@mail.com', pass: 'Admin123' },
  { label: 'Admin', email: 'admin@higalux.rw', pass: 'password123' },
  { label: 'Service Owner', email: 'partner@retreat.rw', pass: 'password123' },
  { label: 'Guest', email: 'customer@higalux.rw', pass: 'password123' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'SERVICE_OWNER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setFieldErrors({});
  };

  const destinationFor = (role: string) => {
    const requested = new URLSearchParams(window.location.search).get('next');
    if (requested && requested.startsWith('/') && !requested.startsWith('//')) {
      return requested;
    }
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'SERVICE_OWNER' || role === 'PARTNER') return '/partner/dashboard';
    return '/explore';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (mode === 'signup' && !agreed) {
      setError('Please accept the Terms of Use to create an account.');
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === 'signup'
          ? await register({
              name,
              businessName: selectedRole === 'SERVICE_OWNER' ? businessName : undefined,
              email,
              password,
              role: selectedRole,
              phone: phone || undefined,
              acceptedTerms: agreed,
            })
          : await login(email, password);

      if (!result.ok) {
        const fieldMsgs = result.fieldErrors ? Object.values(result.fieldErrors).join('. ') : '';
        const mainErr = result.error || 'Could not sign you in.';
        setError(fieldMsgs ? `${mainErr}: ${fieldMsgs}` : mainErr);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      const me = await fetch('/api/auth/me', { cache: 'no-store' }).then((r) => r.json());
      router.replace(destinationFor(me?.user?.role ?? 'CUSTOMER'));
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 rounded-full bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60';

  const isMinLength = password.length >= 10;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  const fieldError = (key: string) => {
    if (!fieldErrors[key]) return null;
    return (
      <div className="mt-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/70 border border-rose-300/40 flex items-center gap-2 text-xs font-bold text-rose-100 shadow-md">
        <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
        <span>{fieldErrors[key]}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">

      {/* LEFT: Clean Brand & Tagline Panel — no filler graphics */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between bg-slate-50 p-16">
        <Link
          href="/"
          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Back to home"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </Link>

        <div className="max-w-md my-auto space-y-6">
          <Image
            src="/logo/higa_logo_horizontal_blue.png"
            alt="Higa Lux"
            width={540}
            height={180}
            className="h-16 w-auto"
            priority
          />

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome to <span className="font-serif italic text-sky-700">Higa Lux</span>
          </h1>

          <p className="text-base font-bold text-slate-600 leading-relaxed">
            Verified luxury stays across the Land of a Thousand Hills
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Higa Lux. All rights reserved.
        </div>
      </div>

      {/* RIGHT: Clean Form Panel */}
      <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 py-12 px-6">

        <Link
          href="/"
          className="lg:hidden absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors z-10"
          aria-label="Back to home"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </Link>

        <div className="relative z-10 w-full max-w-sm space-y-6">

          <Image
            src="/logo/higa_logo_horizontal_white.png"
            alt="Higa Lux"
            width={180}
            height={60}
            className="lg:hidden h-9 w-auto mx-auto mb-2"
          />

          <div className="space-y-1 text-white">
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome!</h2>
            <p className="text-sm font-medium text-white/80">
              {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="inline-flex p-1 rounded-full bg-white/15 border border-white/20">
            {(['login', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  mode === m ? 'bg-white text-sky-700 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/10 border border-white/20">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CUSTOMER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'CUSTOMER'
                      ? 'bg-white text-sky-800 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Guest / Customer
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('SERVICE_OWNER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === 'SERVICE_OWNER'
                      ? 'bg-white text-sky-800 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Service Owner
                </button>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-300/40 flex items-start gap-2.5 text-xs text-white shadow-lg"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-300 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-extrabold text-rose-100">Validation Error</p>
                <p className="text-white/90 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {mode === 'signup' && (
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Full name (Personal)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {fieldError('name')}
              </div>
            )}

            {/* Separate Business / Establishment Name input for Service Owners */}
            {mode === 'signup' && selectedRole === 'SERVICE_OWNER' && (
              <div>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Business / Establishment Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {fieldError('businessName')}
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              {fieldError('email')}
            </div>

            {mode === 'signup' && (
              <div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="Mobile number (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {fieldError('phone')}
                <p className="mt-1 ml-3 text-[11px] text-white/70">
                  Rwandan mobile format: +250 78X XXX XXX or 078X XXX XXX (Leave blank if non-Rwandan).
                </p>
              </div>
            )}

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldError('password')}

              {mode === 'signup' && (
                <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-900/40 border border-white/20 backdrop-blur-sm space-y-2 text-xs text-white">
                  <div className="flex items-center justify-between font-bold text-white/90 text-[11px] pb-1 border-b border-white/10">
                    <span>Password Requirements:</span>
                    <span className={isMinLength ? 'text-emerald-300 font-extrabold' : 'text-amber-300 font-bold'}>
                      {password.length} / 10 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isMinLength ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className={isMinLength ? 'text-emerald-200 font-bold' : 'text-white/80'}>
                      At least 10 characters long {password.length > 0 && !isMinLength ? `(add ${10 - password.length} more)` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasLetter ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className={hasLetter ? 'text-emerald-200 font-bold' : 'text-white/80'}>
                      At least 1 letter (a-z, A-Z)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasNumber ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className={hasNumber ? 'text-emerald-200 font-bold' : 'text-white/80'}>
                      At least 1 number (0-9)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="flex items-start gap-2.5 text-xs text-white/85 cursor-pointer select-none px-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/40 text-sky-600 focus:ring-white shrink-0"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="font-bold underline underline-offset-2 text-white">
                      Terms of Use
                    </Link>{' '}
                    and the{' '}
                    <Link href="/privacy" className="font-bold underline underline-offset-2 text-white">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {fieldError('acceptedTerms')}
              </div>
            )}

            <div className="pt-3 flex justify-center">
              <Button
                type="submit"
                isLoading={loading}
                variant="dark"
                className="!w-14 !h-14 !p-0 hover:scale-105 active:scale-95 group"
                title={mode === 'login' ? 'Sign In' : 'Create account'}
              >
                <ArrowRight className="w-6 h-6 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </form>

          {publicConfig.demoMode && mode === 'login' && (
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-white/80">
              <span>Demo quick fill:</span>
              {DEMO_QUICK_FILL.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword('password123');
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  {account.label}
                </button>
              ))}
            </div>
          )}

          <div className="text-center text-xs font-medium text-white/70">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="font-extrabold text-white hover:underline">
                  Sign up now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="font-extrabold text-white hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>

          <p className="text-center text-[11px] text-white/60">
            Partner and administrator accounts are provisioned by the Higa Lux team.
          </p>

        </div>
      </div>

    </div>
  );
}
