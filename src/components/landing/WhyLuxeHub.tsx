import React from 'react';
import { Text } from '@/components/ui/Text';

export function WhyLuxeHub() {
  return (
    <section className="w-full py-20 bg-slate-100/70 border-y border-slate-200/80 relative overflow-hidden bg-organic-topo">
      
      {/* Subtle Background Glowing Spheres */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Text variant="h2" color="dark">
            Why Book with <span className="text-sky-600">Higa Lux?</span>
          </Text>
          <Text variant="body" color="muted" className="leading-relaxed">
            We bridge the gap between discerning travelers and Rwandan luxury hospitality with uncompromised on-the-ground verification and verified guest transparency.
          </Text>
        </div>

        {/* 4 Pillars Grid in Soft 3XL Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 space-y-4">
            {/* TODO: confirm the actual inspection point count with product before launch */}
            <Text variant="h3" color="dark">40-Point Inspection</Text>
            <Text variant="caption" color="muted" className="leading-relaxed">
              Every hotel, dining room, and safari vehicle undergoes comprehensive physical auditing by certified hospitality inspectors.
            </Text>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 space-y-4">
            <Text variant="h3" color="dark">Verified Bookers Only</Text>
            <Text variant="caption" color="muted" className="leading-relaxed">
              Only travelers with completed, platform-processed stays can review venues. Zero fabricated testimonials.
            </Text>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 space-y-4">
            <Text variant="h3" color="dark">Eco & Conservation</Text>
            <Text variant="caption" color="muted" className="leading-relaxed">
              Prioritizing Rwanda&apos;s zero-plastic mandates, solar energy systems, and community revenue sharing in the Virungas.
            </Text>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 space-y-4">
            <Text variant="h3" color="dark">Instant Local Payments</Text>
            <Text variant="caption" color="muted" className="leading-relaxed">
              Pay in Rwandan Francs (RWF) or USD seamlessly via MTN MoMo, Airtel Money, or international credit cards with instant QR vouchers.
            </Text>
          </div>

        </div>

        {/* Certification Hierarchy */}
        <div className="p-8 sm:p-12 rounded-[32px] bg-white border border-slate-200 shadow-xl space-y-8">
          <div className="max-w-3xl">
            <Text variant="h2" color="dark">
              The Higa Lux Certification Hierarchy
            </Text>
            {/* TODO: confirm review cadence / methodology copy with product before launch */}
            <Text variant="body" color="muted" className="mt-1">
              Every partner is reviewed against one of three tiers based on on-site inspections and verified guest reviews.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Gold Standard Tier</span>
                {/* TODO: confirm scoring rubric / range with product before launch */}
                <span className="text-xs font-mono text-sky-600 font-extrabold">95 - 100 Score</span>
              </div>
              <Text variant="caption" className="text-slate-700 leading-relaxed">
                {/* TODO: source a verified guest-satisfaction figure, or remove the claim */}
                Our highest tier: private butler service, meticulous hygiene standards, and a dedicated sommelier cellar.
              </Text>
              <div className="pt-2 text-[11px] text-slate-900 font-extrabold">
                Featured in VIP Concierge Priority
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Luxe Verified Tier</span>
                {/* TODO: confirm scoring rubric / range with product before launch */}
                <span className="text-xs font-mono text-sky-600 font-extrabold">80 - 94 Score</span>
              </div>
              <Text variant="caption" className="text-slate-700 leading-relaxed">
                {/* TODO: confirm the actual inspection point count with product before launch */}
                Passed the physical 40-point Rwandan inspection. Guaranteed amenities, transparent pricing, and direct booking confirmation.
              </Text>
              <div className="pt-2 text-[11px] text-slate-900 font-extrabold">
                Verified Direct Booking Escrow
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Eco Sustainable Tier</span>
                <span className="text-xs font-mono text-sky-600 font-extrabold">Eco Certified</span>
              </div>
              <Text variant="caption" className="text-slate-700 leading-relaxed">
                Adheres to gorilla conservation protocol, zero single-use plastic, solar power generation, and community profit sharing.
              </Text>
              <div className="pt-2 text-[11px] text-slate-900 font-extrabold">
                Primate Conservation Endorsed
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
