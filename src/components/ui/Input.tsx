import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export function Input({
  label,
  leftIcon,
  rightIcon,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-sm">
        {leftIcon && <span className="mr-2 text-slate-400 shrink-0">{leftIcon}</span>}
        <input
          className={cn(
            'w-full bg-transparent text-slate-900 text-xs sm:text-sm font-semibold focus:outline-none placeholder-slate-400',
            className
          )}
          {...props}
        />
        {rightIcon && <span className="ml-2 text-slate-400 shrink-0">{rightIcon}</span>}
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}
    </div>
  );
}
