'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** Footer newsletter sign-up, posting to `/api/newsletter`. */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'FOOTER', hp_field: honeypot }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? 'You are on the list.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'We could not sign you up. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('We could not reach the server. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-auto shrink-0 space-y-2.5">
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />

      <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-full p-1.5 backdrop-blur-sm w-full md:w-96">
        <Mail className="w-4 h-4 text-white/70 ml-3 shrink-0" aria-hidden="true" />
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder-white/60 outline-none px-1 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-sky-700 font-bold text-sm hover:bg-sky-50 transition-colors disabled:opacity-70"
        >
          <span>{status === 'submitting' ? 'Signing up…' : 'Subscribe'}</span>
          {status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p
        role={status === 'error' ? 'alert' : 'status'}
        className={`text-[11px] text-center md:text-left ${
          status === 'error' ? 'text-rose-100 font-semibold' : status === 'success' ? 'text-white font-semibold' : 'text-sky-100/70'
        }`}
      >
        {status === 'idle' || status === 'submitting' ? (
          <>
            You can unsubscribe at any time. Read our{' '}
            <Link href="/privacy" className="underline hover:text-white transition-colors">
              privacy policy
            </Link>
            .
          </>
        ) : (
          message
        )}
      </p>
    </form>
  );
}
