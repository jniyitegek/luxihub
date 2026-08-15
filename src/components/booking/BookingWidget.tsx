'use client';

import React, { useState } from 'react';
import { Calendar, Users, ShieldCheck, Sparkles, Check, ArrowRight, Loader2, Lock } from 'lucide-react';
import { BusinessListing, ServiceOfferingDto, BookingDto } from '@/lib/types';
import { formatRwf, formatUsd } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { PaymentModal } from './PaymentModal';
import { BookingVoucherModal } from './BookingVoucherModal';
import { Input } from '@/components/ui/Input';

interface BookingWidgetProps {
  business: BusinessListing;
  selectedOfferingId?: string;
  onOfferingSelect?: (id: string) => void;
}

export function BookingWidget({ business, selectedOfferingId, onOfferingSelect }: BookingWidgetProps) {
  const { user } = useAuth();
  const offerings = business.offerings || [];
  const defaultOffering = offerings.find((o) => o.id === selectedOfferingId) || offerings[0];

  const [activeOffering, setActiveOffering] = useState<ServiceOfferingDto | undefined>(defaultOffering);
  const [checkIn, setCheckIn] = useState('2026-08-15');
  const [checkOut, setCheckOut] = useState('2026-08-18');
  const [guests, setGuests] = useState(2);
  const [depositOnly, setDepositOnly] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Modals state
  const [activeBooking, setActiveBooking] = useState<BookingDto | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const calculateDays = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const days = calculateDays();
  const baseRate = activeOffering?.price || business.basePrice;
  let total = baseRate;
  if (activeOffering?.unit === 'per_night') {
    total = baseRate * days;
  } else if (activeOffering?.unit === 'per_person') {
    total = baseRate * guests;
  }

  const depositPayable = depositOnly ? Math.round(total * 0.3) : total;

  const handleInitiateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          serviceOfferingId: activeOffering?.id || business.offerings?.[0]?.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
          depositOnly,
          specialRequests,
          guestName: user?.name || 'Clarisse Mutoni',
          guestEmail: user?.email || 'customer@luxehub.rw',
          guestPhone: user?.phone || '+250 788 123 456',
        }),
      });

      const data = await res.json();
      if (res.ok && data.booking) {
        setActiveBooking(data.booking);
        setShowPaymentModal(true);
      } else {
        alert(data.error || 'Booking reservation failed. Please verify dates.');
      }
    } catch (e) {
      console.error('Booking failed:', e);
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedBooking: BookingDto) => {
    setActiveBooking(updatedBooking);
    setShowPaymentModal(false);
    setShowVoucherModal(true);
  };

  return (
    <>
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xl shadow-slate-200/60 space-y-6">
        
        {/* Price Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div>
            <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Direct Verified Rate</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {formatRwf(baseRate)}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">
                /{activeOffering?.unit?.replace('per_', '') || 'night'}
              </span>
            </div>
            <div className="text-xs text-sky-600 font-bold">
              ~{formatUsd(Math.round(baseRate / 1350))} USD
            </div>
          </div>

          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guaranteed</span>
          </div>
        </div>

        <form onSubmit={handleInitiateBooking} className="space-y-4">
          
          {/* Service Offering Picker if multiple exist */}
          {offerings.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
                Select Package / Villa
              </label>
              <select
                value={activeOffering?.id}
                onChange={(e) => {
                  const found = offerings.find((o) => o.id === e.target.value);
                  setActiveOffering(found);
                  if (onOfferingSelect && found) onOfferingSelect(found.id);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
              >
                {offerings.map((off) => (
                  <option key={off.id} value={off.id} className="bg-white text-slate-900">
                    {off.title} ({formatRwf(off.price)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-600" /> Check-in
              </label>
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-600" /> Check-out
              </label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="cursor-pointer"
              />
            </div>
          </div>

          {/* Guests Count */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
            <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-sky-600" /> Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value, 10))}
              className="w-full bg-transparent text-slate-900 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num} className="bg-white text-slate-900">
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          {/* Deposit Option Toggle */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">Pay 30% Deposit Only</span>
              <p className="text-[10px] text-slate-500">Balance due upon arrival in Rwanda</p>
            </div>
            <input
              type="checkbox"
              checked={depositOnly}
              onChange={(e) => setDepositOnly(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-600 accent-sky-600 cursor-pointer"
            />
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              rows={2}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Airport luxury shuttle, champagne in suite, dietary requirements..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white placeholder-slate-400 transition-all"
            />
          </div>

          {/* Price Breakdown */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>{formatRwf(baseRate)} × {activeOffering?.unit === 'per_night' ? `${days} night(s)` : `${guests} guest(s)`}</span>
              <span className="font-bold text-slate-800">{formatRwf(total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Luxe Hub Quality Assurance Audit</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-100">
              <span>Payable Now:</span>
              <span className="text-sky-600">{formatRwf(depositPayable)}</span>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {bookingLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Securing Reservation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Reserve & Pay via MoMo / Card</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>

        </form>

        <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <Lock className="w-3.5 h-3.5 text-sky-600" />
          <span>Zero cancellation fees up to 48 hours prior to arrival</span>
        </div>

      </div>

      {/* Payment Modal */}
      {activeBooking && (
        <PaymentModal
          booking={activeBooking}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Printable Booking Voucher Modal */}
      {activeBooking && (
        <BookingVoucherModal
          booking={activeBooking}
          isOpen={showVoucherModal}
          onClose={() => setShowVoucherModal(false)}
        />
      )}
    </>
  );
}
