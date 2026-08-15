import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'ghost' | 'pill' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 border border-sky-400/30',
    orange: 'bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 border border-amber-300/30',
    secondary: 'bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-full border border-sky-200 shadow-sm',
    outline: 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-full shadow-sm',
    dark: 'bg-slate-950 hover:bg-slate-800 text-white rounded-full shadow-xl border border-slate-800',
    ghost: 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 rounded-2xl border border-slate-200/80 shadow-sm',
    pill: 'bg-white hover:bg-slate-100 text-slate-900 rounded-full border border-slate-200 shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-5 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-7 py-3.5 gap-2.5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
