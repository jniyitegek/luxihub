'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Star, CheckCircle2, MessageSquare, Quote } from 'lucide-react';
import Image from 'next/image';

const ROW_HEIGHT = 108;
const AVATAR_SIZE = 64;
const BULGE = 44;
const AUTOPLAY_MS = 5000;

export function TestimonialsSection() {
  const reviews = [
    {
      author: 'Clarisse Mutoni',
      origin: 'Kigali, Rwanda',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      venue: 'The Retreat by Heaven (Kigali)',
      rating: 5,
      cleanliness: 5,
      service: 5,
      hospitality: 5,
      date: 'July 2026',
      title: 'An unforgettable oasis of peace and Rwandan luxury!',
      comment:
        'From the warm greeting with Amaraba tea to the exquisite farm-to-table breakfast by the saltwater pool, our stay at The Retreat was flawless. The staff anticipated every need and the attention to detail is truly world-class.',
      partnerReply:
        'Murakoze cyane Clarisse! It was an absolute delight hosting you, and our team cannot wait to welcome you back to your Kigali home.',
      replyAuthor: 'Jean-Paul N. (General Manager)',
    },
    {
      author: 'Sarah Jenkins',
      origin: 'San Francisco, USA',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      venue: 'Bisate Lodge by Wilderness (Musanze)',
      rating: 5,
      cleanliness: 5,
      service: 5,
      hospitality: 5,
      date: 'June 2026',
      title: 'Priceless gorilla trekking experience and royal hospitality',
      comment:
        'The spherical villas with views of Mount Bisoke take your breath away. The lodge team organized our gorilla trek effortlessly and had warm fireplace cocktails ready upon our return. 100% deserves the Gold Standard badge.',
      partnerReply:
        'Thank you Sarah! Protecting the volcanic mountain gorillas while delivering unmatched Rwandan warmth is our life passion.',
      replyAuthor: 'Alphonse B. (Lodge Director)',
    },
    {
      author: 'David Van Der Bilt',
      origin: 'Brussels, Belgium',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      venue: 'Meza Malonga Fine Dining (Kigali)',
      rating: 5,
      cleanliness: 5,
      service: 5,
      hospitality: 5,
      date: 'July 2026',
      title: 'A 10-course culinary masterwork of African terroir',
      comment:
        'Chef Dieuveil Malonga has created something peerless. The indigenous grain pairings and Rwandan artisanal spirit flights were on par with 3-star Michelin establishments in Europe.',
      partnerReply:
        'Merci David! Celebrating African gastronomy at the highest echelon is our collective mission.',
      replyAuthor: 'Meza Malonga Hospitality Team',
    },
  ];

  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const restartAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    restartAutoplay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (index: number) => {
    setActive(index);
    restartAutoplay();
  };

  const current = reviews[active];
  const n = reviews.length;
  const railHeight = ROW_HEIGHT * n;
  const topY = ROW_HEIGHT / 2;
  const bottomY = railHeight - ROW_HEIGHT / 2;
  const midY = railHeight / 2;

  // Top/bottom avatars rest further right; the center (active) avatar sits
  // further left, so the connecting line bows outward to the left like "(".
  const restX = BULGE + AVATAR_SIZE / 2;
  const bulgeX = AVATAR_SIZE / 2;
  const railWidth = restX + 12;

  // Solve for the single circle passing through the top, center, and bottom
  // avatar centers, so the arc is a true constant-curvature curve (no
  // reversal) and every avatar sits exactly on it.
  const h = midY - topY;
  const centerOffset = (h * h - BULGE * BULGE) / (2 * BULGE);
  const arcRadius = Math.sqrt(centerOffset * centerOffset + h * h);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">

      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verified Reviews from <span className="text-sky-600">Real Travelers</span>
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Only guests who booked and completed their stay through Higa Lux can submit ratings.
        </p>
      </div>

      <div className="relative">

        {/* Decorative accent semicircle behind card */}
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-sky-600 rounded-full pointer-events-none" style={{ boxShadow: 'none' }} aria-hidden="true" />

        <div className="relative rounded-[32px] bg-white border border-slate-200 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-[400px_1fr]">

          {/* Decorative corner accent */}
          <div className="absolute -top-28 -left-28 w-72 h-72 bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Avatar Rail */}
          <div className="relative px-6 sm:px-8 py-10 lg:py-14 border-b lg:border-b-0 border-slate-100">
            <div className="relative" style={{ height: railHeight }}>
              {/* Semicircular bow connecting line — lives in the same coordinate
                  space as the avatar rows below so the curve and the avatar
                  centers share one exact origin. */}
              <svg
                className="absolute left-0 top-0 pointer-events-none"
                width={railWidth}
                height={railHeight}
                viewBox={`0 0 ${railWidth} ${railHeight}`}
                fill="none"
              >
                <path
                  d={`M${restX},${topY} A${arcRadius},${arcRadius} 0 0 0 ${restX},${bottomY}`}
                  stroke="#94A3B8"
                  strokeWidth={2}
                />
              </svg>

              {reviews.map((review, index) => {
                const slot = (index - active + 1 + n) % n;
                const isActive = slot === 1;
                const avatarX = isActive ? bulgeX : restX;
                const bulge = avatarX - AVATAR_SIZE / 2;
                return (
                  <button
                    key={review.author}
                    type="button"
                    onClick={() => handleSelect(index)}
                    className="absolute left-0 w-full flex items-center gap-3 text-left transition-[top] duration-700 ease-in-out"
                    style={{ top: slot * ROW_HEIGHT, height: ROW_HEIGHT }}
                    aria-pressed={isActive}
                  >
                    <div
                      className={`relative z-10 shrink-0 rounded-full overflow-hidden border-2 transition-all duration-700 ease-in-out ${
                        isActive ? 'border-sky-500 shadow-lg shadow-sky-500/20' : 'border-slate-200 opacity-60'
                      }`}
                      style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, marginLeft: bulge }}
                    >
                      <Image src={review.avatar} alt={review.author} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="relative z-10 min-w-0 flex-1 transition-all duration-700 ease-in-out">
                      <div
                        className={`font-bold truncate transition-all duration-300 ${
                          isActive ? 'text-xl text-slate-900' : 'text-sm text-slate-400'
                        }`}
                      >
                        {review.author}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1 ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                        <Star className={`shrink-0 transition-all duration-300 ${isActive ? 'w-4 h-4 fill-sky-500 text-sky-500' : 'w-3 h-3 fill-slate-300 text-slate-300'}`} />
                        <span className={`font-semibold whitespace-nowrap transition-all duration-300 ${isActive ? 'text-sm' : 'text-xs'}`}>{review.rating.toFixed(1)}</span>
                        <span className="text-[11px] whitespace-nowrap">on {review.date}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Testimonial */}
          <div className="relative p-10 sm:p-14 lg:p-20 flex items-center min-h-[380px]">
            <Quote className="absolute top-8 left-8 sm:left-12 w-16 h-16 text-sky-50" strokeWidth={1.5} fill="currentColor" />

            <div key={active} className="relative w-full space-y-7 animate-testimonial-in">

            {/* Venue & Verified Tag */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-900">
                {current.venue}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-sky-700">
                <CheckCircle2 className="w-3 h-3 text-sky-600" />
                <span>Verified Stay</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="space-y-3">
              <h5 className="text-sm sm:text-base font-bold text-slate-900">{current.title}</h5>
              <p className="font-serif italic text-lg sm:text-xl text-slate-700 leading-relaxed">
                &ldquo;{current.comment}&rdquo;
              </p>
              <p className="text-xs text-slate-500 font-medium pt-1">
                &mdash; {current.author}, {current.origin}
              </p>
            </div>

            {/* Multi-Criteria Ratings */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-500 max-w-sm">
              <div>Cleanliness: <span className="text-slate-900 font-bold">{current.cleanliness.toFixed(1)}/5</span></div>
              <div>Service: <span className="text-slate-900 font-bold">{current.service.toFixed(1)}/5</span></div>
              <div>Hospitality: <span className="text-slate-900 font-bold">{current.hospitality.toFixed(1)}/5</span></div>
            </div>

            {/* Partner Reply */}
            {current.partnerReply && (
              <div className="p-3.5 rounded-xl bg-sky-50/70 border-l-4 border-sky-600 text-xs space-y-1 max-w-lg">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-900">
                  <MessageSquare className="w-3 h-3 text-sky-600" />
                  <span>{current.replyAuthor}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                  {current.partnerReply}
                </p>
              </div>
            )}

            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
