'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, UtensilsCrossed, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const fieldStyles =
  'w-full h-[42px] bg-slate-50 border border-slate-200/80 rounded-lg px-3.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all';

export function SearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'HOTEL' | 'RESTAURANT' | 'TOUR'>('ALL');
  const [location, setLocation] = useState('ALL');
  const [query, setQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (activeTab !== 'ALL') params.set('type', activeTab);
    if (location !== 'ALL') params.set('location', location);
    if (query) params.set('q', query);
    if (verifiedOnly) params.set('badge', 'LUXE_VERIFIED');
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white p-4 md:p-5 shadow-lg shadow-slate-900/5 border border-slate-200/90 space-y-3">

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={activeTab === 'ALL' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={activeTab === 'ALL' ? <Search className="w-3.5 h-3.5" /> : undefined}
          onClick={() => setActiveTab('ALL')}
        >
          All Experiences
        </Button>

        <Button
          type="button"
          variant={activeTab === 'HOTEL' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={activeTab === 'HOTEL' ? <Building2 className="w-3.5 h-3.5" /> : undefined}
          onClick={() => setActiveTab('HOTEL')}
        >
          Lodges & Hotels
        </Button>

        <Button
          type="button"
          variant={activeTab === 'RESTAURANT' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={activeTab === 'RESTAURANT' ? <UtensilsCrossed className="w-3.5 h-3.5" /> : undefined}
          onClick={() => setActiveTab('RESTAURANT')}
        >
          Fine Dining
        </Button>

        <Button
          type="button"
          variant={activeTab === 'TOUR' ? 'primary' : 'pill'}
          size="sm"
          leftIcon={activeTab === 'TOUR' ? <Compass className="w-3.5 h-3.5" /> : undefined}
          onClick={() => setActiveTab('TOUR')}
        >
          Gorilla & Safari Tours
        </Button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1.1fr_auto] gap-2.5">

        {/* Search Query */}
        <input
          type="text"
          placeholder="Search experiences, e.g. Bisate, heated pool..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={fieldStyles}
        />

        {/* Rwandan Destination */}
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`${fieldStyles} cursor-pointer`}
        >
          <option value="ALL">All Rwanda Regions</option>
          <option value="Kigali">Kigali City (Urban Luxury)</option>
          <option value="Musanze">Musanze (Volcanoes / Gorillas)</option>
          <option value="Rubavu">Rubavu / Lake Kivu</option>
          <option value="Nyungwe">Nyungwe Rainforest</option>
          <option value="Akagera">Akagera National Park</option>
        </select>

        {/* Verified Partners Toggle */}
        <button
          type="button"
          onClick={() => setVerifiedOnly((v) => !v)}
          aria-pressed={verifiedOnly}
          className={`h-[42px] flex items-center justify-between gap-2 rounded-lg border px-3.5 transition-colors ${
            verifiedOnly ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <span className="text-xs sm:text-sm font-semibold text-slate-700">Verified Partners Only</span>
          <span
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
              verifiedOnly ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                verifiedOnly ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </span>
        </button>

        {/* Submit Action */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          leftIcon={<Search className="w-4 h-4" />}
          className="h-[42px]"
        >
          Search
        </Button>

      </form>
    </div>
  );
}
