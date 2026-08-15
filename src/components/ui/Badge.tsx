import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'rating' | 'location' | 'price' | 'status' | 'tag' | 'accent';
  rating?: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Badge({
  variant = 'tag',
  rating,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all';

  const variants = {
    rating: 'bg-white/95 text-slate-900 shadow-md backdrop-blur-md border border-white/60 text-amber-500 font-extrabold',
    location: 'bg-black/60 backdrop-blur-md text-white border border-white/20 text-[11px] font-semibold',
    price: 'bg-sky-50 text-sky-900 border border-sky-200 font-extrabold',
    status: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold',
    tag: 'bg-slate-100 text-slate-700 border border-slate-200/80 font-medium',
    accent: 'bg-amber-500 text-slate-950 font-extrabold shadow-sm',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {variant === 'rating' && <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />}
      {variant === 'location' && <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
