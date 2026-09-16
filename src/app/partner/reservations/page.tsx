'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  Building2, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BookingDto, BusinessListing } from '@/lib/types';
import { formatRwf } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

type DateRangeFilter = 'ALL' | 'TODAY' | 'NEXT_7_DAYS' | 'NEXT_30_DAYS';

export default function PartnerReservationsPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('ALL');

  const fetchReservationsData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const bizRes = await fetch('/api/businesses', { cache: 'no-store' });
      const bizData = await bizRes.json();
      const owned = (bizData.businesses ?? []).filter((b: BusinessListing) => b.ownerId === user.id);
      const active = owned[0] ?? null;

      setBusiness(active);

      if (active) {
        const bRes = await fetch('/api/bookings', { cache: 'no-store' });
        const bData = await bRes.json();
        const allBookings: BookingDto[] = bData.bookings ?? [];
        // Filter bookings belonging to this business
        const bizBookings = allBookings.filter((b) => b.businessId === active.id);
        setBookings(bizBookings);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error('Failed to load reservations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservationsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const now = new Date();

  const filteredBookings = bookings.filter((b) => {
    // Search query matching guest name or booking ref
    const matchesSearch =
      !searchQuery ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    // Category filter based on offering category or unit
    const offeringCategory = (b.serviceOffering?.category || 'STAYS').toUpperCase();
    const matchesCategory =
      categoryFilter === 'ALL' || offeringCategory === categoryFilter;

    // Date range filter
    const checkIn = new Date(b.checkInDate);
    let matchesDateRange = true;
    if (dateRangeFilter === 'TODAY') {
      matchesDateRange = checkIn.toDateString() === now.toDateString();
    } else if (dateRangeFilter === 'NEXT_7_DAYS') {
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      matchesDateRange = checkIn >= now && checkIn <= in7Days;
    } else if (dateRangeFilter === 'NEXT_30_DAYS') {
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      matchesDateRange = checkIn >= now && checkIn <= in30Days;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-20 rounded-3xl bg-slate-200/70 animate-pulse" />
        <div className="h-96 rounded-3xl bg-slate-200/70 animate-pulse" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <Building2 className="w-12 h-12 mx-auto text-sky-600" />
        <h1 className="text-2xl font-bold text-slate-900">No Business Linked</h1>
        <p className="text-sm text-slate-600">Register your business establishment to view reservations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader
        title="Guest Reservations"
        subtitle={`All active and past bookings for ${business.name}`}
        logoUrl={business.logoUrl}
      />

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest name or booking ID (#BIZ...)..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="STAYS">Stays</option>
            <option value="EXPERIENCES">Experiences</option>
            <option value="DINING">Dining</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Arriving Today</option>
            <option value="NEXT_7_DAYS">Next 7 Days</option>
            <option value="NEXT_30_DAYS">Next 30 Days</option>
          </select>
        </div>
      </div>

      {/* Reservations Table / Cards */}
      {filteredBookings.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-extrabold text-slate-900">No active bookings yet</h3>
            <p className="text-xs text-slate-500">
              When guests reserve your suites, tours or dining experiences, their reservation details will surface here.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Booking Ref</th>
                  <th className="py-4 px-6">Guest Name</th>
                  <th className="py-4 px-6">Listing Booked</th>
                  <th className="py-4 px-6">Check-in / Start</th>
                  <th className="py-4 px-6">Check-out / End</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Amount (RWF)</th>
                  <th className="py-4 px-6">Booking Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{b.bookingRef}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>{b.guestName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{b.guestPhone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900">{b.serviceOffering?.title || 'Luxury Package'}</span>
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {new Date(b.checkInDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {new Date(b.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="status" className="!rounded-full text-[10px] px-2.5 py-0.5">
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {formatRwf(b.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
