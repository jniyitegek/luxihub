import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LiveLeaderboard } from '@/components/landing/LiveLeaderboard';
import { SearchWidget } from '@/components/landing/SearchWidget';
import { WhyLuxeHub } from '@/components/landing/WhyLuxeHub';
import { FeaturedCarousel } from '@/components/landing/FeaturedCarousel';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { Text } from '@/components/ui/Text';
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Building2,
  GraduationCap,
  Award,
  Compass
} from 'lucide-react';

export default function HomePage() {
  const regions = [
    {
      name: 'Volcanoes & Musanze',
      tagline: 'Home of the Mountain Gorillas',
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
      count: '8 Verified Lodges',
      location: 'Musanze',
    },
    {
      name: 'Kigali Urban Luxury',
      tagline: '5-Star Boutiques & Gastronomy',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      count: '14 Certified Venues',
      location: 'Kigali',
    },
    {
      name: 'Lake Kivu Riviera',
      tagline: 'Waterfront Villas & Speedboats',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
      count: '6 Waterfront Resorts',
      location: 'Rubavu',
    },
    {
      name: 'Nyungwe Rainforest',
      tagline: 'Tea Estates & Canopy Trekking',
      image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
      count: '4 Forest Sanctuaries',
      location: 'Nyungwe',
    },
  ];

  return (
    <div className="w-full space-y-0 pb-0">
      
      {/* 1. Hero: The Live Leaderboard — who guests are highlighting right now */}
      <LiveLeaderboard variant="hero" />

      {/* 1b. Extras: booking & direct search, secondary to the leaderboard */}
      <section className="w-full bg-[#0B1B36] pt-2 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-6">
          <Text variant="h3" color="white">
            Ready to book directly? Search verified stays in seconds.
          </Text>
        </div>
        <SearchWidget />
      </section>

      {/* 2. Why Higa Lux Quality Assurance */}
      <WhyLuxeHub />

      {/* 3. Featured Certified Partners */}
      <div className="w-full bg-white py-8">
        <FeaturedCarousel />
      </div>

      {/* 4. Destinations Spotlight Section — Sky blue main background */}
      <section className="w-full bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 text-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Explore by <span className="text-white/90 italic">Iconic Destination</span>
              </h2>
              <p className="text-sm sm:text-base text-white/70 max-w-2xl font-normal">
                From volcanic cloud forests to urban fine dining and sapphire lake shores.
              </p>
            </div>

            <Link
              href="/explore"
              className="text-xs font-bold text-white hover:text-white/80 flex items-center gap-2 transition-colors group self-start md:self-auto bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/20"
            >
              <span>View All Regions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Region cards with darker blue overlay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((reg, i) => (
              <Link
                key={i}
                href={`/explore?location=${reg.location}`}
                className="group relative h-96 rounded-3xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1.5"
              >
                <Image
                  src={reg.image}
                  alt={reg.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B36]/95 via-[#0B1B36]/40 to-transparent" />

                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-[#0B1B36]/80 backdrop-blur-md text-[11px] font-extrabold text-white border border-white/20">
                    {reg.count}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 space-y-1.5">
                  <h3 className="text-2xl font-extrabold text-white group-hover:text-sky-200 transition-colors">
                    {reg.name}
                  </h3>
                  <p className="text-xs font-medium text-white/70">
                    {reg.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Verified Reviews Module */}
      <div className="w-full bg-slate-50 border-t border-slate-200">
        <TestimonialsSection />
      </div>

      {/* 6. Partner Hospitality Academy & Certification — Darker blue background */}
      <section className="w-full bg-gradient-to-r from-[#0B1B36] via-[#0D2240] to-[#0B1B36] text-white py-20 px-4 sm:px-6 lg:px-8 border-t border-sky-800/40 relative overflow-hidden">
        
        {/* Ambient Shape Glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-sky-400/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
          
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Get Certified with the <br />
              <span className="text-sky-400 italic">Higa Lux Quality Mark</span>
            </h3>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed font-normal">
              Join Rwanda&apos;s most prestigious network of 5-star hospitality providers. Receive professional 40-point audits, staff masterclasses at the Hospitality Academy, and direct verified booking escrow.
            </p>
            <div className="pt-2 flex flex-wrap gap-5 text-xs font-semibold">
              <div className="flex items-center gap-2 text-white/80">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Zero Listing Setup Fees</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Silver Service Staff Masterclasses</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
            <Link
              href="/partner/dashboard"
              className="px-8 py-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all text-center"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>Access Partner Portal</span>
            </Link>
            <Link
              href="/partner/academy"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all text-center"
            >
              <GraduationCap className="w-4 h-4 text-sky-300" />
              <span>Browse Academy</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
