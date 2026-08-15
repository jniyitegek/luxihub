'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CertificationBadge } from '../ui/CertificationBadge';
import { formatRwf, formatUsd } from '@/lib/utils';
import { BusinessListing } from '@/lib/types';

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

      {/* Cards Grid using Reusable Card Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.slice(0, 6).map((item) => (
          <Card
            key={item.id}
            variant="vertical"
            href={`/listings/${item.slug}`}
            title={item.name}
            subtitle={item.description}
            image={item.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
            price={formatRwf(item.basePrice)}
            rating={item.ratingAvg}
            reviewCount={item.reviewCount}
            location={item.location}
            badgeTag={<CertificationBadge badge={item.certificationBadge} size="sm" />}
            actionText="Reserve"
          >
            {/* Amenities Tag Row */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.amenities.slice(0, 3).map((amenity, idx) => (
                <Badge key={idx} variant="tag">
                  {amenity}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

    </section>
  );
}
