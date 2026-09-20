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
  ShieldCheck,
  ArrowRight,
  Building2,
  GraduationCap
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
    <div className="w-full bg-[#FAF9F6] text-slate-900 min-h-screen">
      
      {/* 1. Hero: Live Leaderboard Section */}
      <div id="leaderboard" className="scroll-mt-24">
        <LiveLeaderboard variant="hero" />
      </div>

      {/* 1b. Search widget section */}
      <section id="browse" className="w-full bg-[#FAF9F6] pt-4 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 scroll-mt-24">
        <div className="max-w-4xl mx-auto text-center mb-4">
          <Text variant="h3" color="dark" className="text-xl sm:text-2xl">
            Ready to book directly? Search verified stays in seconds.
          </Text>
        </div>
        <SearchWidget />
      </section>

      {/* 2. Why Higa Lux Quality Assurance */}
      <div id="why-higalux" className="scroll-mt-24">
        <WhyLuxeHub />
      </div>

      {/* 3. Featured Certified Partners */}
      <div id="featured" className="w-full bg-white py-8 border-y border-slate-200/80 scroll-mt-24">
        <FeaturedCarousel />
      </div>

      {/* 4. Destinations Spotlight Section */}
      <section id="destinations" className="w-full bg-[#FAF9F6] text-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <Text variant="h2" color="dark" className="text-3xl sm:text-4xl lg:text-5xl">
                Explore by <span className="text-sky-600 italic">Iconic Destination</span>
              </Text>
              <Text variant="body" color="muted" className="max-w-2xl">
                From volcanic cloud forests to urban fine dining and sapphire lake shores.
              </Text>
            </div>

            <Link
              href="/explore"
              className="text-xs font-bold text-sky-700 hover:text-sky-600 flex items-center gap-2 transition-colors group self-start md:self-auto bg-white hover:bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200/90 shadow-sm"
            >
              <span>View All Regions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Region cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regions.map((reg, i) => (
              <Link
                key={i}
                href={`/explore?location=${reg.location}`}
                className="group relative h-96 rounded-3xl overflow-hidden border border-slate-200/80 transition-all duration-500 shadow-md hover:shadow-xl hover:-translate-y-1"
              >
                <Image
                  src={reg.image}
                  alt={reg.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                <div className="absolute top-4 right-4">
                  <span className="text-[11px] font-extrabold text-white bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                    {reg.count}
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 space-y-1.5">
                  <Text variant="h3" color="white" className="text-2xl group-hover:text-sky-300 transition-colors">
                    {reg.name}
                  </Text>
                  <Text variant="caption" className="text-slate-200 font-medium block">
                    {reg.tagline}
                  </Text>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. Verified Reviews Module */}
      <div id="testimonials" className="w-full bg-white border-b border-slate-200/80 scroll-mt-24">
        <TestimonialsSection />
      </div>

      {/* 6. Partner Hospitality Academy & Certification */}
      <section id="certification" className="w-full bg-[#FAF9F6] text-slate-900 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 scroll-mt-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-md">
          
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
              
              <span>Hospitality Certification</span>
            </div>

            <Text variant="h2" color="dark" className="text-3xl sm:text-4xl leading-tight">
              Get Certified with the <br />
              <span className="text-sky-600 italic">Higa Lux Quality Mark</span>
            </Text>
            <Text variant="body" color="muted" className="leading-relaxed">
              Join Rwanda&apos;s most prestigious network of 5-star hospitality providers. Receive professional 40-point audits, staff masterclasses at the Hospitality Academy, and direct verified booking escrow.
            </Text>
            <div className="pt-2 flex flex-wrap gap-5 text-xs font-semibold">
              <div className="flex items-center gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Zero Listing Setup Fees</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>Silver Service Staff Masterclasses</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
            <Link
              href="/partner/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition-all text-center"
            >
              <Building2 className="w-4 h-4" />
              <span>Access Partner Portal</span>
            </Link>
            <Link
              href="/partner/academy"
              className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 transition-all text-center"
            >
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <span>Browse Academy</span>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
