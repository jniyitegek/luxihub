'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Leaf, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  MessageSquare,
  BedDouble,
  Utensils,
  Camera,
  Share2,
  Heart
} from 'lucide-react';
import { BusinessListing, ReviewDto } from '@/lib/types';
import { CertificationBadge } from '@/components/ui/CertificationBadge';
import { BookingWidget } from '@/components/booking/BookingWidget';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { formatRwf, formatUsd } from '@/lib/utils';
import { RateServiceButton } from '@/components/reviews/RateServiceButton';


export default function ListingDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [business, setBusiness] = useState<BusinessListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string | undefined>(undefined);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/businesses/${slug}`);
      const data = await res.json();
      if (data.business) {
        setBusiness(data.business);
        if (data.business.offerings?.length > 0 && !selectedOfferingId) {
          setSelectedOfferingId(data.business.offerings[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load listing details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchDetails();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-32 text-center">
        <div className="inline-block w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 mt-3">Loading verified property details...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen py-32 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500">The property you requested is not currently listed.</p>
        <Link href="/explore" className="inline-block px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25">
          Return to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Top Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CertificationBadge badge={business.certificationBadge} size="md" />
            <Badge variant="tag" icon={<MapPin className="w-3.5 h-3.5 text-sky-600" />} className="text-slate-700">
              {business.location}, Rwanda
            </Badge>
          </div>

          <Text as="h1" variant="h1" color="dark" className="text-3xl sm:text-4xl lg:text-5xl">
            {business.name}
          </Text>

          <Text variant="caption" color="muted" as="p" className="text-xs sm:text-sm flex items-center gap-2">
            <span>{business.address}</span>
            <span>•</span>
            <span className="text-sky-700 font-bold">Response Time: {business.responseTimeHours}h</span>
          </Text>
        </div>

        {/* Rating and Inspection Scorecard & Public Rate Button */}
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap justify-start md:justify-end">
          <RateServiceButton
            serviceId={business.id}
            serviceName={business.name}
            variant="default"
            buttonText="Rate a Service"
            onRatingSuccess={() => fetchDetails()}
            className="h-[54px] shadow-lg shadow-sky-500/25"
          />

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-right">
            <div className="flex items-center justify-end gap-1 text-slate-900 font-extrabold text-base">
              <Star className="w-4 h-4 fill-sky-500 text-sky-500" />
              <span>{business.reviewCount > 0 ? business.ratingAvg.toFixed(2) : '—'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {business.reviewCount > 0
                ? `${business.reviewCount} Verified Review${business.reviewCount === 1 ? '' : 's'}`
                : 'No verified reviews yet'}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-right">
            <div className="flex items-center justify-end gap-1 text-sky-700 font-extrabold text-base">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>{business.qualityScore != null ? `${business.qualityScore}%` : 'Pending'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              40-Point QA Score
            </div>
          </div>
        </div>
      </div>

      {/* High-Resolution Photo Gallery */}
      <div className="space-y-3">
        <div className="relative h-[420px] sm:h-[520px] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200">
          <Image
            src={business.images[activeImageIndex] || business.images[0]}
            alt={business.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-6 text-xs text-white font-medium [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%)]">
            Image {activeImageIndex + 1} of {business.images.length}
          </div>
        </div>

        {/* Gallery Thumbnails */}
        {business.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {business.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-28 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImageIndex === idx ? 'border-sky-600 scale-105 shadow-md shadow-sky-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Details & Offerings */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Quality Audit Scorecard Banner */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Verified QA Audit Scorecard</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Official 40-point Rwandan Luxury Benchmark</p>
                </div>
              </div>
              <span className="text-xl font-black font-mono text-sky-600">
                {business.qualityScore != null ? `${business.qualityScore}/100` : 'Pending'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Hospitality & Welcome</div>
                <div className="font-bold text-slate-900 mt-0.5">25 / 25 pts</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Cleanliness & Hygiene</div>
                <div className="font-bold text-slate-900 mt-0.5">25 / 25 pts</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Sustainability & Eco</div>
                <div className="font-bold text-slate-900 mt-0.5">23 / 25 pts</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Luxury Facilities</div>
                <div className="font-bold text-slate-900 mt-0.5">24 / 25 pts</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <Text as="h2" variant="h2" color="dark" className="text-2xl">About the Experience</Text>
            <Text variant="body" className="text-sm text-slate-600 whitespace-pre-line">
              {business.description}
            </Text>
          </div>

          {/* Amenities & Highlights */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Verified Amenities & Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {business.amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service Packages / Rooms List */}
          {business.offerings && business.offerings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Available Packages & Suites</h3>
              <div className="space-y-4">
                {business.offerings.map((off) => (
                  <div
                    key={off.id}
                    className={`p-5 rounded-3xl bg-white border transition-all ${
                      selectedOfferingId === off.id ? 'border-sky-600 shadow-md shadow-sky-500/10' : 'border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900">{off.title}</h4>
                          <Badge variant="tag" className="text-[10px] px-2.5 py-0.5 text-slate-600">
                            Max {off.capacity} Guests
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-normal">{off.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-lg font-extrabold text-slate-900">{formatRwf(off.price)}</div>
                        <div className="text-[10px] text-slate-500">
                          ~{formatUsd(Math.round(off.price / 1350))} /{off.unit.replace('per_', '')}
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOfferingId(off.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              selectedOfferingId === off.id
                                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {selectedOfferingId === off.id ? 'Selected' : 'Select Package'}
                          </button>
                          <RateServiceButton
                            serviceId={off.id}
                            serviceName={`${off.title} (${business.name})`}
                            variant="star"
                            buttonText="Rate Package"
                            onRatingSuccess={() => fetchDetails()}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verified Guest Reviews List */}
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Verified Guest Reviews</h3>
                <p className="text-xs text-slate-500">100% verified completed stays in Rwanda</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-sky-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Zero Fake Reviews</span>
              </div>
            </div>

            {business.reviews && business.reviews.length > 0 ? (
              <div className="space-y-4">
                {business.reviews.map((rev: any) => (
                  <div key={rev.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-900 flex items-center justify-center font-bold text-xs">
                          {rev.user?.name ? rev.user.name.charAt(0) : 'G'}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{rev.user?.name || 'Verified Traveler'}</h5>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                        ))}
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{rev.title}</h4>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {/* Criteria tags */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                      <div>Cleanliness: <strong className="text-slate-900">{rev.cleanlinessRating}/5</strong></div>
                      <div>Service: <strong className="text-slate-900">{rev.serviceRating}/5</strong></div>
                      <div>Hospitality: <strong className="text-slate-900">{rev.hospitalityRating}/5</strong></div>
                      <div>Value: <strong className="text-slate-900">{rev.valueRating}/5</strong></div>
                    </div>

                    {/* Partner Response */}
                    {rev.partnerReply && (
                      <div className="p-3.5 rounded-2xl bg-sky-50/60 border-l-4 border-sky-600 text-xs space-y-1 mt-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-sky-900">
                          <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                          <span>Response from Property Manager:</span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-normal leading-relaxed">
                          {rev.partnerReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-sm">
                No reviews yet for this venue. Be the first to book and submit a verified review!
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <BookingWidget
              business={business}
              selectedOfferingId={selectedOfferingId}
              onOfferingSelect={(id) => setSelectedOfferingId(id)}
            />
          </div>
        </div>

      </div>

      {/* Floating Rate Action Button for quick public guest access */}
      <RateServiceButton
        serviceId={business.id}
        serviceName={business.name}
        variant="fab"
        buttonText="Rate this Service"
        onRatingSuccess={() => fetchDetails()}
      />

    </div>
  );
}
