import React from 'react';
import Link from 'next/link';

interface LegalPageProps {
  title: string;
  updatedAt: string;
  intro: string;
  children: React.ReactNode;
}

/** Shared shell for the policy pages so they stay visually consistent. */
export function LegalPage({ title, updatedAt, intro, children }: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <nav className="text-xs font-bold text-slate-500 mb-6">
        <Link href="/" className="hover:text-sky-600 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-900">{title}</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Last updated {updatedAt}</p>
      <p className="mt-6 text-sm text-slate-600 leading-relaxed">{intro}</p>

      <div className="mt-10 space-y-8">{children}</div>

      <div className="mt-14 pt-8 border-t border-slate-200 text-xs text-slate-500">
        Questions about this page? Write to{' '}
        <a href="mailto:legal@higalux.rw" className="font-bold text-sky-700 hover:underline">
          legal@higalux.rw
        </a>
        .
      </div>
    </div>
  );
}

export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-extrabold text-slate-900">{heading}</h2>
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-slate-900">
        {children}
      </div>
    </section>
  );
}
