import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchWidget } from './SearchWidget';
import { Check, ChevronRight, Star } from 'lucide-react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  return (
    <section className="relative w-full bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 text-white pt-28 pb-24 overflow-hidden">
      
      {/* Background Shapes */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-white/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-0 right-10 w-[600px] h-[350px] bg-sky-300/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100 200 C 300 100, 700 400, 1540 150 C 1200 600, 400 500, -100 700 Z" stroke="white" strokeWidth="2" />
        <circle cx="1200" cy="200" r="300" stroke="white" strokeWidth="1" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div>
              <Text variant="h1" color="white" className="mb-5">
                Planning your dream stay? <br />
                <span className="text-white/90">
                  It starts with verified Rwanda.
                </span>
              </Text>

              <Text variant="body" color="white" className="text-white/80 text-base sm:text-lg max-w-xl mb-8">
                RDB-certified 5-star eco-lodges, bespoke mountain gorilla treks, and private fine dining that guarantee your peace of mind.
              </Text>

              {/* Feature Checklist */}
              <div className="space-y-3.5 mb-9">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white text-sky-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <Text variant="body" color="white">
                    Highest rated safari & lodge platform in Rwanda
                  </Text>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white text-sky-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <Text variant="body" color="white">
                    Official RDB 40-point QA inspected venues
                  </Text>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white text-sky-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <Text variant="body" color="white">
                    Instant MTN MoMo & card payment protection
                  </Text>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <Link href="/explore">
                  <Button
                    variant="dark"
                    size="lg"
                    rightIcon={<ChevronRight className="w-4 h-4 stroke-[3]" />}
                  >
                    Explore Verified Stays
                  </Button>
                </Link>

                <Link href="/partner/dashboard">
                  <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                    Partner Portal
                  </Button>
                </Link>
              </div>

              {/* Trustpilot Bar */}
              <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-emerald-300 fill-emerald-300" />
                  <span className="font-bold text-white">Trustpilot</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-3.5 h-3.5 bg-emerald-500 flex items-center justify-center rounded-[2px]">
                      <Star className="w-2.5 h-2.5 text-white fill-white" />
                    </div>
                  ))}
                </div>
                <Text variant="caption" color="white">
                  TrustScore <strong className="font-bold">4.9/5</strong> • 1,240 reviews
                </Text>
              </div>

            </div>

          </div>

          {/* Right Column: Stat Cards Mosaic — darker blue cards */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-5">
            
            <div className="relative h-48 sm:h-56 rounded-[28px] overflow-hidden shadow-2xl group border border-white/20">
              <Image
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                alt="Luxury Lodge Morning Service"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B36]/95 via-[#0B1B36]/30 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                <Text variant="h2" color="white">98%</Text>
                <Text variant="caption" color="white" className="mt-1 text-white/80">
                  Reported an elevated stay with 5-star service
                </Text>
              </div>
            </div>

            <div className="relative h-48 sm:h-56 rounded-[28px] overflow-hidden shadow-2xl group border border-white/20">
              <Image
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                alt="Rwandan Specialty Coffee & Breakfast"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B36]/95 via-[#0B1B36]/30 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                <Text variant="h2" color="white">97%</Text>
                <Text variant="caption" color="white" className="mt-1 text-white/80">
                  Travelers found direct booking seamless & easy
                </Text>
              </div>
            </div>

            <div className="relative h-52 sm:h-60 rounded-[28px] overflow-hidden shadow-2xl group border border-white/20">
              <Image
                src="https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80"
                alt="Volcanoes Safari Wilderness Guides"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B36]/95 via-[#0B1B36]/30 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                <Text variant="h2" color="white">92%</Text>
                <Text variant="caption" color="white" className="mt-1 text-white/80">
                  Rated wildlife guides as world-class
                </Text>
              </div>
            </div>

            <div className="relative h-52 sm:h-60 rounded-[28px] overflow-hidden shadow-2xl group border border-white/20">
              <Image
                src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80"
                alt="Lake Kivu Sanctuary & Wellness"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B36]/95 via-[#0B1B36]/30 to-transparent p-4 sm:p-5 flex flex-col justify-end">
                <Text variant="h2" color="white">86%</Text>
                <Text variant="caption" color="white" className="mt-1 text-white/80">
                  Rated wellness & serenity as unmatched
                </Text>
              </div>
            </div>

          </div>

        </div>

        {/* Full-width Search Bar Overlay */}
        <div className="w-full pt-4">
          <SearchWidget />
        </div>

      </div>

    </section>
  );
}
