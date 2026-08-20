'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  CalendarCheck, 
  Award, 
  Star, 
  ShieldCheck, 
  PlusCircle, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BusinessListing, BookingDto } from '@/lib/types';
import { formatRwf, formatUsd } from '@/lib/utils';
import { CertificationBadge } from '@/components/ui/CertificationBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { Modal } from '@/components/ui/Modal';

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);

  // New offering modal state
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('450000');
  const [newCapacity, setNewCapacity] = useState('2');
  const [newUnit, setNewUnit] = useState('per_night');
  const [newDesc, setNewDesc] = useState('');
  const [addingOffering, setAddingOffering] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPartnerData = async () => {
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      if (data.businesses && data.businesses.length > 0) {
        const myBiz = data.businesses.find((b: any) => b.ownerId === user?.id) || data.businesses[0];
        setBusiness(myBiz);

        const bRes = await fetch('/api/bookings');
        const bData = await bRes.json();
        if (bData.bookings) {
          setBookings(bData.bookings);
        }
      }
    } catch (e) {
      console.error('Failed to load partner data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerData();
  }, [user]);

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !newTitle) return;
    setAddingOffering(true);

    try {
      const res = await fetch(`/api/businesses/${business.id}/offerings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc || 'Verified luxury package with bespoke amenities.',
          price: parseInt(newPrice, 10),
          capacity: parseInt(newCapacity, 10),
          unit: newUnit,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchPartnerData();
      }
    } catch (e) {
      console.error('Create offering failed:', e);
    } finally {
      setAddingOffering(false);
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => (b.paymentStatus === 'FULLY_PAID' ? sum + b.totalAmount : sum), 0);
  const totalPayout = bookings.reduce((sum, b) => (b.paymentStatus === 'FULLY_PAID' ? sum + b.payoutAmount : sum), 0);

  const now = new Date();
  const thisMonthRevenue = bookings
    .filter((b) => b.paymentStatus === 'FULLY_PAID' && new Date(b.createdAt).getMonth() === now.getMonth() && new Date(b.createdAt).getFullYear() === now.getFullYear())
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthRevenue = bookings
    .filter((b) => b.paymentStatus === 'FULLY_PAID' && new Date(b.createdAt).getMonth() === lastMonthDate.getMonth() && new Date(b.createdAt).getFullYear() === lastMonthDate.getFullYear())
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const revenueTrendPct = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : null;

  return (
    <div className="w-full space-y-10 pb-20">
      
      {/* Full-width Dark Banner Header (Clean, no eyebrow tag) */}
      <div className="w-full bg-gradient-to-b from-[#0B1B36] via-[#0D2240] to-[#0B1B36] text-white py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {business && <CertificationBadge badge={business.certificationBadge} size="sm" />}
            </div>
            <Text as="h1" variant="h1" color="white" className="text-3xl sm:text-5xl">
              {business ? business.name : 'The Retreat by Heaven'}
            </Text>
            <Text variant="caption" className="text-xs sm:text-sm text-sky-100/90 font-medium">
              RDB Accredited 5-Star Property • Managed by {user?.name || 'Jean-Paul N.'}
            </Text>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/partner/academy"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all backdrop-blur-md"
            >
              <GraduationCap className="w-4 h-4 text-sky-400" />
              <span>Staff Academy</span>
            </Link>

            <Link
              href="/partner/subscriptions"
              className="px-5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 text-xs font-bold flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <Award className="w-4 h-4 text-sky-400" />
              <span>Membership Tier</span>
            </Link>

            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="!rounded-xl !bg-sky-500 hover:!bg-sky-400 !text-slate-950 !border-none shadow-lg shadow-sky-500/30"
            >
              Add Suite / Package
            </Button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* KPI Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Net Payout Revenue</span>
              <TrendingUp className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{formatRwf(totalPayout)}</div>
            <div className="text-[11px] font-extrabold flex items-center gap-1">
              {revenueTrendPct === null ? (
                <span className="text-slate-500">No prior month to compare</span>
              ) : (
                <span className={revenueTrendPct >= 0 ? 'text-sky-700' : 'text-red-600'}>
                  {revenueTrendPct >= 0 ? '+' : ''}
                  {revenueTrendPct.toFixed(1)}% vs last month
                </span>
              )}
            </div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>QA Audit Score</span>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {business?.qualityScore != null ? `${business.qualityScore}%` : 'Pending'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {business?.qualityScore != null ? 'Gold Standard Benchmark' : 'Awaiting first 40-point audit'}
            </div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Verified Guest Rating</span>
              <Star className="w-4 h-4 text-sky-600 fill-sky-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {business ? business.ratingAvg.toFixed(2) : '—'} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {business?.reviewCount ?? 0} verified traveler reviews
            </div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Guest Response Rate</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{business?.responseRate ?? '—'}%</div>
            <div className="text-[11px] text-sky-700 font-extrabold">
              Based on verified guest inquiries
            </div>
          </Card>

        </div>

        {/* Main Grid: Active Reservations & Managed Packages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Reservations */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <Text as="h2" variant="h2" color="dark" className="text-2xl flex items-center gap-2">
                <CalendarCheck className="w-6 h-6 text-sky-600" />
                <span>Active Guest Reservations</span>
              </Text>
              <span className="text-xs text-slate-500 font-extrabold">{bookings.length} Total Bookings</span>
            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center text-xs text-slate-500 font-medium">
                  No active bookings yet.
                </div>
              ) : (
                bookings.map((b) => (
                  <Card key={b.id} variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-6 space-y-3 hover:shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">#{b.bookingRef}</span>
                        <span className="text-xs font-bold text-slate-900">{b.guestName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="status" className="!rounded-full text-[10px]">
                          {b.status}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900">{formatRwf(b.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Dates</span>
                        <strong className="text-slate-900">{new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Package</span>
                        <strong className="text-slate-900">{b.serviceOffering?.title || 'Luxury Suite'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Contact</span>
                        <span className="text-slate-700">{b.guestPhone}</span>
                      </div>
                    </div>

                    {b.specialRequests && (
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-medium">
                        <strong>Special Request:</strong> {b.specialRequests}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right 1 Col: Managed Suites / Packages */}
          <div className="space-y-6">

            <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Text as="h3" variant="h4" color="dark" className="font-extrabold text-base">Suites & Offerings</Text>
                <Button
                  onClick={() => setShowAddModal(true)}
                  variant="ghost"
                  size="sm"
                  className="!px-0 !py-0 bg-transparent border-none shadow-none text-sky-700 hover:underline !text-xs font-extrabold"
                >
                  + Add
                </Button>
              </div>

              <div className="space-y-3">
                {business?.offerings?.map((off) => (
                  <div key={off.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{off.title}</span>
                      <span className="text-sky-700 font-mono font-bold">{formatRwf(off.price)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">{off.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-6 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <Text as="h3" variant="h4" color="dark" className="font-extrabold text-base">QA Recommendations</Text>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                To maintain <strong>Gold Standard</strong> certification, complete the upcoming Staff Masterclass in Rwandan Coffee & Tea Sommelier Service.
              </p>
              <Link
                href="/partner/academy"
                className="inline-block text-xs font-extrabold text-sky-600 hover:underline"
              >
                Enroll Staff in Masterclass →
              </Link>
            </Card>

          </div>

        </div>

      </div>

      {/* Add Offering Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Experience / Suite"
        size="sm"
      >
        <form onSubmit={handleCreateOffering} className="p-6 space-y-3">
          <Input
            label="Package Title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Forest Villa with Private Heated Plunge Pool"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (RWF)"
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              required
            />

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Billing Unit</label>
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:bg-white"
              >
                <option value="per_night">Per Night</option>
                <option value="per_person">Per Person</option>
                <option value="per_table">Per Table</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Description</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Private plunge pool, personal butler, volcano panoramic views..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-normal focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              onClick={() => setShowAddModal(false)}
              variant="ghost"
              size="sm"
              className="bg-transparent border-none shadow-none text-slate-500 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={addingOffering}
              variant="primary"
              size="sm"
              className="!rounded-xl hover:opacity-95"
            >
              {addingOffering ? 'Creating...' : 'Save Package'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
