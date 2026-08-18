import React from 'react';
import { ShieldCheck, Award, Leaf, CheckCircle, Flame, Sparkles, Building, UserCheck } from 'lucide-react';
import { Text } from '@/components/ui/Text';
import { CertificationBadge } from '../ui/CertificationBadge';

export function WhyLuxeHub() {
  return (
    <section className="w-full py-20 bg-slate-100/70 border-y border-slate-200/80 relative overflow-hidden bg-organic-topo">
      
      {/* Subtle Background Glowing Spheres */}
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

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
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Award className="w-7 h-7" />
            </div>
            <Text variant="h3" color="dark">40-Point Inspection</Text>
            <Text variant="caption" color="muted" className="leading-relaxed">
              Every hotel, dining room, and safari vehicle undergoes comprehensive physical auditing by certified hospitality inspectors.
            </Text>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <UserCheck className="w-7 h-7" />
            </div>
            <Text variant="h3" color="dark">Verified Bookers Only</Text>
            <Text variant="caption" color="muted" className="leading-relaxed">
              Only travelers with completed, platform-processed stays can review venues. Zero fabricated testimonials.
            </Text>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Leaf className="w-7 h-7" />
            </div>
            <Text variant="h3" color="dark">Eco & Conservation</Text>
            <Text variant="caption" color="muted" className="leading-relaxed">
              Prioritizing Rwanda&apos;s zero-plastic mandates, solar energy systems, and community revenue sharing in the Virungas.
            </Text>
          </div>

          <div className="p-7 rounded-[28px] bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1.5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
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
            <Text variant="body" color="muted" className="mt-1">
              Our dynamic badge algorithm continuously updates venue statuses based on live audits and traveler satisfaction scores.
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-sky-50/50 to-white border border-amber-300/60 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <CertificationBadge badge="GOLD_STANDARD" size="md" />
                <span className="text-xs font-mono text-amber-900 font-extrabold">95 - 100 Score</span>
              </div>
              <Text variant="caption" className="text-slate-700 leading-relaxed">
                The zenith of Rwandan hospitality. 5-star private butler service, flawless hygiene, master sommelier cellar, and 98%+ guest satisfaction.
              </Text>
              <div className="pt-2 text-[11px] text-amber-900 flex items-center gap-1.5 font-extrabold">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Featured in VIP Concierge Priority</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 via-sky-50/50 to-white border border-sky-300/60 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <CertificationBadge badge="LUXE_VERIFIED" size="md" />
                <span className="text-xs font-mono text-sky-900 font-extrabold">80 - 94 Score</span>
              </div>
              <Text variant="caption" className="text-slate-700 leading-relaxed">
                Passed the physical 40-point Rwandan inspection. Guaranteed amenities, transparent pricing, and direct booking confirmation.
              </Text>
              <div className="pt-2 text-[11px] text-sky-900 flex items-center gap-1.5 font-extrabold">
                <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>Verified Direct Booking Escrow</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white border border-emerald-300/60 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <CertificationBadge badge="ECO_SUSTAINABLE" size="md" />
                <span className="text-xs font-mono text-emerald-900 font-extrabold">Eco Certified</span>
              </div>
              <Text variant="caption" className="text-slate-700 leading-relaxed">
                Adheres to gorilla conservation protocol, zero single-use plastic, solar power generation, and community profit sharing.
              </Text>
              <div className="pt-2 text-[11px] text-emerald-900 flex items-center gap-1.5 font-extrabold">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                <span>Primate Conservation Endorsed</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
