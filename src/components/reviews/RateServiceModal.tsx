'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { 
  Star, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Building2, 
  Compass,
  UtensilsCrossed,
  Tag,
  Search,
  AlertCircle,
  Instagram,
  X,
  Sparkles,
  Share2,
  Download,
  Loader2
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InstagramStoryCard } from './InstagramStoryCard';

export interface RateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
  serviceName?: string;
  onSuccess?: (newRating: any) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional',
};

export type ServiceTypeCategory = 'STAYS' | 'EXPERIENCES' | 'DINING' | 'OTHER';

const SERVICE_TYPES: { key: ServiceTypeCategory; label: string; icon: React.ElementType }[] = [
  { key: 'STAYS', label: 'Stays', icon: Building2 },
  { key: 'EXPERIENCES', label: 'Experiences', icon: Compass },
  { key: 'DINING', label: 'Dining', icon: UtensilsCrossed },
  { key: 'OTHER', label: 'Other', icon: Tag },
];

export function RateServiceModal({
  isOpen,
  onClose,
  serviceId: initialServiceId,
  serviceName: initialServiceName,
  onSuccess,
}: RateServiceModalProps) {
  const [step, setStep] = useState<'form' | 'instagram'>('form');
  
  // Search & Listing Selection State
  const [searchQuery, setSearchQuery] = useState<string>(initialServiceName || '');
  const [selectedListing, setSelectedListing] = useState<{
    id: string;
    name: string;
    type: string;
    location?: string;
    image?: string;
  } | null>(initialServiceId && initialServiceName ? { id: initialServiceId, name: initialServiceName, type: 'HOTEL' } : null);
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Service Type State
  const [serviceType, setServiceType] = useState<ServiceTypeCategory>('STAYS');

  // Form State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [hpField, setHpField] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedServiceName, setSubmittedServiceName] = useState<string>('');

  // Story Graphic Sharing State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [generatingImage, setGeneratingImage] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const storyCardRef = useRef<HTMLDivElement>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialServiceName) {
        setSearchQuery(initialServiceName);
        setSelectedListing({
          id: initialServiceId || '',
          name: initialServiceName,
          type: 'HOTEL',
        });
      } else {
        setSearchQuery('');
        setSelectedListing(null);
      }
    }
  }, [isOpen, initialServiceId, initialServiceName]);

  // Click outside listener for autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate QR code data URL when entering Step 2
  useEffect(() => {
    if (step === 'instagram') {
      const targetUrl = 'https://higalux.rw';
      QRCode.toDataURL(targetUrl, {
        width: 250,
        margin: 1,
        color: {
          dark: '#0A0D14',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate QR Code:', err));
    }
  }, [step]);

  // Live Autocomplete search against live listings table
  useEffect(() => {
    if (!isOpen || selectedListing) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/businesses?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.businesses) {
          setSearchResults(data.businesses);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Failed to search businesses:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedListing, isOpen]);

  const mapDbTypeToCategory = (type?: string): ServiceTypeCategory => {
    if (!type) return 'STAYS';
    const upper = type.toUpperCase();
    if (upper === 'HOTEL' || upper === 'STAYS') return 'STAYS';
    if (upper === 'RESTAURANT' || upper === 'DINING') return 'DINING';
    if (upper === 'TOUR' || upper === 'EXPERIENCES') return 'EXPERIENCES';
    return 'OTHER';
  };

  const handleSelectListing = (biz: any) => {
    setSelectedListing({
      id: biz.id,
      name: biz.name,
      type: biz.type,
      location: biz.location,
      image: biz.images?.[0],
    });
    setSearchQuery(biz.name);
    setServiceType(mapDbTypeToCategory(biz.type));
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedListing(null);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const resetModalState = () => {
    setStep('form');
    setSearchQuery(initialServiceName || '');
    setSelectedListing(initialServiceId && initialServiceName ? { id: initialServiceId, name: initialServiceName, type: 'HOTEL' } : null);
    setServiceType('STAYS');
    setRating(0);
    setHoverRating(0);
    setComment('');
    setReviewerName('');
    setHpField('');
    setLoading(false);
    setError(null);
    setCopied(false);
    setSubmittedServiceName('');
    setGeneratingImage(false);
    setShareSuccess(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalServiceName = searchQuery.trim();
    if (!finalServiceName) {
      setError('Please search or enter a Service / Property Name.');
      return;
    }

    if (rating < 1) {
      setError('Please select a star rating (1 to 5 stars).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        serviceId: selectedListing ? selectedListing.id : null,
        serviceName: finalServiceName,
        serviceType,
        isUnregistered: !selectedListing,
        rating,
        comment,
        reviewerName,
        hp_field: hpField,
      };

      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit rating.');
      }

      setSubmittedServiceName(finalServiceName);

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

  // Caption Generator for Instagram
  const displayServiceName = submittedServiceName || searchQuery || 'Service';
  const sanitizedServiceName = displayServiceName.replace(/[^a-zA-Z0-9]/g, '');
  const starsString = '⭐'.repeat(rating || 5);
  const suggestedCaption = `Loved my experience with ${displayServiceName}! ${starsString} Entered to win 50,000 RWF on @higa_luxuries #HigaLuxVIP #HigaLuxuries #${sanitizedServiceName} #RwandaLuxury`;

  // Capture & Share / Download Story Graphic
  const handleShareOrSaveGraphic = async () => {
    if (!storyCardRef.current) return;
    setGeneratingImage(true);
    try {
      // Generate 1080x1920 PNG using html-to-image
      const dataUrl = await toPng(storyCardRef.current, {
        width: 1080,
        height: 1920,
        quality: 0.95,
        cacheBust: true,
      });

      // Convert dataUrl to Blob / File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `higalux-vip-pass-${sanitizedServiceName || 'review'}.png`, { type: 'image/png' });

      // Native Web Share API if supported on mobile
      if (typeof navigator !== 'undefined' && (navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
        await (navigator as any).share({
          files: [file],
          title: 'Higa Lux VIP Gold Pass',
          text: `Entered to win 50,000 RWF! #HigaLuxVIP @higa_luxuries`,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        // Fallback to desktop direct file download
        const link = document.createElement('a');
        link.download = `higalux-vip-pass-${sanitizedServiceName || 'review'}.png`;
        link.href = dataUrl;
        link.click();
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to generate Story graphic:', err);
    } finally {
      setGeneratingImage(false);
    }
  };

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
      window.location.href = 'instagram://app';
      setTimeout(() => {
        window.open('https://www.instagram.com', '_blank');
      }, 1500);
    } else {
      window.open('https://www.instagram.com', '_blank');
    }
  };

  return (
    <>
      {/* Hidden Off-Screen 1080x1920 Render Target for html-to-image Capture */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-100 z-[-9999]">
        <InstagramStoryCard
          ref={storyCardRef}
          isOffscreen={true}
          serviceName={displayServiceName}
          serviceType={serviceType}
          location={selectedListing?.location}
          rating={rating}
          reviewerName={reviewerName}
          comment={comment}
          imageUrl={selectedListing?.image}
          qrCodeUrl={qrCodeUrl}
        />
      </div>

      <Modal
        open={isOpen}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-sky-600 fill-sky-600" />
            <span>{step === 'form' ? 'Rate a Service' : 'Share Your VIP Gold Pass'}</span>
          </div>
        }
        subtitle={
          step === 'form'
            ? 'Public Guest Review • Search property or submit new'
            : 'You are entered to win 50,000 RWF! Share your pass on Instagram'
        }
        size="md"
      >
        <div className="p-6 space-y-5">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* 1. Service / Property Name Field with Searchable Autocomplete */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Service / Property Name</span>
                    <span className="text-red-500">*</span>
                  </span>
                  {selectedListing ? (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Registered Listing
                    </span>
                  ) : searchQuery.trim().length > 0 ? (
                    <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Unregistered Service
                    </span>
                  ) : null}
                </label>

                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedListing) setSelectedListing(null);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0 && !selectedListing) setShowDropdown(true);
                    }}
                    placeholder="Type property name (e.g. Cleo Lake Kivu, Singita, or custom name)..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all placeholder:font-normal"
                  />
                  {(searchQuery || selectedListing) && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                      title="Clear property name"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown List */}
                {showDropdown && !selectedListing && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {searching ? (
                      <div className="p-4 text-center text-xs text-slate-500 font-medium">
                        Searching listings database...
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((biz) => (
                        <button
                          key={biz.id}
                          type="button"
                          onClick={() => handleSelectListing(biz)}
                          className="w-full p-3 text-left hover:bg-sky-50/70 flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                              {biz.images?.[0] ? (
                                <Image
                                  src={biz.images[0]}
                                  alt={biz.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <Building2 className="w-4 h-4 text-slate-400 m-auto" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                                {biz.name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                {biz.location} • {biz.type}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
                            Select
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800">No matching registered listing found</p>
                        <p className="text-[11px] text-slate-500">
                          You can continue submitting <strong>&quot;{searchQuery}&quot;</strong> as a new/unregistered service name.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Service Type Field (Required) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Service Type / Category <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Required</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SERVICE_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = serviceType === type.key;
                    return (
                      <button
                        key={type.key}
                        type="button"
                        onClick={() => setServiceType(type.key)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-600/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/40'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-sky-600'}`} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Star Rating Input (Required) */}
              <div className="space-y-2 text-center p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
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

              {/* 4. Reviewer Name (Optional with Anonymity Guidance) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Your Name</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional (Leave blank to submit anonymously)</span>
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Clarisse M. or leave blank for Anonymous"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                />
                <p className="text-[11px] text-slate-500 font-normal">
                  Your review will be publicly visible on the live leaderboard. If left blank, it will display as <strong>Anonymous</strong>.
                </p>
              </div>

              {/* 5. Review Comment (Optional) */}
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

              {/* Form Actions */}
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
            /* Step 2: Confirmation & High-Converting VIP Gold Pass Instagram Story Card */
            <div className="space-y-5 text-center py-1">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Rating Saved! You are entered to win 50,000 RWF</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  VIP Gold Pass
                </span>
              </div>

              {/* Interactive Live Responsive Preview of Instagram Story Card */}
              <div className="p-3 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800">
                <InstagramStoryCard
                  isOffscreen={false}
                  serviceName={displayServiceName}
                  serviceType={serviceType}
                  location={selectedListing?.location}
                  rating={rating}
                  reviewerName={reviewerName}
                  comment={comment}
                  imageUrl={selectedListing?.image}
                  qrCodeUrl={qrCodeUrl}
                />
              </div>

              {/* Action Buttons: 1. Share / Save Story Graphic  2. Copy Caption & Open Instagram */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Action Button 1: Share / Save Story Graphic */}
                  <button
                    type="button"
                    onClick={handleShareOrSaveGraphic}
                    disabled={generatingImage}
                    className={`py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                      shareSuccess
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:opacity-95 shadow-amber-500/25'
                    } disabled:opacity-50`}
                  >
                    {generatingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
                        <span>Generating High-Res PNG...</span>
                      </>
                    ) : shareSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white shrink-0" />
                        <span>VIP Pass Saved / Shared!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-slate-950 shrink-0" />
                        <span>1. Share / Save Story Graphic</span>
                      </>
                    )}
                  </button>

                  {/* Action Button 2: Copy Caption & Open Instagram */}
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyCaption();
                      handleOpenInstagram();
                    }}
                    className={`py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white hover:opacity-90 shadow-lg shadow-pink-500/25'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-100 shrink-0" />
                        <span>Caption Copied! Opening App...</span>
                      </>
                    ) : (
                      <>
                        <Instagram className="w-4 h-4 text-white shrink-0" />
                        <span>2. Copy Caption &amp; Open Instagram</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 text-white text-left space-y-1.5 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Suggested Instagram Caption:</span>
                    {copied && <span className="text-emerald-400 font-bold">✓ Copied</span>}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-[11px] text-slate-200 font-mono leading-relaxed select-all">
                    {suggestedCaption}
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center font-normal">
                  Pro-tip: Save or share the VIP Gold Pass image above to your Instagram Story, paste the copied caption, and tag <strong className="text-pink-600">@higa_luxuries</strong> to enter the 50,000 RWF draw!
                </p>
              </div>

              {/* Finish Action */}
              <div className="pt-1">
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
    </>
  );
}

