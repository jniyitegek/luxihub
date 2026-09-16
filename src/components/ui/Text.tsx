import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'price' | 'muted';
  as?: React.ElementType;
  color?: 'default' | 'sky' | 'amber' | 'emerald' | 'muted' | 'white' | 'dark';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  as,
  color = 'default',
  weight,
  className,
  children,
  ...props
}: TextProps) {
  // Map default semantic tags
  const Component = as || (
    variant === 'h1' ? 'h1' :
    variant === 'h2' ? 'h2' :
    variant === 'h3' ? 'h3' :
    variant === 'h4' ? 'h4' :
    variant === 'caption' ? 'span' :
    variant === 'price' ? 'span' : 'p'
  );

  const variantClasses = {
    h1: 'text-3xl sm:text-4xl lg:text-5xl font-medium tracking-normal leading-[1.1]',
    h2: 'text-2xl sm:text-3xl lg:text-4xl font-medium tracking-normal leading-snug',
    h3: 'text-lg sm:text-xl font-medium tracking-normal',
    h4: 'text-base font-medium',
    body: 'text-sm font-normal leading-relaxed',
    caption: 'text-xs font-normal leading-normal',
    price: 'text-base sm:text-lg font-medium tracking-normal',
    muted: 'text-xs font-normal text-slate-500',
  };

  const colorClasses = {
    default: 'text-slate-900',
    sky: 'text-sky-600',
    amber: 'text-sky-600',
    emerald: 'text-slate-900',
    muted: 'text-slate-500',
    white: 'text-white',
    dark: 'text-slate-950',
  };

  const weightClasses = weight ? {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  }[weight] : '';

  return (
    <Component
      className={cn(variantClasses[variant], colorClasses[color], weightClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
}
