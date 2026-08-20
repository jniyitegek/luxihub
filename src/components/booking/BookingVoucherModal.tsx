'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { X, Printer, Download, Sparkles, ShieldCheck, MapPin, Calendar, Users, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { BookingDto } from '@/lib/types';
import { formatRwf, formatPrice } from '@/lib/utils';
import { CertificationBadge } from '../ui/CertificationBadge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface VoucherModalProps {
  booking: BookingDto;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingVoucherModal({ booking, isOpen, onClose }: VoucherModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (booking && isOpen) {
      const qrData = JSON.stringify({
        ref: booking.bookingRef,
        guest: booking.guestName,
        venue: booking.business?.name,
        checkIn: booking.checkInDate,
        status: booking.status,
        payment: booking.paymentStatus,
      });

      QRCode.toDataURL(qrData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0A0D14',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [booking, isOpen]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={isOpen && !!booking}
      onClose={onClose}
      size="lg"
      className="print:border-none print:shadow-none print:bg-white print:text-black"
    >
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Official Booking Confirmation Voucher</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              variant="primary"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="!rounded-xl hover:opacity-95"
            >
              Print Voucher
            </Button>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Printable Certificate */}
        <div className="p-8 space-y-6 print:p-6 print:space-y-4">
          
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <Image
                src="/logo/higa_logo_horizontal_blue.png"
                alt="Higa Lux"
                width={180}
                height={60}
                className="h-9 w-auto mb-1"
              />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Verified Rwandan Luxury Hospitality Voucher
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 font-medium">Booking Reference</div>
              <div className="text-lg font-mono font-bold text-sky-700 tracking-wider">
                {booking.bookingRef}
              </div>
              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-sky-700">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                <span>CONFIRMED & GUARANTEED</span>
              </div>
            </div>
          </div>

          {/* Venue & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Reserved Property / Experience</span>
                <h2 className="text-xl font-bold text-slate-900">
                  {booking.business?.name}
                </h2>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>{booking.business?.address}, {booking.business?.location}, Rwanda</span>
                </p>
              </div>

              {/* Service Offering Title */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-sky-800">Service Package</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {booking.serviceOffering?.title}
                </div>
                <div className="text-xs text-slate-600 mt-1 font-medium">
                  Guests: <strong className="text-slate-900">{booking.guests} Guest(s)</strong>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-600" />
                    Check-in / Start
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">From 2:00 PM</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-600" />
                    Check-out / End
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">By 11:00 AM</div>
                </div>
              </div>

            </div>

            {/* QR Code and Check-in Scan Box */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-900 text-center space-y-2 border border-slate-200">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Booking QR" className="w-36 h-36 rounded-lg shadow-sm border border-slate-200" />
              ) : (
                <div className="w-36 h-36 bg-slate-200 rounded-lg animate-pulse" />
              )}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900">
                Scan for VIP Check-in
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                {booking.bookingRef}
              </div>
            </div>

          </div>

          {/* Guest Information & Payment Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Lead Guest</span>
              <div className="text-sm font-bold text-slate-900">{booking.guestName}</div>
              <div className="text-xs text-slate-600 flex items-center gap-2 mt-1 font-medium">
                <span>{booking.guestPhone}</span> • <span>{booking.guestEmail}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Payment Status</span>
              <div className="text-sm font-bold text-sky-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{booking.paymentStatus === 'FULLY_PAID' ? 'Fully Paid' : 'Deposit Paid'}</span>
              </div>
              <div className="text-xs text-slate-600 mt-1 font-medium">
                Total: <strong className="text-slate-900">{formatRwf(booking.totalAmount)}</strong> via {booking.payment?.provider || 'MTN MoMo'}
              </div>
            </div>
          </div>

          {/* Quality Assurance Seal Footer */}
          <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span className="font-medium">40-Point QA Certified • 24/7 Concierge Support: +250 788 123 456</span>
            </div>
            <div className="italic text-slate-700 font-medium">
              Murakaza Neza mu Rwanda
            </div>
          </div>

        </div>

    </Modal>
  );
}
