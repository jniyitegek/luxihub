'use client';

import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  AlertCircle,
  Instagram
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface RateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onSuccess?: (newRating: any) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional',
};

export function RateServiceModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  onSuccess,
}: RateServiceModalProps) {
  const [step, setStep] = useState<'form' | 'instagram'>('form');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [hpField, setHpField] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const resetModalState = () => {
    setStep('form');
    setRating(0);
    setHoverRating(0);
    setComment('');
    setReviewerName('');
    setHpField('');
    setLoading(false);
    setError(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Please select a star rating (1 to 5 stars).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          serviceName,
          rating,
          comment,
          reviewerName,
          hp_field: hpField,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      if (onSuccess) {
        onSuccess(data.rating);
      }

      // Transition to Instagram Share Step
      setStep('instagram');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate suggested caption text for Instagram
  const sanitizedServiceName = serviceName.replace(/[^a-zA-Z0-9]/g, '');
  const starsString = '⭐'.repeat(rating || 5);
  const suggestedCaption = `Loved my experience with ${serviceName}! ${starsString} Rated on @higa_luxuries #HigaLuxuries #${sanitizedServiceName} #RwandaLuxury`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(suggestedCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
    }
  };

  const handleOpenInstagram = () => {
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Attempt deep link on mobile devices
      window.location.href = 'instagram://app';
      setTimeout(() => {
        window.open('https://www.instagram.com', '_blank');
      }, 1500);
    } else {
      window.open('https://www.instagram.com', '_blank');
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <span>{step === 'form' ? 'Rate a Service' : 'Share Your Experience'}</span>
        </div>
      }
      subtitle={
        step === 'form'
          ? 'Public Guest Review • No account required'
          : 'Thank you! Help others discover great services'
      }
      size="md"
    >
      <div className="p-6 space-y-6">
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Service Name (Read-only context) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Service / Property Name</span>
              </label>
              <input
                type="text"
                readOnly
                value={serviceName}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Star Rating Input (Required) */}
            <div className="space-y-2 text-center p-5 rounded-2xl bg-sky-50/50 border border-sky-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                Your Overall Rating <span className="text-red-500">*</span>
              </label>

              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const active = starIndex <= (hoverRating || rating);
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      onClick={() => setRating(starIndex)}
                      onMouseEnter={() => setHoverRating(starIndex)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-sky-500 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          active
                            ? 'fill-sky-500 text-sky-500 drop-shadow-[0_2px_8px_rgba(2,132,199,0.4)]'
                            : 'text-slate-300 fill-slate-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="h-5 text-xs font-bold text-sky-700">
                {(hoverRating || rating) > 0 ? (
                  <span>{RATING_LABELS[hoverRating || rating]}</span>
                ) : (
                  <span className="text-slate-400 font-normal">Tap to select stars</span>
                )}
              </div>
            </div>

            {/* Reviewer Name (Optional, defaults to Anonymous) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Your Name</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional (Defaults to Anonymous)</span>
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Clarisse M. or leave blank"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
              />
            </div>

            {/* Review Comment (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Short Review / Feedback</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you enjoyed about this service..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Honeypot hidden anti-spam field */}
            <input
              type="text"
              name="hp_field"
              value={hpField}
              onChange={(e) => setHpField(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden pointer-events-none opacity-0 absolute -left-[9999px]"
            />

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Privacy Guarantee Note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>100% Public &amp; Anonymous Guest Protection</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={loading}
                className="!rounded-xl text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={loading}
                className="!rounded-xl px-6 shadow-md shadow-sky-500/25"
              >
                Submit Rating
              </Button>
            </div>

          </form>
        ) : (
          /* Step 2: Confirmation & Instagram Sharing */
          <div className="space-y-6 text-center py-2">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Rating Saved!</h3>
              <p className="text-xs text-slate-600">
                Your <strong className="text-slate-900">{rating}-star rating</strong> for <strong className="text-sky-700">{serviceName}</strong> has been saved.
              </p>
            </div>

            {/* Instagram Suggested Caption Card */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white text-left space-y-3.5 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span>Share on Instagram</span>
                </div>
                <span className="text-[10px] text-slate-400">Step 2 of 2</span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400 font-medium">Suggested Caption:</div>
                <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-200 font-mono leading-relaxed select-all">
                  {suggestedCaption}
                </div>
              </div>

              {/* Action Buttons for Instagram */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200" />
                      <span>Caption Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-sky-300" />
                      <span>1. Copy Caption</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenInstagram}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  <span>2. Open Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center font-normal pt-1">
                Note: Instagram requires manual pasting. Copy the caption above, open Instagram, and paste it into your post or story while tagging <strong className="text-pink-300">@higa_luxuries</strong>.
              </p>
            </div>

            {/* Finish Action */}
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleClose}
                className="w-full !rounded-xl"
              >
                Done
              </Button>
            </div>

          </div>
        )}
      </div>
    </Modal>
  );
}
