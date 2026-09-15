'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Smartphone, CreditCard, ShieldCheck, Sparkles, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { BookingDto } from '@/lib/types';
import { formatRwf } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface PaymentModalProps {
  booking: BookingDto;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (updatedBooking: BookingDto) => void;
}

type Provider = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD';
type Phase = 'form' | 'awaiting' | 'failed';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * Checkout for a reservation.
 *
 * Mobile money and hosted card payments settle asynchronously, so this waits
 * on the real gateway result instead of assuming success: it polls
 * `/api/payments/{ref}/status` until the payment resolves or the window
 * expires. Nothing here decides whether a booking is confirmed — the server
 * does, from what the gateway reports.
 */
export function PaymentModal({ booking, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [provider, setProvider] = useState<Provider>('MTN_MOMO');
  const [paymentType, setPaymentType] = useState<'FULL' | 'DEPOSIT'>('FULL');
  const [phone, setPhone] = useState(booking.guestPhone || '');
  const [processing, setProcessing] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setProcessing(false);
      setPhase('form');
      setError('');
      setRedirectUrl(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMobileMoney = provider === 'MTN_MOMO' || provider === 'AIRTEL_MONEY';

  const outstanding =
    booking.paymentStatus === 'DEPOSIT_PAID' ? booking.totalAmount - booking.depositAmount : booking.totalAmount;
  const depositDue = booking.depositAmount > 0 ? booking.depositAmount : Math.round(booking.totalAmount * 0.3);
  const payableAmount =
    paymentType === 'DEPOSIT' && booking.paymentStatus !== 'DEPOSIT_PAID' ? Math.min(depositDue, outstanding) : outstanding;

  const finish = async () => {
    stopPolling();
    const res = await fetch(`/api/bookings/${booking.id}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.booking) onPaymentSuccess(data.booking);
  };

  const beginPolling = (transactionRef: string) => {
    const startedAt = Date.now();
    stopPolling();

    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopPolling();
        setPhase('failed');
        setProcessing(false);
        setError('We did not receive a confirmation in time. If you were charged, our team will confirm your booking shortly.');
        return;
      }

      try {
        const res = await fetch(`/api/payments/${transactionRef}/status`, { cache: 'no-store' });
        const data = await res.json();

        if (data.status === 'SUCCESS') {
          await finish();
        } else if (data.status === 'FAILED') {
          stopPolling();
          setPhase('failed');
          setProcessing(false);
          setError(data.message || 'The payment was not completed.');
        } else if (data.message) {
          setStatusMessage(data.message);
        }
      } catch {
        // A transient network error should not end the wait; the next tick retries.
      }
    }, POLL_INTERVAL_MS);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          provider,
          paymentType,
          payerPhone: isMobileMoney ? phone : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPhase('failed');
        setProcessing(false);
        setError(data.error || 'We could not start this payment. Please try again.');
        return;
      }

      if (data.status === 'SUCCESS') {
        await finish();
        return;
      }

      if (data.status === 'FAILED') {
        setPhase('failed');
        setProcessing(false);
        setError(data.message || 'The payment was declined.');
        return;
      }

      // PENDING: a USSD prompt is on its way, or a hosted checkout must open.
      setPhase('awaiting');
      setStatusMessage(data.message || 'Waiting for confirmation…');
      setRedirectUrl(data.redirectUrl ?? null);

      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
      }
      if (data.transactionRef) {
        beginPolling(data.transactionRef);
      }
    } catch {
      setPhase('failed');
      setProcessing(false);
      setError('We could not reach the payment service. Please check your connection and try again.');
    }
  };

  const providerOptions: { id: Provider; icon: typeof Smartphone; label: string; hint: string; accent: string }[] = [
    { id: 'MTN_MOMO', icon: Smartphone, label: 'MTN MoMo', hint: '#1 in Rwanda', accent: 'sky' },
    { id: 'AIRTEL_MONEY', icon: Smartphone, label: 'Airtel Money', hint: 'Instant USSD', accent: 'red' },
    { id: 'CARD', icon: CreditCard, label: 'Visa / Master', hint: 'Secure checkout', accent: 'blue' },
  ];

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        if (!processing) onClose();
      }}
      title="Secure Rwandan Payment Gateway"
      subtitle={`Ref #${booking.bookingRef} • Verified escrow protection`}
      size="md"
    >
      {/* Amount summary */}
      <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total reservation amount</span>
            <div className="text-xl font-extrabold text-slate-900">{formatRwf(booking.totalAmount)}</div>
          </div>

          {booking.paymentStatus !== 'DEPOSIT_PAID' && (
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-sm">
              {(['FULL', 'DEPOSIT'] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  onClick={() => setPaymentType(type)}
                  disabled={processing}
                  variant="ghost"
                  size="sm"
                  className={`!rounded-lg !px-3 !py-1 border-none shadow-none ${
                    paymentType === type ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25' : 'bg-transparent text-slate-500'
                  }`}
                >
                  {type === 'FULL' ? '100% Full' : '30% Deposit'}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 text-xs font-extrabold text-slate-900 flex items-center justify-between pt-2 border-t border-slate-200/60">
          <span className="text-slate-600">Payable now:</span>
          <span className="text-sky-600 text-sm">{formatRwf(payableAmount)}</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {error && (
          <div role="alert" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-900 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {phase === 'awaiting' ? (
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-300 text-center space-y-3">
            <div className="inline-block p-3 rounded-full bg-sky-100 text-sky-800 animate-pulse">
              {isMobileMoney ? <Smartphone className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <p className="text-xs font-bold text-slate-900 leading-relaxed">{statusMessage}</p>
            <div className="w-full bg-sky-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-sky-600 h-full w-full animate-shimmer" />
            </div>
            {redirectUrl && (
              <a
                href={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-sky-700 hover:underline"
              >
                <span>Reopen the secure checkout</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <p className="text-[10px] text-slate-500 font-medium">
              Keep this window open — your booking confirms automatically once the payment clears.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5">
              {providerOptions.map(({ id, icon: Icon, label, hint, accent }) => (
                <Button
                  key={id}
                  type="button"
                  onClick={() => setProvider(id)}
                  disabled={processing}
                  variant="ghost"
                  className={`!h-auto !w-full !flex-col border shadow-none ${
                    provider === id
                      ? `bg-${accent}-50 border-${accent}-500 text-${accent}-950 shadow-sm ring-2 ring-${accent}-500/20`
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Icon className={`w-5 h-5 text-${accent}-600`} />
                    <span className="text-[11px] font-bold">{label}</span>
                    <span className={`text-[9px] text-${accent}-700 font-medium`}>{hint}</span>
                  </div>
                </Button>
              ))}
            </div>

            {isMobileMoney ? (
              <div>
                <Input
                  label={provider === 'MTN_MOMO' ? 'MTN Rwanda mobile money number' : 'Airtel Money phone number'}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 788 000 000"
                  required
                  className="font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  You will receive a prompt on your handset to approve this payment with your PIN.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Card details are entered on our payment provider&apos;s secure checkout, which opens in a new window.
                  Higa Lux never sees or stores your card number.
                </p>
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
              {processing ? 'Contacting the gateway…' : `Authorize & pay ${formatRwf(payableAmount)}`}
            </Button>
          </form>
        )}

        <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Encrypted in transit • Settled through licensed Rwandan payment providers</span>
        </div>
      </div>
    </Modal>
  );
}
