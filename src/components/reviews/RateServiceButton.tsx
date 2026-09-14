'use client';

import React, { useState } from 'react';
import { Star, MessageSquarePlus, Sparkles } from 'lucide-react';
import { RateServiceModal } from './RateServiceModal';
import { Button } from '@/components/ui/Button';

export interface RateServiceButtonProps {
  serviceId: string;
  serviceName: string;
  variant?: 'default' | 'outline' | 'compact' | 'fab' | 'glass' | 'star';
  buttonText?: string;
  className?: string;
  onRatingSuccess?: (newRating: any) => void;
}

export function RateServiceButton({
  serviceId,
  serviceName,
  variant = 'default',
  buttonText = 'Rate a Service',
  className = '',
  onRatingSuccess,
}: RateServiceButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
      {variant === 'fab' ? (
        /* Floating Action Button (FAB) */
        <button
          type="button"
          onClick={handleOpen}
          className={`fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 text-white font-extrabold text-xs shadow-2xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-sky-400/30 backdrop-blur-md group ${className}`}
          aria-label="Rate a Service"
        >
          <div className="p-1 rounded-full bg-white/20 group-hover:rotate-12 transition-transform">
            <Star className="w-4 h-4 fill-sky-300 text-sky-200" />
          </div>
          <span>{buttonText}</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
          </span>
        </button>
      ) : variant === 'star' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200/80 transition-all ${className}`}
        >
          <Star className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
          <span>{buttonText}</span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold text-[11px] border border-slate-200 hover:border-sky-200 transition-all ${className}`}
        >
          <MessageSquarePlus className="w-3 h-3 text-sky-600" />
          <span>{buttonText}</span>
        </button>
      ) : variant === 'glass' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 shadow-sm ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-300" />
          <span>{buttonText}</span>
        </button>
      ) : variant === 'outline' ? (
        <Button
          onClick={handleOpen}
          variant="outline"
          size="sm"
          leftIcon={<Star className="w-3.5 h-3.5 text-sky-600 fill-sky-100" />}
          className={`!rounded-2xl !text-xs font-bold ${className}`}
        >
          {buttonText}
        </Button>
      ) : (
        /* Default Primary Button */
        <Button
          onClick={handleOpen}
          variant="primary"
          size="sm"
          leftIcon={<Star className="w-3.5 h-3.5 fill-sky-200 text-sky-100" />}
          className={`!rounded-2xl !text-xs font-extrabold shadow-md shadow-sky-500/20 ${className}`}
        >
          {buttonText}
        </Button>
      )}

      {/* Public Rating Modal */}
      <RateServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceId={serviceId}
        serviceName={serviceName}
        onSuccess={onRatingSuccess}
      />
    </>
  );
}
