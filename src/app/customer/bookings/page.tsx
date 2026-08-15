'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarCheck,
  MapPin,
  Sparkles,
  Printer,
  CreditCard,
  Star,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Gem
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BookingDto, LoyaltyStatusDto } from '@/lib/types';
import { formatRwf, formatUsd } from '@/lib/utils';
import { BookingVoucherModal } from '@/components/booking/BookingVoucherModal';
import { PaymentModal } from '@/components/booking/PaymentModal';
import { ReviewSubmissionModal } from '@/components/reviews/ReviewSubmissionModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyStatusDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedVoucherBooking, setSelectedVoucherBooking] = useState<BookingDto | null>(null);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState<BookingDto | null>(null);
  const [selectedReviewBooking, setSelectedReviewBooking] = useState<BookingDto | null>(null);

  const fetchCustomerBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoyaltyStatus = async () => {
    try {
      const res = await fetch('/api/loyalty');
      const data = await res.json();
      if (res.ok) {
        setLoyalty(data);
      }
    } catch (e) {
      console.error('Failed to load loyalty status:', e);
    }
  };

  useEffect(() => {
    fetchCustomerBookings();
    fetchLoyaltyStatus();
  }, [user]);

  return (
    <div className="w-full space-y-10 pb-20">
      
      {/* Header Banner (Clean, no eyebrow tag) */}
      <div className="w-full bg-gradient-to-b from-[#0B1B36] via-[#0D2240] to-[#0B1B36] text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <Text as="h1" variant="h1" color="white" className="text-3xl sm:text-5xl">
              My Luxury <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-amber-200">Reservations</span>
            </Text>
            <Text variant="caption" className="text-xs sm:text-sm text-sky-100/90 font-medium">
              Manage your verified Rwandan bookings, download QR vouchers, and write verified reviews.
            </Text>
          </div>

          <Link
            href="/explore"
            className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/30 transition-all self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Book New Experience</span>
          </Link>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {loyalty && (
          <Card
            variant="compact"
            title=""
            className="!rounded-3xl border-amber-200 bg-gradient-to-r from-amber-50 to-white shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <Text variant="h4" color="dark">{loyalty.points.toLocaleString()} Loyalty Points</Text>
                <Text variant="caption" color="muted">
                  {loyalty.tier} Tier
                  {loyalty.nextTier
                    ? ` • ${loyalty.pointsToNextTier.toLocaleString()} pts to ${loyalty.nextTier}`
                    : ' • Highest tier reached'}
                </Text>
              </div>
            </div>
            <Badge variant="accent" className="!rounded-full">Earn 1 pt / 1,000 RWF spent</Badge>
          </Card>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 mt-3 font-medium">Loading your reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white text-center space-y-4 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Reservations Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-normal">
              You haven&apos;t booked any luxury experiences yet. Explore Rwanda&apos;s verified 5-star lodges and safari tours today.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 hover:opacity-95"
            >
              Explore Venues
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => (
              <Card
                key={b.id}
                variant="compact"
                title=""
                className="!rounded-3xl border-slate-200 hover:border-sky-400 hover:shadow-md shadow-sm p-6 space-y-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-900">
                      #{b.bookingRef}
                    </span>

                    <Badge
                      variant="status"
                      className={`!rounded-full text-[10px] ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : b.status === 'COMPLETED'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {b.status}
                    </Badge>

                    <Badge
                      variant="status"
                      className={`!rounded-full text-[10px] border-none ${
                        b.paymentStatus === 'FULLY_PAID'
                          ? 'bg-emerald-50 text-emerald-800'
                          : b.paymentStatus === 'DEPOSIT_PAID'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {b.paymentStatus.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">
                      {formatRwf(b.totalAmount)}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        (~{formatUsd(Math.round(b.totalAmount / 1350))})
                      </span>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  
                  <div className="md:col-span-2 space-y-1">
                    <h3 className="font-bold text-lg text-slate-900">
                      {b.business?.name}
                    </h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      <span>{b.business?.location}, Rwanda</span>
                    </p>
                    <p className="text-xs text-slate-600 pt-1 font-normal">
                      Package: <strong className="text-slate-900 font-bold">{b.serviceOffering?.title}</strong> ({b.guests} Guest(s))
                    </p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400 font-medium">Check-in / Start:</div>
                    <div className="font-bold text-slate-900">{new Date(b.checkInDate).toLocaleDateString()}</div>
                    <div className="text-slate-400 pt-1 font-medium">Check-out / End:</div>
                    <div className="font-bold text-slate-900">{new Date(b.checkOutDate).toLocaleDateString()}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setSelectedVoucherBooking(b)}
                      variant="outline"
                      size="sm"
                      fullWidth
                      leftIcon={<Printer className="w-3.5 h-3.5 text-sky-600" />}
                      className="!rounded-xl bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900 shadow-none"
                    >
                      QR Voucher
                    </Button>

                    {b.paymentStatus === 'UNPAID' && (
                      <Button
                        onClick={() => setSelectedPaymentBooking(b)}
                        variant="primary"
                        size="sm"
                        fullWidth
                        leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                        className="!rounded-xl hover:opacity-95"
                      >
                        Pay via MoMo
                      </Button>
                    )}

                    {b.status === 'COMPLETED' && !b.review && (
                      <Button
                        onClick={() => setSelectedReviewBooking(b)}
                        variant="outline"
                        size="sm"
                        fullWidth
                        leftIcon={<Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        className="!rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-none"
                      >
                        Write Review
                      </Button>
                    )}

                    {b.review && (
                      <div className="text-center text-[10px] text-emerald-700 flex items-center justify-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Review Submitted</span>
                      </div>
                    )}
                  </div>

                </div>

              </Card>
            ))}
          </div>
        )}

      </div>

      {/* Voucher Modal */}
      {selectedVoucherBooking && (
        <BookingVoucherModal
          booking={selectedVoucherBooking}
          isOpen={!!selectedVoucherBooking}
          onClose={() => setSelectedVoucherBooking(null)}
        />
      )}

      {/* Payment Modal */}
      {selectedPaymentBooking && (
        <PaymentModal
          booking={selectedPaymentBooking}
          isOpen={!!selectedPaymentBooking}
          onClose={() => setSelectedPaymentBooking(null)}
          onPaymentSuccess={() => {
            setSelectedPaymentBooking(null);
            fetchCustomerBookings();
          }}
        />
      )}

      {/* Review Submission Modal */}
      {selectedReviewBooking && (
        <ReviewSubmissionModal
          booking={selectedReviewBooking}
          isOpen={!!selectedReviewBooking}
          onClose={() => setSelectedReviewBooking(null)}
          onSuccess={() => {
            fetchCustomerBookings();
          }}
        />
      )}

    </div>
  );
}
