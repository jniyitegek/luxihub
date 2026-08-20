import React from 'react';
import { ShieldCheck, Award, Leaf, CheckCircle2 } from 'lucide-react';
import { CertificationBadge as BadgeType } from '@/lib/types';

interface BadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const TEXT_SIZE = { sm: 'text-xs', md: 'text-xs', lg: 'text-sm' };
const ICON_SIZE = { sm: 'w-3.5 h-3.5', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' };

export function CertificationBadge({ badge, size = 'md', showLabel = true }: BadgeProps) {
  const textSize = TEXT_SIZE[size];
  const iconSize = ICON_SIZE[size];

  if (badge === 'GOLD_STANDARD') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold text-slate-900 ${textSize}`}
        title="Higa Lux Gold Standard: 95%+ QA Audit & Top Verified Reviews"
      >
        <Award className={`${iconSize} text-sky-600 shrink-0`} />
        {showLabel && <span>Gold Standard Certified</span>}
      </span>
    );
  }

  if (badge === 'LUXE_VERIFIED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold text-slate-900 ${textSize}`}
        title="Luxe Verified: Passed 40-point Rwandan Luxury QA Inspection"
      >
        <ShieldCheck className={`${iconSize} text-sky-600 shrink-0`} />
        {showLabel && <span>Luxe Verified</span>}
      </span>
    );
  }

  if (badge === 'ECO_SUSTAINABLE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold text-slate-900 ${textSize}`}
        title="Eco Heritage: Certified Sustainable & Conservation Compliant"
      >
        <Leaf className={`${iconSize} text-sky-600 shrink-0`} />
        {showLabel && <span>Eco Heritage Certified</span>}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold text-slate-500 ${textSize}`}>
      <CheckCircle2 className={`${iconSize} text-slate-400 shrink-0`} />
      {showLabel && <span>Pending Audit</span>}
    </span>
  );
}
