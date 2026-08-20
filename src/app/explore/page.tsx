'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Star,
  Sparkles,
  Building2,
  UtensilsCrossed,
  Compass,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { BusinessListing } from '@/lib/types';
import { CertificationBadge } from '@/components/ui/CertificationBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { LiveLeaderboard } from '@/components/landing/LiveLeaderboard';
import { formatRwf, formatUsd } from '@/lib/utils';

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

  return (
    <div className="w-full space-y-10 pb-20">
      
      {/* Full-width Dark Header Canvas (Clean, no eyebrow pill) */}
      <div className="w-full bg-gradient-to-b from-[#0B1B36] via-[#0D2240] to-[#0B1B36] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Glowing Shapes */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-3 relative z-10">
          <Text as="h1" variant="h1" color="white" className="text-3xl sm:text-5xl">
            Explore Rwandan <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-white">Luxury Hospitality</span>
          </Text>
          <Text variant="body" className="text-sm sm:text-base text-sky-100/90 max-w-2xl">
            Browse 100% verified hotels, fine dining establishments, and guided safari expeditions. Every listing has passed our 40-point inspection protocol.
          </Text>
        </div>

      </div>

      {/* Live Leaderboard: who guests are highlighting right now, by category */}
      <LiveLeaderboard variant="section" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <div className="pt-2">
          <Text as="h2" variant="h2" color="dark" className="text-2xl sm:text-3xl">
            Browse All Verified Listings
          </Text>
          <Text variant="caption" color="muted" className="mt-1">
            Filter and compare every certified property, restaurant, and tour on the platform.
          </Text>
        </div>

        {/* Filter Control Bar */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-5">
          
          {/* Category Tabs */}
          <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <Button
                onClick={() => setType('ALL')}
                variant={type === 'ALL' ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                className={`!rounded-xl !text-xs ${type === 'ALL' ? '' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-none shadow-none'}`}
              >
                All Categories
              </Button>

              <Button
                onClick={() => setType('HOTEL')}
                variant={type === 'HOTEL' ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<Building2 className="w-3.5 h-3.5" />}
                className={`!rounded-xl !text-xs ${type === 'HOTEL' ? '' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-none shadow-none'}`}
              >
                Lodges & Hotels
              </Button>

              <Button
                onClick={() => setType('RESTAURANT')}
                variant={type === 'RESTAURANT' ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<UtensilsCrossed className="w-3.5 h-3.5" />}
                className={`!rounded-xl !text-xs ${type === 'RESTAURANT' ? '' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-none shadow-none'}`}
              >
                Fine Dining
              </Button>

              <Button
                onClick={() => setType('TOUR')}
                variant={type === 'TOUR' ? 'primary' : 'ghost'}
                size="sm"
                leftIcon={<Compass className="w-3.5 h-3.5" />}
                className={`!rounded-xl !text-xs ${type === 'TOUR' ? '' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-none shadow-none'}`}
              >
                Gorilla & Safari Tours
              </Button>
            </div>

            <Button
              onClick={resetFilters}
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="bg-transparent border-none shadow-none text-slate-500 hover:text-slate-900 !px-0 !py-0"
            >
              Reset Filters
            </Button>
          </div>

          {/* Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Keyword Search */}
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keyword..."
              leftIcon={<Search className="w-4 h-4" />}
            />

            {/* Region */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-semibold focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL" className="bg-white text-slate-900">All Rwandan Regions</option>
                <option value="Kigali" className="bg-white text-slate-900">Kigali City (Urban Luxury)</option>
                <option value="Musanze" className="bg-white text-slate-900">Musanze (Volcanoes NP)</option>
                <option value="Rubavu" className="bg-white text-slate-900">Rubavu / Lake Kivu</option>
                <option value="Nyungwe" className="bg-white text-slate-900">Nyungwe Rainforest</option>
                <option value="Akagera" className="bg-white text-slate-900">Akagera National Park</option>
              </select>
            </div>

            {/* QA Badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-semibold focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL" className="bg-white text-slate-900">All QA Badges</option>
                <option value="GOLD_STANDARD" className="bg-white text-sky-700 font-bold">Gold Standard Only (95%+)</option>
                <option value="LUXE_VERIFIED" className="bg-white text-sky-700 font-bold">Luxe Verified Only</option>
                <option value="ECO_SUSTAINABLE" className="bg-white text-sky-700 font-bold">Eco-Sustainable Heritage</option>
              </select>
            </div>

            {/* Price Tier */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-semibold focus:outline-none w-full cursor-pointer"
              >
                <option value="ALL" className="bg-white text-slate-900">Any Price Range</option>
                <option value="BUDGET" className="bg-white text-slate-900">Under 500,000 RWF</option>
                <option value="MID" className="bg-white text-slate-900">500,000 - 1,200,000 RWF</option>
                <option value="LUXURY" className="bg-white text-slate-900">Ultra-Luxury (&gt; 1.2M RWF)</option>
              </select>
            </div>

          </div>

        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-900">{filteredBusinesses.length}</strong> verified luxury experience(s)
          </span>
          <div className="flex items-center gap-1.5 text-sky-700 font-extrabold">
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
                badgeTag={<CertificationBadge badge={item.certificationBadge} size="sm" />}
                actionText="Reserve"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-slate-900 text-xs font-bold w-fit">
                    <Star className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                    <span>{item.ratingAvg.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({item.reviewCount})</span>
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
