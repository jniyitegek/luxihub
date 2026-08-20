'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, MapPin, Award, ShieldCheck, Leaf, CheckCircle2 } from 'lucide-react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { formatRwf } from '@/lib/utils';
import { BusinessListing, CertificationBadge as CertBadgeType } from '@/lib/types';

const CERT_INFO: Record<Exclude<CertBadgeType, 'NONE'>, { icon: typeof Award; label: string; description: string }> = {
  GOLD_STANDARD: {
    icon: Award,
    label: 'Gold Standard Certified',
    description: 'Scored 95%+ on our physical QA audit with top verified guest reviews.',
  },
  LUXE_VERIFIED: {
    icon: ShieldCheck,
    label: 'Luxe Verified',
    description: 'Passed the physical 40-point Rwandan luxury QA inspection.',
  },
  ECO_SUSTAINABLE: {
    icon: Leaf,
    label: 'Eco Heritage Certified',
    description: "Meets Rwanda's conservation and sustainability standards.",
  },
};

const DEFAULT_CERT = {
  icon: CheckCircle2,
  label: 'Pending Audit',
  description: 'Awaiting physical QA inspection and certification.',
};

function FeaturedPartnerCard({ item }: { item: BusinessListing }) {
  const [tapped, setTapped] = useState(false);
  const cert = item.certificationBadge !== 'NONE' ? CERT_INFO[item.certificationBadge] : DEFAULT_CERT;
  const CertIcon = cert.icon;
  const image = item.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  const toggleTap = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTapped((v) => !v);
  };

  return (
    <Link
      href={`/listings/${item.slug}`}
      className="group block rounded-[28px] overflow-hidden bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Image with certification flip */}
      <div className="relative h-60 w-full p-3 bg-slate-100" style={{ perspective: '1200px' }}>
        <div
          className="relative w-full h-full rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] [@media(hover:hover)]:group-hover:[transform:rotateY(180deg)]"
        >
          {/* Front face */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden]">
            <Image
              src={image}
              alt={item.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

            {/* Certification icon — no pill, tap reveals label on touch devices */}
            <span
              role="button"
              tabIndex={0}
              aria-label={cert.label}
              onClick={toggleTap}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleTap(e)}
              className="absolute top-3 left-3 text-white/90 drop-shadow-md cursor-pointer"
            >
              <CertIcon className="w-5 h-5" />
            </span>

            {/* Tap-revealed label for touch devices */}
            {tapped && (
              <div className="absolute top-11 left-3 right-3 sm:right-auto sm:max-w-[200px] px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-sm text-white text-[11px] leading-relaxed z-10">
                <span className="font-bold">{cert.label}</span> &mdash; {cert.description}
              </div>
            )}

            {/* Rating — icon + number, no pill */}
            {item.ratingAvg > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 text-white text-xs font-bold [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%)]">
                <Star className="w-3.5 h-3.5 fill-white text-white" />
                <span>{item.ratingAvg.toFixed(1)}</span>
              </div>
            )}

            {/* Location — icon + text, no pill */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-[11px] font-semibold [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%)]">
              <MapPin className="w-3.5 h-3.5" />
              <span>{item.location}</span>
            </div>
          </div>

          {/* Back face — desktop hover reveal */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden bg-slate-900 text-white flex flex-col items-center justify-center text-center p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <CertIcon className="w-6 h-6 text-sky-400 mb-2" />
            <p className="text-sm font-bold">{cert.label}</p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{cert.description}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <Text variant="h3" color="dark" className="group-hover:text-sky-600 transition-colors line-clamp-1">
            {item.name}
          </Text>
          <Text variant="caption" color="muted" className="line-clamp-2">
            {item.description}
          </Text>
        </div>

        {/* Feature list — plain text, no chip styling */}
        {item.amenities.length > 0 && (
          <ul className="space-y-1 pt-1">
            {item.amenities.slice(0, 3).map((amenity, idx) => (
              <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
                <span className="text-sky-500 shrink-0">&ndash;</span>
                <span>{amenity}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Bottom Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <Text variant="caption" color="muted" weight="bold" className="uppercase">
              Starting
            </Text>
            <Text variant="price" color="dark">
              {formatRwf(item.basePrice)}
            </Text>
          </div>

          <div className="px-4 py-2 rounded-full bg-sky-50 group-hover:bg-sky-600 text-sky-900 group-hover:text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm">
            <span>Reserve</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedCarousel() {
  const [businesses, setBusinesses] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/businesses?featured=true');
        const data = await res.json();
        if (data.businesses) {
          setBusinesses(data.businesses);
        }
      } catch (e) {
        console.error('Failed to load featured businesses:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <Text variant="caption" color="muted" className="mt-3">Loading certified Rwandan luxury partners...</Text>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Text variant="h2" color="dark">
            Featured <span className="text-sky-600">Certified Partners</span>
          </Text>
          <Text variant="body" color="muted" className="max-w-xl">
            Explore the highest-ranking accommodations, dining establishments, and safari experiences across the Land of a Thousand Hills.
          </Text>
        </div>

        <Link href="/explore">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4 text-sky-600" />}>
            View All Experiences
          </Button>
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.slice(0, 6).map((item) => (
          <FeaturedPartnerCard key={item.id} item={item} />
        ))}
      </div>

    </section>
  );
}
