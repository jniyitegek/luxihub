import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star, MapPin } from 'lucide-react';

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
  const baseStyles = 'inline-flex items-center gap-1 text-xs font-bold';

  const variants = {
    rating: 'text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%)]',
    location: 'text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%)] text-[11px] font-semibold',
    price: 'text-sky-600 font-extrabold',
    status: 'text-slate-900 font-bold',
    tag: 'text-slate-600 font-medium',
    accent: 'text-sky-600 font-extrabold',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {variant === 'rating' && <Star className="w-3.5 h-3.5 fill-white text-white shrink-0" />}
      {variant === 'location' && <MapPin className="w-3.5 h-3.5 shrink-0" />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
