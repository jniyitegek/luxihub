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
  Sparkles,
  Compass,
  AlertCircle,
} from 'lucide-react';

type Mode = 'login' | 'signup';

const DEMO_QUICK_FILL = [
  { label: 'Admin', email: 'admin@higalux.rw' },
  { label: 'Partner', email: 'partner@retreat.rw' },
  { label: 'Guest', email: 'customer@higalux.rw' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
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

  /**
   * Where to land after signing in. The `next` parameter is read from the URL
   * at submit time rather than through `useSearchParams`, which would opt the
   * whole page out of prerendering and leave visitors on a blank screen until
   * hydration. Only same-site relative paths are accepted, so a crafted
   * `?next=https://elsewhere` cannot turn this into an open redirect.
   */
  const destinationFor = (role: string) => {
    const requested = new URLSearchParams(window.location.search).get('next');
    if (requested && requested.startsWith('/') && !requested.startsWith('//')) {
      return requested;
    }
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'PARTNER') return '/partner/dashboard';
    return '/customer/bookings';
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
          ? await register({ name, email, password, phone: phone || undefined, acceptedTerms: agreed })
          : await login(email, password);

      if (!result.ok) {
        setError(result.error || 'Could not sign you in.');
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      // The session cookie decides what the account may open; the redirect is
      // only a convenience, and the middleware corrects it if it is wrong.
      const me = await fetch('/api/auth/me', { cache: 'no-store' }).then((r) => r.json());
      router.replace(destinationFor(me?.user?.role ?? 'CUSTOMER'));
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 rounded-full bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60';

  const fieldError = (key: string) =>
    fieldErrors[key] ? <p className="mt-1.5 ml-4 text-[11px] font-semibold text-rose-100">{fieldErrors[key]}</p> : null;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">

      {/* LEFT: Brand / Welcome panel — hidden below lg */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-slate-50 overflow-hidden p-12">
        <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-[560px] h-[420px] bg-gradient-to-br from-sky-500 to-sky-700 rounded-[50%] blur-2xl opacity-90 -rotate-6" />
        <div className="absolute left-0 top-0 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl" />

        <Link
          href="/"
          className="absolute top-8 left-8 w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors z-10"
          aria-label="Back to home"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </Link>

        <div className="relative z-10 max-w-sm text-center space-y-8">
          <Image
            src="/logo/higa_logo_horizontal_blue.png"
            alt="Higa Lux"
            width={540}
            height={180}
            className="h-[108px] w-auto mx-auto"
            priority
          />

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="font-serif italic text-sky-700">Higa Lux</span>
          </h1>

          <div className="relative mx-auto w-56 h-56">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-100 to-sky-200 shadow-2xl border-4 border-white overflow-hidden flex items-center justify-center">
              <Compass className="w-20 h-20 text-sky-600/60" strokeWidth={1.25} />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-sky-500" />
            <Sparkles className="absolute bottom-4 -left-4 w-5 h-5 text-sky-400" />
          </div>

          <p className="text-base font-bold text-slate-900">
            Verified luxury stays across the Land of a Thousand Hills
          </p>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 overflow-hidden py-12 px-6">
        <div className="absolute -bottom-24 -left-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

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

          <div className="flex items-start justify-between">
            <div className="space-y-1 text-white">
              <h2 className="text-3xl font-extrabold tracking-tight">Welcome!</h2>
              <p className="text-sm font-medium text-white/80">
                {mode === 'login' ? 'Sign in to continue' : 'Create your guest account'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
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

          {error && (
            <div
              role="alert"
              className="p-3 rounded-2xl bg-rose-900/40 border border-rose-200/30 flex items-center gap-2 text-xs text-white"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {fieldError('name')}
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
              {mode === 'signup' && !fieldErrors.password && (
                <p className="mt-1.5 ml-4 text-[11px] text-white/70">
                  At least 10 characters, including a letter and a number.
                </p>
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
