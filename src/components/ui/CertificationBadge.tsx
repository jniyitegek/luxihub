import React from 'react';
import { ShieldCheck, Award, Leaf, CheckCircle2 } from 'lucide-react';
import { CertificationBadge as BadgeType } from '@/lib/types';

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function CertificationBadge({ badge, size = 'md', showLabel = true }: BadgeProps) {
  if (badge === 'GOLD_STANDARD') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-bold text-sky-950 bg-gradient-to-r from-sky-100 via-sky-200 to-blue-200 border border-sky-300 shadow-sm rounded-full ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'
        }`}
        title="Higa Lux Gold Standard: 95%+ QA Audit & Top Verified Reviews"
      >
        <Award className={size === 'sm' ? 'w-3.5 h-3.5 text-sky-700' : size === 'lg' ? 'w-4 h-4 text-sky-700' : 'w-3.5 h-3.5 text-sky-700'} />
        {showLabel && <span>Gold Standard Certified</span>}
      </div>
    );
  }

  if (badge === 'LUXE_VERIFIED') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-sm rounded-full ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'
        }`}
        title="Luxe Verified: Passed 40-point Rwandan Luxury QA Inspection"
      >
        <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-600' : size === 'lg' ? 'w-4 h-4 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
        {showLabel && <span>Luxe Verified</span>}
      </div>
    );
  }

  if (badge === 'ECO_SUSTAINABLE') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 font-bold text-teal-800 bg-teal-50 border border-teal-200 shadow-sm rounded-full ${
          size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs'
        }`}
        title="Eco Heritage: Certified Sustainable & Conservation Compliant"
      >
        <Leaf className={size === 'sm' ? 'w-3.5 h-3.5 text-teal-600' : size === 'lg' ? 'w-4 h-4 text-teal-600' : 'w-3.5 h-3.5 text-teal-600'} />
        {showLabel && <span>Eco Heritage Certified</span>}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-full ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
      {showLabel && <span>Pending Audit</span>}
    </div>
  );
}
