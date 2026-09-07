'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { formatRwf } from '@/lib/utils';
import { SubscriptionTier } from '@/lib/types';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

interface VisibilityPlan {
  label: string;
  days: number;
  price: number;
}

const TIERS: {
  id: SubscriptionTier;
  name: string;
  price: number;
  period: string;
  commission: string;
  features: string[];
  popular: boolean;
}[] = [
  {
    id: 'STANDARD',
    name: 'Verified Standard',
    price: 0,
    period: 'Forever Free',
    commission: '10% Per Completed Booking',
    features: [
      'Official 40-Point Rwandan QA Audit',
      'Verified Booking Escrow & MoMo Gateway',
      'Customer Review Management & Responses',
      'Standard Search Placement',
    ],
    popular: false,
  },
  {
    id: 'CERTIFIED',
    name: 'Luxe Certified Partner',
    price: 150000,
    period: 'Per Month',
    commission: '8% Per Completed Booking',
    features: [
      'All Verified Standard Benefits',
      'Luxe Verified Official Quality Badge',
      'Priority Listing in Search & Filter Results',
      '5 Free Staff Seats at Hospitality Academy',
      'Automated Review Analytics & Insights',
    ],
    popular: true,
  },
  {
    id: 'ELITE',
    name: 'Elite Ambassador',
    price: 450000,
    period: 'Per Month',
    commission: '5% Per Completed Booking',
    features: [
      'All Certified Partner Benefits',
      'Permanent Gold Standard Feature on Homepage',
      'Dedicated Rwandan QA Auditor & On-site Inspection',
      'Unlimited Staff Academy Certifications',
      'Direct VIP Concierge Priority Recommendations',
      'Custom Photography & Drone Media Production',
    ],
    popular: false,
  },
];

export default function PartnerSubscriptionsPage() {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<SubscriptionTier | null>(null);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // Advanced Visibility Tools state
  const [visibilityPlans, setVisibilityPlans] = useState<Record<string, VisibilityPlan>>({});
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredUntil, setFeaturedUntil] = useState<string | null>(null);
  const [boosting, setBoosting] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/partner/subscriptions');
      const data = await res.json();
      if (res.ok) {
        setCurrentTier(data.subscriptionTier);
      }
    } catch (e) {
      console.error('Failed to load subscription:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisibility = async () => {
    try {
      const res = await fetch('/api/partner/visibility');
      const data = await res.json();
      if (res.ok) {
        setVisibilityPlans(data.plans || {});
        setIsFeatured(data.isFeatured);
        setFeaturedUntil(data.featuredUntil);
      }
    } catch (e) {
      console.error('Failed to load visibility status:', e);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchVisibility();
  }, []);

  const handleBoost = async (planKey: string) => {
    setBoosting(planKey);
    setErrorNotice('');
    try {
      const res = await fetch('/api/partner/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFeatured(data.isFeatured);
        setFeaturedUntil(data.featuredUntil);
        setSuccessNotice(data.message);
        setTimeout(() => setSuccessNotice(''), 4000);
      } else {
        setErrorNotice(data.error || 'Failed to purchase visibility boost');
      }
    } catch (e) {
      console.error('Boost purchase failed:', e);
      setErrorNotice('Failed to purchase visibility boost');
    } finally {
      setBoosting(null);
    }
  };

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setUpgrading(tier);
    setErrorNotice('');
    try {
      const res = await fetch('/api/partner/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier: tier, billingCycle: 'MONTHLY' }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentTier(data.subscriptionTier);
        setSuccessNotice(data.message || `Successfully updated partner membership tier to ${tier}!`);
        setTimeout(() => setSuccessNotice(''), 4000);
      } else {
        setErrorNotice(data.error || 'Failed to update subscription');
      }
    } catch (e) {
      console.error('Upgrade failed:', e);
      setErrorNotice('Failed to update subscription');
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="space-y-10">

      <DashboardHeader
        title={<>Partner Membership <span className="text-sky-600">Tiers</span></>}
        subtitle="Scale your Rwandan hospitality venue with lower commission rates, prime homepage placements, and continuous staff masterclass certifications."
      />

      {successNotice && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 font-bold text-xs text-center max-w-md mx-auto animate-in fade-in shadow-sm">
          {successNotice}
        </div>
      )}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-bold text-xs text-center max-w-md mx-auto animate-in fade-in shadow-sm">
          {errorNotice}
        </div>
      )}

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TIERS.map((tier) => {
          const isCurrent = currentTier === tier.id;
          return (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 flex flex-col justify-between space-y-6 relative transition-all bg-white shadow-sm ${
                tier.popular
                  ? 'border-2 border-sky-600 shadow-md'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                  Most Popular for 5-Star Lodges
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Text variant="h3" color="dark">{tier.name}</Text>
                  <div className="mt-3">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {tier.price === 0 ? 'Free' : formatRwf(tier.price)}
                    </span>
                    <span className="text-xs text-slate-500 font-normal ml-1">/{tier.period}</span>
                  </div>
                  <div className="text-xs text-sky-700 font-bold mt-1">{tier.commission}</div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  fullWidth
                  variant={isCurrent ? 'outline' : tier.popular ? 'primary' : 'dark'}
                  disabled={loading || upgrading !== null || isCurrent}
                  isLoading={upgrading === tier.id}
                  onClick={() => handleUpgrade(tier.id)}
                  className={isCurrent ? 'cursor-default' : ''}
                >
                  {isCurrent ? 'Current Active Tier' : `Switch to ${tier.name}`}
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Advanced Visibility Tools */}
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="text-center space-y-2">
          <Text variant="h2" color="dark" className="text-2xl">Boost Your Homepage Placement</Text>
          <Text variant="body" color="muted">
            {isFeatured && featuredUntil
              ? `Your listing is currently featured through ${new Date(featuredUntil).toLocaleDateString()}.`
              : 'Purchase a promotional spotlight to appear in featured search placement and the homepage carousel.'}
          </Text>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.entries(visibilityPlans).map(([key, plan]) => (
            <Card key={key} variant="compact" title="" className="!rounded-3xl border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <Text variant="h3" color="dark">{plan.label}</Text>
                <div className="mt-2 text-2xl font-extrabold text-slate-900">{formatRwf(plan.price)}</div>
                <Text variant="caption" color="muted">{plan.days} days of promoted placement</Text>
              </div>
              <Button
                type="button"
                fullWidth
                variant="orange"
                disabled={boosting !== null}
                isLoading={boosting === key}
                onClick={() => handleBoost(key)}
              >
                Purchase Boost
              </Button>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
