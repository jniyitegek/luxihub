'use client';

import React, { useState } from 'react';
import { Smartphone, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { BookingDto } from '@/lib/types';
import { formatRwf, formatUsd } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PaymentModalProps {
  booking: BookingDto;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedBooking: BookingDto) => void;
}

export function PaymentModal({ booking, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [provider, setProvider] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD'>('MTN_MOMO');
  const [paymentType, setPaymentType] = useState<'FULL' | 'DEPOSIT'>('FULL');
  const [phone, setPhone] = useState(booking.guestPhone || '+250 788 123 456');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [processing, setProcessing] = useState(false);
  const [ussdPromptStep, setUssdPromptStep] = useState(0); // 0: initial, 1: sending ussd, 2: prompt active, 3: completed

  if (!isOpen) return null;

  const payableAmount = paymentType === 'DEPOSIT' && booking.depositAmount > 0 
    ? booking.depositAmount 
    : paymentType === 'DEPOSIT' 
      ? Math.round(booking.totalAmount * 0.3) 
      : booking.totalAmount;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    if (provider === 'MTN_MOMO' || provider === 'AIRTEL_MONEY') {
      setUssdPromptStep(1);
      setTimeout(() => setUssdPromptStep(2), 1500); // Simulate prompt arrival on phone
      setTimeout(async () => {
        setUssdPromptStep(3);
        await executePaymentApi();
      }, 3500); // Simulate PIN entry
    } else {
      setTimeout(async () => {
        await executePaymentApi();
      }, 2000);
    }
  };

  const executePaymentApi = async () => {
    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          provider,
          amount: payableAmount,
          payerPhone: phone,
          paymentType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.booking) {
        onPaymentSuccess(data.booking);
      } else {
        alert(data.error || 'Payment failed');
        setProcessing(false);
        setUssdPromptStep(0);
      }
    } catch (e) {
      console.error('Payment error:', e);
      setProcessing(false);
      setUssdPromptStep(0);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        if (!processing) onClose();
      }}
      title="Secure Rwandan Payment Gateway"
      subtitle={`Ref #${booking.bookingRef} • Verified Escrow Protection`}
      size="md"
    >
        {/* Amount Summary */}
        <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Reservation Amount</span>
              <div className="text-xl font-extrabold text-slate-900">{formatRwf(booking.totalAmount)}</div>
            </div>

            {/* Deposit Option */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-sm">
              <Button
                type="button"
                onClick={() => setPaymentType('FULL')}
                disabled={processing}
                variant="ghost"
                size="sm"
                className={`!rounded-lg !px-3 !py-1 border-none shadow-none ${
                  paymentType === 'FULL' ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25' : 'bg-transparent text-slate-500'
                }`}
              >
                100% Full
              </Button>
              <Button
                type="button"
                onClick={() => setPaymentType('DEPOSIT')}
                disabled={processing}
                variant="ghost"
                size="sm"
                className={`!rounded-lg !px-3 !py-1 border-none shadow-none ${
                  paymentType === 'DEPOSIT' ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25' : 'bg-transparent text-slate-500'
                }`}
              >
                30% Deposit
              </Button>
            </div>
          </div>

          <div className="mt-2 text-xs font-extrabold text-slate-900 flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-slate-600">Payable Now:</span>
            <span className="text-sky-600 text-sm">{formatRwf(payableAmount)} (~{formatUsd(Math.round(payableAmount / 1350))})</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Provider Selection */}
          <div className="grid grid-cols-3 gap-2.5">
            <Button
              type="button"
              onClick={() => setProvider('MTN_MOMO')}
              disabled={processing}
              variant="ghost"
              className={`!h-auto !w-full !flex-col border shadow-none ${
                provider === 'MTN_MOMO'
                  ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-sm ring-2 ring-sky-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-sky-600" />
                <span className="text-[11px] font-bold">MTN MoMo</span>
                <span className="text-[9px] text-sky-700 font-medium">#1 in Rwanda</span>
              </div>
            </Button>

            <Button
              type="button"
              onClick={() => setProvider('AIRTEL_MONEY')}
              disabled={processing}
              variant="ghost"
              className={`!h-auto !w-full !flex-col border shadow-none ${
                provider === 'AIRTEL_MONEY'
                  ? 'bg-red-50 border-red-500 text-red-950 shadow-sm ring-2 ring-red-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-red-600" />
                <span className="text-[11px] font-bold">Airtel Money</span>
                <span className="text-[9px] text-red-700 font-medium">Instant USSD</span>
              </div>
            </Button>

            <Button
              type="button"
              onClick={() => setProvider('CARD')}
              disabled={processing}
              variant="ghost"
              className={`!h-auto !w-full !flex-col border shadow-none ${
                provider === 'CARD'
                  ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-[11px] font-bold">Visa / Master</span>
                <span className="text-[9px] text-blue-700 font-medium">Global Card</span>
              </div>
            </Button>
          </div>

          {/* Simulated USSD Prompt Animation if processing MoMo */}
          {processing && (provider === 'MTN_MOMO' || provider === 'AIRTEL_MONEY') ? (
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-300 text-center space-y-3 animate-in fade-in">
              <div className="inline-block p-3 rounded-full bg-sky-100 text-sky-800 animate-pulse">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-900">
                {ussdPromptStep === 1 && `Sending authorization request to ${phone}...`}
                {ussdPromptStep === 2 && `USSD Prompt displayed on phone. Confirm ${formatRwf(payableAmount)} with your PIN...`}
                {ussdPromptStep === 3 && `PIN verified! Completing reservation confirmation...`}
              </div>
              <div className="w-full bg-sky-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-sky-600 h-full w-full animate-shimmer" />
              </div>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              
              {provider === 'MTN_MOMO' || provider === 'AIRTEL_MONEY' ? (
                <div>
                  <Input
                    label={provider === 'MTN_MOMO' ? 'MTN Rwanda Mobile Money Number' : 'Airtel Money Phone Number'}
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    required
                    className="font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    You will receive an instant pop-up prompt on your mobile handset to enter your PIN.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Card Number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="font-mono"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Expiry"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="font-mono"
                    />
                    <Input
                      label="CVC"
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                isLoading={processing}
                variant="primary"
                fullWidth
                className="!rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 hover:opacity-95 hover:scale-[1.01] active:scale-95"
                leftIcon={!processing ? <Sparkles className="w-4 h-4 text-white" /> : undefined}
              >
                {processing ? 'Authorizing Transaction...' : `Authorize & Pay ${formatRwf(payableAmount)}`}
              </Button>

            </form>
          )}

          {/* Security Guarantee Note */}
          <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit Encrypted Escrow • Rwanda National Bank Compliant</span>
          </div>

        </div>
    </Modal>
  );
}
