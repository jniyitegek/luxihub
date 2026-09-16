'use client';

import React, { useState } from 'react';
import { Star, MessageSquarePlus, ThumbsUp } from 'lucide-react';
import { RateServiceModal } from './RateServiceModal';
import { Button } from '@/components/ui/Button';

export interface RateServiceButtonProps {
  serviceId?: string;
  serviceName?: string;
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
          className={`fixed bottom-6 right-6 z-40 px-5 py-3.5 rounded-full bg-white text-sky-600 font-medium text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-sky-600 group ${className}`}
          aria-label="Rate a Service"
        >
          <div className="p-1 rounded-full bg-sky-50 group-hover:rotate-12 transition-transform">
            <ThumbsUp className="w-4 h-4 text-sky-600" />
          </div>
          <span>{buttonText}</span>
        </button>
      ) : variant === 'star' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-transparent text-sky-600 font-medium text-xs border border-sky-600 transition-all hover:bg-sky-50/50 ${className}`}
        >
          <ThumbsUp className="w-3.5 h-3.5 text-sky-600" />
          <span>{buttonText}</span>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-transparent text-sky-600 hover:bg-sky-50 font-medium text-[11px] border border-sky-600 transition-all ${className}`}
        >
          <ThumbsUp className="w-3 h-3 text-sky-600" />
          <span>{buttonText}</span>
        </button>
      ) : variant === 'glass' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`px-4 py-2 rounded-full bg-transparent hover:bg-sky-50/50 text-sky-600 font-medium text-xs border-2 border-sky-600 transition-all flex items-center gap-2 ${className}`}
        >
          <ThumbsUp className="w-3.5 h-3.5 text-sky-600" />
          <span>{buttonText}</span>
        </button>
      ) : variant === 'outline' ? (
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border-2 border-sky-600 text-sky-600 hover:bg-sky-50/60 font-medium text-xs transition-all ${className}`}
        >
          <ThumbsUp className="w-3.5 h-3.5 text-sky-600" />
          <span>{buttonText}</span>
        </button>
      ) : (
        /* Default: Clean link-style element with solid border and ThumbsUp icon */
        <button
          type="button"
          onClick={handleOpen}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-transparent border-2 border-sky-600 text-sky-600 hover:bg-sky-50/60 font-medium text-xs transition-all shadow-none ${className}`}
        >
          <ThumbsUp className="w-3.5 h-3.5 text-sky-600 stroke-[2.2]" />
          <span>{buttonText}</span>
        </button>
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
