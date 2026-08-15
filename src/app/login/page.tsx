'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  ChevronLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Default to customer demo if empty for fast testing
    const targetEmail = email.trim() || 'customer@luxehub.rw';

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
        setError('Invalid credentials');
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

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* Centered Login Card using Luxe Hub Brand Colors */}
      <div className="w-full max-w-[420px] rounded-[36px] bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 shadow-2xl shadow-sky-900/30 overflow-hidden flex flex-col transition-all duration-300">
        
        {/* TOP SECTION: Luxe Hub Sky Blue Brand Gradient */}
        <div className="p-8 sm:p-9 space-y-7 relative">
          
          {/* Top Bar: Back Arrow Left & Logo Icon Right */}
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/15 transition-colors"
              aria-label="Back to home"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </Link>

            {/* Brand Badge Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner border border-white/20">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1 text-white">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome!
            </h1>
            <p className="text-sm font-medium text-white/80">
              Sign in to Continue
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-900/40 border border-rose-200/30 flex items-center gap-2 text-xs text-white">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* Email Input */}
            <Input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              className="text-base"
            />

            {/* Password Input */}
            <Input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              className="text-base"
            />

            {/* Centered Circular Submit Arrow Button in Brand Dark Navy */}
            <div className="pt-4 flex justify-center">
              <Button
                type="submit"
                isLoading={loading}
                variant="dark"
                className="!w-14 !h-14 !p-0 bg-[#0B1B36] hover:bg-slate-950 hover:scale-105 active:scale-95 group"
                title="Sign In"
              >
                <ArrowRight className="w-6 h-6 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>

          </form>

          {/* Subtle Demo Quick Fill Pills */}
          <div className="pt-1 flex items-center justify-center gap-2 text-[11px] font-bold text-white/80">
            <span>Quick fill:</span>
            <Button
              type="button"
              size="sm"
              onClick={() => handleQuickFill('admin@luxehub.rw')}
              className="!px-2.5 !py-0.5 !text-[11px] rounded-full bg-white/20 hover:bg-white/30 text-white border-none shadow-none"
            >
              Admin
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleQuickFill('partner@retreat.rw')}
              className="!px-2.5 !py-0.5 !text-[11px] rounded-full bg-white/20 hover:bg-white/30 text-white border-none shadow-none"
            >
              Partner
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleQuickFill('customer@luxehub.rw')}
              className="!px-2.5 !py-0.5 !text-[11px] rounded-full bg-white/20 hover:bg-white/30 text-white border-none shadow-none"
            >
              Guest
            </Button>
          </div>

        </div>

        {/* BOTTOM SECTION: Rounded White Container */}
        <div className="bg-white px-6 py-7 text-center space-y-4 rounded-b-[36px]">
          
          {/* Terms Agreement Checkbox */}
          <label className="inline-flex items-center gap-2.5 text-xs text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span>
              I agree with{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-sky-600 font-semibold underline underline-offset-2 hover:text-sky-700">
                Terms & Conditions!
              </a>
            </span>
          </label>

          {/* Sign Up Link */}
          <div className="text-xs font-medium text-slate-500">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => handleQuickFill('customer@luxehub.rw')}
              className="font-extrabold text-sky-600 hover:text-sky-700 hover:underline"
            >
              Sign Up Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
