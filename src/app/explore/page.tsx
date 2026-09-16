'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  Star,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { BusinessListing } from '@/lib/types';
import { CertificationBadge } from '@/components/ui/CertificationBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { formatRwf, formatUsd } from '@/lib/utils';
import { RateServiceButton } from '@/components/reviews/RateServiceButton';


function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'ALL';
  const initialLocation = searchParams.get('location') || 'ALL';
  const initialBadge = searchParams.get('badge') || 'ALL';
  const initialQuery = searchParams.get('q') || '';

  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState(initialType);
  const [location, setLocation] = useState(initialLocation);
  const [badge, setBadge] = useState(initialBadge);
  const [query, setQuery] = useState(initialQuery);
  const [priceTier, setPriceTier] = useState('ALL');

  useEffect(() => {
    fetchListings();
  }, [type, location, badge, query]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'ALL') params.set('type', type);
      if (location !== 'ALL') params.set('location', location);
      if (badge !== 'ALL') params.set('badge', badge);
      if (query) params.set('q', query);

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await res.json();
      if (data.businesses) {
        setBusinesses(data.businesses);
      }
    } catch (e) {
      console.error('Failed to fetch explore listings:', e);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setType('ALL');
    setLocation('ALL');
    setBadge('ALL');
    setQuery('');
    setPriceTier('ALL');
  };

  const filteredBusinesses = businesses.filter((b) => {
    if (priceTier === 'BUDGET') return b.basePrice < 500000;
    if (priceTier === 'MID') return b.basePrice >= 500000 && b.basePrice <= 1200000;
    if (priceTier === 'LUXURY') return b.basePrice > 1200000;
    return true;
  });

  const categoryLabel = type !== 'ALL' ? (type === 'HOTEL' ? 'Stays' : type === 'RESTAURANT' ? 'Dining' : 'Experiences') : null;
  const locationLabel = location !== 'ALL' ? location : null;
  const queryLabel = query ? `"${query}"` : null;

  const activeFilters = [categoryLabel, locationLabel, queryLabel].filter(Boolean);
  const activeFiltersText = activeFilters.join(' • ');

  const titleHeading = activeFiltersText
    ? `Search found (${activeFiltersText})`
    : 'All Verified Services';

  return (
    <div className="w-full pb-20 bg-[#FAF9F6] text-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* Dynamic Search Title & Filter Status */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <Text variant="h1" color="dark" className="text-2xl sm:text-3xl font-medium">
              {titleHeading}
            </Text>
            <Text variant="caption" color="muted" className="text-xs sm:text-sm block">
              Showing <strong className="text-slate-900 font-semibold">{filteredBusinesses.length}</strong> verified {filteredBusinesses.length === 1 ? 'service' : 'services'}
              {activeFiltersText ? ' matching your active filters' : ' across Rwanda'}
            </Text>
          </div>

          {activeFilters.length > 0 && (
            <Button
              onClick={resetFilters}
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full px-4 py-1.5 self-start sm:self-auto text-xs font-medium shrink-0 shadow-sm"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Single Search Bar Input for Property/Service Name */}
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by specific service or property name..."
            className="w-full h-11 pl-11 pr-10 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-sm transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium px-1.5 py-0.5 rounded-md hover:bg-slate-100"
            >
              Clear
            </button>
          )}
        </div>

        {/* Trust Indicator Row */}
        <div className="flex items-center justify-end text-xs text-slate-500 font-medium pt-1">
          <div className="flex items-center gap-1.5 text-sky-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Direct Reservation Escrow Guaranteed</span>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <Text variant="caption" color="muted" className="mt-3">Filtering certified Rwandan venues...</Text>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-20 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <Text variant="body" weight="bold" className="text-base">No verified venues match your active filters.</Text>
            <Text variant="caption" color="muted">Try broadening your destination or price criteria.</Text>
            <Button
              onClick={resetFilters}
              variant="primary"
              size="sm"
              className="!rounded-xl"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBusinesses.map((item) => (
              <Card
                key={item.id}
                variant="vertical"
                href={`/listings/${item.slug}`}
                image={item.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                title={item.name}
                subtitle={item.description}
                price={`${formatRwf(item.basePrice)} (~${formatUsd(Math.round(item.basePrice / 1350))})`}
                location={item.location}
                badgeTag={
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.logoUrl && (
                      <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white shadow-md bg-slate-900 shrink-0">
                        <Image src={item.logoUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <CertificationBadge badge={item.certificationBadge} size="sm" />
                    {(!item.isVerified || item.verificationSource === 'PUBLIC_REVIEW') && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                        Unverified
                      </span>
                    )}
                  </div>
                }
                actionText="Reserve"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {item.reviewCount > 0 ? (
                      <div className="flex items-center gap-1 text-slate-900 text-xs font-bold w-fit">
                        <Star className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                        <span>{item.ratingAvg.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500 font-normal">({item.reviewCount})</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 w-fit">Newly listed</span>
                    )}

                    <RateServiceButton
                      serviceId={item.id}
                      serviceName={item.name}
                      variant="star"
                      buttonText="Rate"
                      onRatingSuccess={() => fetchListings()}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.amenities.slice(0, 3).map((amenity, idx) => (
                      <Badge
                        key={idx}
                        variant="tag"
                        className="text-[10px] px-2.5 py-0.5 text-slate-600 border-none"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading catalog...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
