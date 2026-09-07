'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  AlertCircle
} from 'lucide-react';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Default to customer demo if empty for fast testing
    const targetEmail = email.trim() || 'customer@higalux.rw';

    setLoading(true);
    try {
      const success = await login(targetEmail, password || 'password123');
      if (success) {
        if (targetEmail.includes('admin')) {
          router.push('/admin/dashboard');
        } else if (targetEmail.includes('partner') || targetEmail.includes('retreat')) {
          router.push('/partner/dashboard');
        } else {
          router.push('/customer/bookings');
        }
      } else {
        setError(mode === 'signup' ? 'Could not create account' : 'Invalid credentials');
      }
    } catch (err: any) {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  const inputClass =
    'w-full h-12 rounded-full bg-white pl-12 pr-4 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60';

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
          />

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="font-serif italic text-sky-700">Higa Lux</span>
          </h1>

          {/* Circular illustration */}
          <div className="relative mx-auto w-56 h-56">
            <div className="absolute inset-0 rounded-full bg-white shadow-2xl border-4 border-white overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80"
                alt="Rwandan luxury lodge"
                fill
                className="object-cover"
              />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-sky-500" />
            <Sparkles className="absolute bottom-4 -left-4 w-5 h-5 text-sky-400" />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-base font-bold text-slate-900">Unlock your next stay</p>
              <p className="text-sm text-slate-500 font-medium">Sign in now!</p>
            </div>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-11 h-11 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 transition-all shrink-0"
              aria-label="Go to sign in"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
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
                {mode === 'login' ? 'Sign in to Continue' : 'Create your account'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="inline-flex p-1 rounded-full bg-white/15 border border-white/20">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'login' ? 'bg-white text-sky-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'signup' ? 'bg-white text-sky-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-900/40 border border-rose-200/30 flex items-center gap-2 text-xs text-white">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {mode === 'signup' && (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Mobile No."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Centered Circular Submit Arrow Button */}
            <div className="pt-3 flex justify-center">
              <Button
                type="submit"
                isLoading={loading}
                variant="dark"
                className="!w-14 !h-14 !p-0 hover:scale-105 active:scale-95 group"
                title={mode === 'login' ? 'Sign In' : 'Sign Up'}
              >
                <ArrowRight className="w-6 h-6 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </form>

          {mode === 'login' && (
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-white/80">
              <span>Quick fill:</span>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@higalux.rw')}
                className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('partner@retreat.rw')}
                className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                Partner
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('customer@higalux.rw')}
                className="px-2.5 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                Guest
              </button>
            </div>
          )}

          {/* Terms Agreement Checkbox */}
          <label className="flex items-center justify-center gap-2.5 text-xs text-white/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-white/40 text-sky-600 focus:ring-white"
            />
            <span>
              I agree with{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="font-bold underline underline-offset-2 text-white">
                Terms &amp; Conditions!
              </a>
            </span>
          </label>

          <div className="text-center text-xs font-medium text-white/70">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-extrabold text-white hover:underline">
                  Sign Up Now
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('login')} className="font-extrabold text-white hover:underline">
                  Sign In
                </button>
              </>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
