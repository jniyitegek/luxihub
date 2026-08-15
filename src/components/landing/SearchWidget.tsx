'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Sparkles, Building2, UtensilsCrossed, Compass } from 'lucide-react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function SearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'HOTEL' | 'RESTAURANT' | 'TOUR'>('ALL');
  const [location, setLocation] = useState('ALL');
  const [query, setQuery] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('ALL');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeTab !== 'ALL') params.set('type', activeTab);
    if (location !== 'ALL') params.set('location', location);
    if (query) params.set('q', query);
    if (badgeFilter !== 'ALL') params.set('badge', badgeFilter);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[32px] bg-white p-4 md:p-6 shadow-2xl shadow-slate-900/10 border border-slate-200/90 space-y-4">
      
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Button
          type="button"
          variant={activeTab === 'ALL' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={() => setActiveTab('ALL')}
        >
          All Experiences
        </Button>

        <Button
          type="button"
          variant={activeTab === 'HOTEL' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={<Building2 className="w-3.5 h-3.5" />}
          onClick={() => setActiveTab('HOTEL')}
        >
          Lodges & Hotels
        </Button>

        <Button
          type="button"
          variant={activeTab === 'RESTAURANT' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={<UtensilsCrossed className="w-3.5 h-3.5" />}
          onClick={() => setActiveTab('RESTAURANT')}
        >
          Fine Dining
        </Button>

        <Button
          type="button"
          variant={activeTab === 'TOUR' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={<Compass className="w-3.5 h-3.5" />}
          onClick={() => setActiveTab('TOUR')}
        >
          Gorilla & Safari Tours
        </Button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        
        {/* Search Query */}
        <Input
          label="Search Experience"
          placeholder="e.g. Bisate, Heated pool..."
          leftIcon={<Search className="w-4 h-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Rwandan Destination */}
        <div className="w-full space-y-1">
          <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-sky-600" />
            Destination
          </label>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-sm">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Rwanda Regions</option>
              <option value="Kigali">Kigali City (Urban Luxury)</option>
              <option value="Musanze">Musanze (Volcanoes / Gorillas)</option>
              <option value="Rubavu">Rubavu / Lake Kivu</option>
              <option value="Nyungwe">Nyungwe Rainforest</option>
              <option value="Akagera">Akagera National Park</option>
            </select>
          </div>
        </div>

        {/* Quality Certification Badge */}
        <div className="w-full space-y-1">
          <label className="block text-[10px] uppercase font-extrabold tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-600" />
            QA Certification
          </label>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-500/20 transition-all shadow-sm">
            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Certified Partners</option>
              <option value="GOLD_STANDARD">Gold Standard (95%+)</option>
              <option value="LUXE_VERIFIED">Luxe Verified (40-Pt)</option>
              <option value="ECO_SUSTAINABLE">Eco-Sustainable</option>
            </select>
          </div>
        </div>

        {/* Submit Action */}
        <div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<Search className="w-4 h-4" />}
          >
            Search Verified
          </Button>
        </div>

      </form>
    </div>
  );
}
