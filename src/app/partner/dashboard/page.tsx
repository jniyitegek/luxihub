'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TrendingUp, 
  CalendarCheck, 
  Award, 
  Star, 
  ShieldCheck, 
  PlusCircle, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Building2,
  Camera,
  X,
  Compass,
  UtensilsCrossed,
  Check,
  Info
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BusinessListing, BookingDto, ServiceOfferingDto } from '@/lib/types';
import { formatRwf } from '@/lib/utils';
import { CertificationBadge } from '@/components/ui/CertificationBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { Modal } from '@/components/ui/Modal';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

type ListingCategory = 'STAYS' | 'EXPERIENCES' | 'DINING' | 'CUSTOM';

const AMENITY_OPTIONS = [
  'Free High-Speed Wi-Fi',
  'Private Heated Plunge Pool',
  'Dedicated Butler Service',
  'Panoramic Mountain View',
  'Volcano View Terrace',
  'Air Conditioning',
  'Spa & Massage Center',
  'Airport Shuttle Service',
  'Complimentary Breakfast',
];

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Business logo update modal state
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [uploadedLogoPath, setUploadedLogoPath] = useState<string | null>(null);
  const [pastedLogoUrl, setPastedLogoUrl] = useState('');
  const [savingLogo, setSavingLogo] = useState(false);

  // Add Listing Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingOffering, setAddingOffering] = useState(false);

  // Form Fields
  const [category, setCategory] = useState<ListingCategory>('STAYS');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [title, setTitle] = useState('');
  const [subType, setSubType] = useState('Suite');
  const [price, setPrice] = useState('250000');
  const [unit, setUnit] = useState('per_night');
  const [capacity, setCapacity] = useState('2');
  const [minCapacity, setMinCapacity] = useState('1');
  const [duration, setDuration] = useState('Full Day (6 Hours)');
  const [cuisineType, setCuisineType] = useState('Rwandan & International Fusion');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Free High-Speed Wi-Fi', 'Panoramic Mountain View']);
  const [inclusions, setInclusions] = useState('Private butler service, gourmet breakfast, airport transfer');
  const [description, setDescription] = useState('');
  
  // Gallery & Cover Image state
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [coverImage, setCoverImage] = useState<string>(galleryImages[0]);

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Upload failed');
        return null;
      }
      return data.url;
    } catch (e) {
      console.error('File upload error:', e);
      alert('Failed to upload image file.');
      return null;
    }
  };

  // Custom Category Key/Value Attributes (up to 3)
  const [customAttributes, setCustomAttributes] = useState<{ label: string; value: string }[]>([
    { label: '', value: '' },
  ]);

  const fetchPartnerData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/businesses', { cache: 'no-store' });
      const data = await res.json();

      const owned: BusinessListing[] = (data.businesses ?? []).filter(
        (b: BusinessListing) => b.ownerId === user.id
      );

      setBusinesses(owned);
      const active = owned.find((b) => b.id === business?.id) ?? owned[0] ?? null;
      setBusiness(active);
      if (active) {
        if (active.logoUrl?.startsWith('/uploads/')) {
          setUploadedLogoPath(active.logoUrl);
          setPastedLogoUrl('');
        } else {
          setUploadedLogoPath(null);
          setPastedLogoUrl(active.logoUrl || '');
        }
      }

      if (owned.length > 0) {
        const bRes = await fetch('/api/bookings', { cache: 'no-store' });
        const bData = await bRes.json();
        setBookings(bData.bookings ?? []);
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error('Failed to load partner data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCategoryChange = (next: ListingCategory) => {
    setCategory(next);
    if (next === 'STAYS') {
      setSubType('Suite');
      setUnit('per_night');
    } else if (next === 'EXPERIENCES') {
      setSubType('Tour');
      setUnit('per_person');
    } else if (next === 'DINING') {
      setSubType('À la carte');
      setUnit('per_person');
    } else {
      setSubType('Custom');
      setUnit('per_package');
    }
  };

  const handleAddGalleryImage = () => {
    if (!imageUrlInput.trim()) return;
    if (galleryImages.length >= 10) return;
    const url = imageUrlInput.trim();
    setGalleryImages((prev) => {
      const updated = [...prev, url];
      if (!coverImage) setCoverImage(url);
      return updated;
    });
    setImageUrlInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    const removed = galleryImages[index];
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (coverImage === removed) {
      setCoverImage(updated[0] || '');
    }
  };

  const handleToggleAmenity = (item: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleUpdateLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    const finalLogoUrl = uploadedLogoPath || pastedLogoUrl.trim();
    if (!finalLogoUrl) {
      alert('Please upload an image file or enter an image URL.');
      return;
    }

    setSavingLogo(true);
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: finalLogoUrl }),
      });
      if (res.ok) {
        setShowLogoModal(false);
        fetchPartnerData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update logo');
      }
    } catch (e) {
      console.error('Failed to update logo:', e);
    } finally {
      setSavingLogo(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !title) return;
    if (galleryImages.length === 0) {
      alert('Please add at least one gallery image for your listing.');
      return;
    }
    setAddingOffering(true);

    try {
      const parsedInclusions = inclusions
        ? inclusions.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      // Build structured attributes
      const attributesPayload: Record<string, any> = {};
      if (category === 'STAYS') {
        attributesPayload.amenities = selectedAmenities;
        attributesPayload.roomType = subType;
        attributesPayload.maxOccupancy = parseInt(capacity, 10);
      } else if (category === 'EXPERIENCES') {
        attributesPayload.experienceType = subType;
        attributesPayload.duration = duration;
        attributesPayload.minGroupSize = parseInt(minCapacity, 10);
        attributesPayload.maxGroupSize = parseInt(capacity, 10);
      } else if (category === 'DINING') {
        attributesPayload.serviceType = subType;
        attributesPayload.cuisineType = cuisineType;
      } else if (category === 'CUSTOM') {
        attributesPayload.customCategoryName = customCategoryName || 'Custom Experience';
        customAttributes.forEach((attr) => {
          if (attr.label.trim() && attr.value.trim()) {
            attributesPayload[attr.label.trim()] = attr.value.trim();
          }
        });
      }

      const res = await fetch(`/api/businesses/${business.id}/offerings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category === 'CUSTOM' ? (customCategoryName || 'Custom') : category,
          subType,
          title,
          description: description || 'Verified luxury establishment offering.',
          price: parseInt(price, 10) || 150000,
          capacity: parseInt(capacity, 10) || 2,
          unit,
          duration: category === 'EXPERIENCES' ? duration : undefined,
          coverImage: coverImage || galleryImages[0],
          images: galleryImages,
          inclusions: parsedInclusions,
          attributes: attributesPayload,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        fetchPartnerData();
      }
    } catch (e) {
      console.error('Create listing failed:', e);
    } finally {
      setAddingOffering(false);
    }
  };

  const listingBookings = business ? bookings.filter((b) => b.businessId === business.id) : [];

  const totalPayout = listingBookings.reduce((sum, b) => (b.paymentStatus === 'FULLY_PAID' ? sum + b.payoutAmount : sum), 0);

  const now = new Date();
  const thisMonthRevenue = listingBookings
    .filter((b) => b.paymentStatus === 'FULLY_PAID' && new Date(b.createdAt).getMonth() === now.getMonth() && new Date(b.createdAt).getFullYear() === now.getFullYear())
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthRevenue = listingBookings
    .filter((b) => b.paymentStatus === 'FULLY_PAID' && new Date(b.createdAt).getMonth() === lastMonthDate.getMonth() && new Date(b.createdAt).getFullYear() === lastMonthDate.getFullYear())
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const revenueTrendPct = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : null;

  const isZeroState = totalPayout === 0 && business?.qualityScore == null && business?.reviewCount === 0 && (business?.responseRate ?? 0) === 0;

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-24 rounded-3xl bg-slate-200/70 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-3xl bg-slate-200/70 animate-pulse" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-sky-600" />
        </div>
        <div className="space-y-2">
          <Text as="h1" variant="h2" color="dark" className="text-2xl">
            No listing linked to your account yet
          </Text>
          <p className="text-sm text-slate-600 leading-relaxed">
            Once your property is registered and linked to {user?.email ?? 'your account'}, your reservations, payouts
            and quality assurance scores appear here. Our partnerships team completes the onboarding with you.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:partners@higalux.rw?subject=Higa%20Lux%20partner%20onboarding"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-md"
          >
            Contact the partnerships team
          </a>
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold border border-slate-200 transition-colors"
          >
            Browse the directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {businesses.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Your listings:</span>
          {businesses.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBusiness(b);
                if (b.logoUrl?.startsWith('/uploads/')) {
                  setUploadedLogoPath(b.logoUrl);
                  setPastedLogoUrl('');
                } else {
                  setUploadedLogoPath(null);
                  setPastedLogoUrl(b.logoUrl || '');
                }
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                b.id === business.id
                  ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {/* Dashboard Header with Profile Logo Upload & Clear CTA Hierarchy */}
      <DashboardHeader
        title={business.name}
        subtitle={`Managed by ${user?.name ?? 'your team'}`}
        logoUrl={business.logoUrl}
        onLogoUpload={() => {
          if (business.logoUrl?.startsWith('/uploads/')) {
            setUploadedLogoPath(business.logoUrl);
            setPastedLogoUrl('');
          } else {
            setUploadedLogoPath(null);
            setPastedLogoUrl(business.logoUrl || '');
          }
          setShowLogoModal(true);
        }}
        badges={<CertificationBadge badge={business.certificationBadge} size="sm" />}
        actions={
          <>
            {/* Primary CTA: Add New Listing */}
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="!rounded-xl !px-5 !py-2.5 font-extrabold shadow-lg shadow-sky-600/25 bg-sky-600 hover:bg-sky-500 text-white"
            >
              Add New Listing
            </Button>

            {/* Secondary CTA: Staff Academy */}
            <Link
              href="/partner/academy"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all shadow-sm"
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span>Staff Academy</span>
            </Link>

            {/* Tertiary CTA: Membership Tier */}
            <Link
              href="/partner/subscriptions"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <Award className="w-4 h-4 text-slate-500" />
              <span>Membership Tier</span>
            </Link>
          </>
        }
      />

      {/* KPI Stats Cards OR Consolidated Zero-State Onboarding Setup Card */}
      {isZeroState ? (
        <Card variant="compact" title="" className="!rounded-3xl border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/40 p-8 shadow-lg border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
                
                <span>Service Owner Onboarding</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Welcome to Higa Lux! Let&apos;s set up {business.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Complete your establishment onboarding to surface on the verified luxury directory, receive direct guest bookings, and unlock quality certification.
              </p>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Setup Progress</span>
                  <span className="text-sky-700">50% Completed</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full w-1/2 transition-all duration-500" />
                </div>
              </div>
            </div>

            {/* Setup Checklist */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm shrink-0 min-w-[280px]">
              <div className="text-xs font-extrabold text-slate-900 pb-2 border-b border-slate-100">
                Onboarding Checklist
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Business Account Verified</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full border-2 border-sky-600 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                  </div>
                  <span>Add Your First Listing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-medium">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                  <span>Enroll Staff in Sommelier Masterclass</span>
                </div>
              </div>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="primary"
                size="sm"
                className="w-full mt-3 !rounded-xl text-xs font-extrabold"
              >
                + Add First Listing Now
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl transition-all">
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

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>QA Audit Score</span>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {business.qualityScore != null ? `${business.qualityScore}%` : 'Pending'}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {business.qualityScore != null ? 'Gold Standard Benchmark' : 'Awaiting first 40-point audit'}
            </div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Verified Guest Rating</span>
              <Star className="w-4 h-4 text-sky-600 fill-sky-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {business.reviewCount > 0 ? business.ratingAvg.toFixed(2) : '—'}{' '}
              <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {business.reviewCount ? `${business.reviewCount} verified traveler reviews` : 'No verified reviews yet'}
            </div>
          </Card>

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-7 space-y-2 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between text-slate-500 text-xs font-extrabold">
              <span>Guest Response Rate</span>
              <Clock className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {business.responseRate ? `${business.responseRate}%` : '—'}
            </div>
            <div className="text-[11px] text-sky-700 font-extrabold">
              Based on verified guest inquiries
            </div>
          </Card>
        </div>
      )}

      {/* Main Grid: Active Guest Reservations & Managed Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Reservations */}
        <div id="bookings" className="lg:col-span-2 space-y-6 scroll-mt-20">
          <div className="flex items-center justify-between">
            <Text as="h2" variant="h2" color="dark" className="text-2xl flex items-center gap-2 font-extrabold">
              <CalendarCheck className="w-6 h-6 text-sky-600" />
              <span>Active Guest Reservations</span>
            </Text>
            <span className="text-xs text-slate-500 font-extrabold">{listingBookings.length} Total Bookings</span>
          </div>

          <div className="space-y-4">
            {listingBookings.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center text-xs text-slate-500 font-medium">
                No active bookings yet. Guest reservations will surface here automatically.
              </div>
            ) : (
              listingBookings.map((b) => (
                <Card key={b.id} variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-6 space-y-3 hover:shadow-xl transition-all">
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
                      <span className="text-[10px] text-slate-400 block font-bold">Listing</span>
                      <strong className="text-slate-900">{b.serviceOffering?.title || 'Luxury Listing'}</strong>
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

        {/* Right 1 Col: Managed Listings & QA */}
        <div id="listings" className="space-y-6 scroll-mt-20">

          <Card variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Text as="h3" variant="h4" color="dark" className="font-extrabold text-base">Active Listings</Text>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="ghost"
                size="sm"
                className="!px-0 !py-0 bg-transparent border-none shadow-none text-sky-700 hover:underline !text-xs font-extrabold"
              >
                + Add Listing
              </Button>
            </div>

            <div className="space-y-3">
              {business.offerings?.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-medium bg-slate-50 rounded-2xl">
                  No active listings created yet.
                </div>
              ) : (
                business.offerings?.map((off: ServiceOfferingDto) => (
                  <div key={off.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    {off.coverImage && (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2">
                        <Image src={off.coverImage} alt={off.title} fill className="object-cover" />
                        {off.category && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
                            {off.category}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-start text-xs font-bold text-slate-900">
                      <span>{off.title}</span>
                      <span className="text-sky-700 font-mono font-bold shrink-0">{formatRwf(off.price)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal line-clamp-2">{off.description}</p>
                  </div>
                ))
              )}
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

      {/* Business Logo Upload Modal */}
      <Modal
        open={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        title="Update Business Profile Photo / Logo"
        size="sm"
      >
        <form onSubmit={handleUpdateLogo} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Upload Image File</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingLogo(true);
                const url = await handleFileUpload(file);
                if (url) {
                  setUploadedLogoPath(url);
                }
                setUploadingLogo(false);
                e.target.value = '';
              }}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
            />
            {uploadingLogo && <p className="text-[10px] text-sky-600 font-bold">Uploading file...</p>}
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase">Or Image URL</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <Input
            label="Logo / Profile Photo Image URL"
            type="text"
            value={pastedLogoUrl}
            onChange={(e) => {
              setPastedLogoUrl(e.target.value);
              if (e.target.value.trim()) {
                setUploadedLogoPath(null);
              }
            }}
            placeholder="https://images.unsplash.com/photo-..."
          />

          {(uploadedLogoPath || pastedLogoUrl.trim() || business.logoUrl) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Preview:</span>
                {uploadedLogoPath && (
                  <span className="text-emerald-600 flex items-center gap-1 font-extrabold">
                    <Check className="w-3 h-3" /> Uploaded File Selected
                  </span>
                )}
              </div>
              <div className="w-20 h-20 rounded-2xl overflow-hidden border relative mx-auto bg-slate-900 shadow-inner">
                <Image
                  src={uploadedLogoPath || pastedLogoUrl.trim() || business.logoUrl || ''}
                  alt="Logo preview"
                  fill
                  className="object-cover"
                />
              </div>
              {uploadedLogoPath && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setUploadedLogoPath(null)}
                    className="text-[10px] text-rose-600 hover:underline font-bold"
                  >
                    Remove uploaded file
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              onClick={() => setShowLogoModal(false)}
              variant="ghost"
              size="sm"
              className="bg-transparent border-none shadow-none text-slate-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={savingLogo}
              variant="primary"
              size="sm"
              className="!rounded-xl font-extrabold"
            >
              Save Logo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Category-Aware Add Listing Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Listing"
        size="lg"
      >
        <form onSubmit={handleCreateListing} className="p-6 space-y-5">
          
          {/* Category Selector Tabs */}
          <div>
            <label className="block text-[11px] uppercase font-extrabold tracking-wider text-slate-500 mb-2">
              Select Listing Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('STAYS')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'STAYS'
                    ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Stays</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('EXPERIENCES')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'EXPERIENCES'
                    ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Experiences</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('DINING')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'DINING'
                    ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Dining</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('CUSTOM')}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                  category === 'CUSTOM'
                    ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                
                <span>+ Custom Category</span>
              </button>
            </div>
          </div>

          {/* Custom Category Name Input */}
          {category === 'CUSTOM' && (
            <Input
              label="Custom Category Name"
              type="text"
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
              placeholder="e.g. Spa Package, Car Rental, Helicopter Charter"
              required
            />
          )}

          {/* Core Listing Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Listing Name"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'STAYS'
                  ? 'e.g. Forest Villa with Heated Plunge Pool'
                  : category === 'EXPERIENCES'
                  ? 'e.g. Volcano Gorilla Trekking Expedition'
                  : category === 'DINING'
                  ? 'e.g. Chef’s 7-Course Gourmet Tasting Menu'
                  : 'e.g. Luxury VIP Spa Day Pass'
              }
              required
            />

            {/* Sub-type dropdown */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                {category === 'STAYS' ? 'Room / Suite Type' : category === 'EXPERIENCES' ? 'Experience Type' : category === 'DINING' ? 'Service Type' : 'Listing Sub-type'}
              </label>
              {category === 'STAYS' && (
                <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="Single">Single Room</option>
                  <option value="Double">Double Room</option>
                  <option value="Suite">Suite</option>
                  <option value="Villa">Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Custom">Custom</option>
                </select>
              )}
              {category === 'EXPERIENCES' && (
                <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="Tour">Guided Tour</option>
                  <option value="Adventure">Outdoor Adventure</option>
                  <option value="Class">Masterclass / Workshop</option>
                  <option value="Cultural">Cultural Expedition</option>
                  <option value="Custom">Custom</option>
                </select>
              )}
              {category === 'DINING' && (
                <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                >
                  <option value="À la carte">À la carte Menu</option>
                  <option value="Set menu">Set Tasting Menu</option>
                  <option value="Buffet">Luxury Buffet</option>
                  <option value="Private Dining">Private Dining Experience</option>
                  <option value="Custom">Custom</option>
                </select>
              )}
              {category === 'CUSTOM' && (
                <Input
                  type="text"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  placeholder="e.g. Day Pass, Hourly Rental"
                />
              )}
            </div>
          </div>

          {/* Pricing & Billing Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (RWF)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150000"
              required
            />

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Billing Unit</label>
              {category === 'CUSTOM' ? (
                <Input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. Per Package, Per Hour, Per Day"
                  required
                />
              ) : (
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-sky-500"
                >
                  {category === 'STAYS' && (
                    <>
                      <option value="per_night">Per Night</option>
                      <option value="per_week">Per Week</option>
                    </>
                  )}
                  {category === 'EXPERIENCES' && (
                    <>
                      <option value="per_person">Per Person</option>
                      <option value="per_group">Per Group</option>
                      <option value="flat">Flat Rate</option>
                    </>
                  )}
                  {category === 'DINING' && (
                    <>
                      <option value="per_person">Per Person</option>
                      <option value="per_item">Per Item</option>
                      <option value="flat">Flat Table Rate</option>
                    </>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Category Specific Fields */}
          {category === 'STAYS' && (
            <div className="space-y-3">
              <Input
                label="Max Occupancy (Guests)"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Amenities (Select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITY_OPTIONS.map((item) => {
                    const active = selectedAmenities.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleAmenity(item)}
                        className={`p-2 rounded-xl text-[11px] font-semibold text-left transition-all border ${
                          active
                            ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        {active ? '✓ ' : '+ '} {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {category === 'EXPERIENCES' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Duration"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 4 Hours, Full Day"
              />
              <Input
                label="Min Group Size"
                type="number"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
              />
              <Input
                label="Max Group Size"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          )}

          {category === 'DINING' && (
            <Input
              label="Cuisine Type"
              type="text"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              placeholder="e.g. French Fine Dining, Rwandan Fusion, Seafood"
            />
          )}

          {category === 'CUSTOM' && (
            <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-extrabold text-slate-700">Optional Custom Attributes (Up to 3):</div>
              {customAttributes.map((attr, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder={`Attribute Name ${idx + 1} (e.g. Treatment Time)`}
                    value={attr.label}
                    onChange={(e) => {
                      const updated = [...customAttributes];
                      updated[idx].label = e.target.value;
                      setCustomAttributes(updated);
                    }}
                  />
                  <Input
                    placeholder="Value (e.g. 90 Minutes)"
                    value={attr.value}
                    onChange={(e) => {
                      const updated = [...customAttributes];
                      updated[idx].value = e.target.value;
                      setCustomAttributes(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description & What's Included */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Listing Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the suite, experience or menu offering..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <Input
              label="What's Included (Comma-separated)"
              type="text"
              value={inclusions}
              onChange={(e) => setInclusions(e.target.value)}
              placeholder="Private butler, Breakfast, Volcano transfer..."
            />
          </div>

          {/* Gallery Uploader & Primary Cover Photo Selector */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Listing Image Gallery & Cover Photo</span>
              <span className="text-[10px] font-bold text-slate-500">{galleryImages.length} / 10 images</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (galleryImages.length >= 10) return;
                    setUploadingGallery(true);
                    const url = await handleFileUpload(file);
                    if (url) {
                      setGalleryImages((prev) => {
                        const updated = [...prev, url];
                        if (!coverImage) setCoverImage(url);
                        return updated;
                      });
                    }
                    setUploadingGallery(false);
                    e.target.value = '';
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
                {uploadingGallery && <span className="text-xs text-sky-600 font-bold shrink-0">Uploading...</span>}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-sky-500"
                />
                <Button
                  type="button"
                  onClick={handleAddGalleryImage}
                  variant="ghost"
                  size="sm"
                  className="!rounded-xl bg-white border border-slate-200 text-sky-700 font-bold"
                >
                  + Add URL
                </Button>
              </div>
            </div>

            {/* Gallery Thumbnail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {galleryImages.map((imgUrl, idx) => {
                const isCover = coverImage === imgUrl;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 h-24 group transition-all ${
                      isCover ? 'border-sky-600 ring-2 ring-sky-600/30' : 'border-slate-200'
                    }`}
                  >
                    <Image src={imgUrl} alt={`Gallery ${idx}`} fill className="object-cover" />
                    
                    {/* Cover badge */}
                    <button
                      type="button"
                      onClick={() => setCoverImage(imgUrl)}
                      className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        isCover ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-900/70 text-white hover:bg-slate-900'
                      }`}
                    >
                      {isCover ? 'Primary Cover' : 'Make Cover'}
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Click &quot;Make Cover&quot; on any thumbnail to select the primary cover photo displayed on the Explore directory.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              onClick={() => setShowAddModal(false)}
              variant="ghost"
              size="sm"
              className="bg-transparent border-none text-slate-500 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={addingOffering}
              variant="primary"
              size="sm"
              className="!rounded-xl hover:opacity-95 font-extrabold !px-6"
            >
              {addingOffering ? 'Creating...' : 'Save Listing'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
