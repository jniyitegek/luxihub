'use client';

import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { BookingDto } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ReviewModalProps {
  booking: BookingDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewSubmissionModal({ booking, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [hospitalityRating, setHospitalityRating] = useState(5);
  const [valueRating, setValueRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !comment) {
      setErrorMsg('Please enter a review title and your detailed comments.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          rating,
          cleanlinessRating,
          serviceRating,
          hospitalityRating,
          valueRating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to submit review');
      }
    } catch (e: any) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarPicker = (val: number, setVal: (v: number) => void, label: string) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-700 font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setVal(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-4 h-4 ${
                star <= val ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Submit Verified Guest Review"
      subtitle={`For ${booking.business?.name} • Ref #${booking.bookingRef}`}
      size="md"
    >
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Multi-Criteria Ratings */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">
              Rate Experience Categories (1 to 5 Stars)
            </div>
            {renderStarPicker(rating, setRating, 'Overall Experience')}
            {renderStarPicker(cleanlinessRating, setCleanlinessRating, 'Cleanliness & Hygiene')}
            {renderStarPicker(serviceRating, setServiceRating, 'Staff Service & Promptness')}
            {renderStarPicker(hospitalityRating, setHospitalityRating, 'Rwandan Hospitality Warmth')}
            {renderStarPicker(valueRating, setValueRating, 'Value for Investment')}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
              Review Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pure serenity and unmatched Rwandan hospitality!"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white placeholder-slate-400"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
              Detailed Comments & Feedback
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your arrival experience, room comfort, food quality, or safari highlights..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:outline-none focus:border-sky-500 focus:bg-white placeholder-slate-400"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={submitting}
              variant="primary"
              fullWidth
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="!rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:opacity-95 hover:scale-[1.01] active:scale-95"
            >
              {submitting ? 'Verifying & Submitting...' : 'Submit Verified Review'}
            </Button>
          </div>

        </form>

    </Modal>
  );
}
