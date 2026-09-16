'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Quote, Trophy, MapPin, Users, User } from 'lucide-react';

export interface InstagramStoryCardProps {
  serviceName?: string;
  serviceType?: string;
  location?: string;
  rating?: number;
  reviewerName?: string;
  reviewerRole?: string;
  reviewerAvatar?: string | null;
  reviewDate?: string;
  comment?: string;
  imageUrl?: string;
  galleryImages?: string[];
  qrCodeUrl?: string;
  isOffscreen?: boolean;
}

const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_AVATAR_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
];

const RATING_TIER_LABELS: Record<number, string> = {
  1: 'POOR RATING',
  2: 'FAIR RATING',
  3: 'GOOD RATING',
  4: 'EXCEPTIONAL RATING',
  5: 'EXCEPTIONAL RATING',
};

export const InstagramStoryCard = React.forwardRef<HTMLDivElement, InstagramStoryCardProps>(
  (
    {
      serviceName,
      serviceType,
      location,
      rating,
      reviewerName,
      reviewerRole,
      reviewerAvatar,
      reviewDate,
      comment,
      imageUrl,
      galleryImages,
      qrCodeUrl,
      isOffscreen = false,
    },
    ref
  ) => {
    const finalServiceName = serviceName?.trim() || 'Lake Kivu Sunset Luxury Cruises';
    const finalLocation = location?.trim() || 'Lake Kivu, Rwanda';
    const finalReviewerName = reviewerName?.trim() || 'Sarah M.';
    const finalRole = reviewerRole?.trim() || 'Traveler • Rwanda';
    const finalAvatar = reviewerAvatar !== undefined ? reviewerAvatar : DEFAULT_AVATAR_IMAGE;
    const finalDate = reviewDate?.trim() || 'Aug 18, 2025';
    const finalComment = comment?.trim() || 'I had an amazing experience on the Lake Kivu sunset cruise. The views were breathtaking, the staff were warm and professional, and the whole experience felt so relaxing and luxurious. Highly recommended!';
    const finalImage = imageUrl || DEFAULT_COVER_IMAGE;
    const gallery = galleryImages && galleryImages.length >= 3 ? galleryImages : DEFAULT_GALLERY;
    const stars = Math.min(5, Math.max(1, rating || 4.0));
    const ratingBadge = RATING_TIER_LABELS[Math.round(stars)] || 'EXCEPTIONAL RATING';

    if (isOffscreen) {
      // High-resolution 1080x1920 off-screen render target for html-to-image capture
      return (
        <div
          ref={ref}
          className="w-[1080px] h-[1920px] bg-gradient-to-b from-[#F2F7FA] via-white to-[#E3F2FD] text-slate-900 relative flex flex-col justify-between p-14 overflow-hidden select-none font-sans"
        >
          {/* Ambient Background Wave Shapes */}
          <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -right-32 w-[600px] h-[600px] bg-sky-200/60 rounded-full blur-3xl pointer-events-none" />

          {/* 1. TOP HEADER BRANDING */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-html-element-for-jsx */}
              <img src="/logo/higalux_logo_final.png" alt="Higa Lux" className="h-20 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-4 bg-[#E8F4F8] border border-[#D0E8F2] px-7 py-3.5 rounded-full shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-sm shrink-0">
                <ShieldCheck className="w-6 h-6 text-slate-900" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">STATUS</div>
                <div className="text-lg font-black text-sky-700 uppercase tracking-wider">VERIFIED GUEST REVIEW</div>
              </div>
            </div>
          </div>

          {/* 2. FEATURED DESTINATION CARD */}
          <div className="relative z-10 my-4">
            <div className="relative w-full h-[620px] rounded-[36px] overflow-hidden shadow-2xl border border-slate-200/60">
              {/* eslint-disable-next-html-element-for-jsx */}
              <img src={finalImage} alt={finalServiceName} crossOrigin="anonymous" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2942]/90 via-[#0F2942]/30 to-transparent" />

              {/* Location Badge */}
              <div className="absolute top-7 left-7 bg-[#1E3A5F]/85 backdrop-blur-md px-6 py-2.5 rounded-full text-white font-bold text-lg flex items-center gap-2.5 shadow-lg border border-white/10">
                <MapPin className="w-5 h-5 text-sky-400" />
                <span>{finalLocation}</span>
              </div>

              {/* Title & Verified Tag Overlay */}
              <div className="absolute bottom-8 left-8 right-8 space-y-2 text-left">
                <h2 className="text-4xl font-black text-white leading-tight drop-shadow-md">
                  {finalServiceName}
                </h2>
                <div className="flex items-center gap-2.5 text-white/95 text-lg font-bold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span>Verified Destination on Higa Lux</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. REVIEWER PROFILE & RATING DETAILS CARD */}
          <div className="relative z-10 space-y-6 bg-white border border-slate-100/80 p-9 rounded-[36px] shadow-2xl">
            {/* Author & Rating Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 bg-sky-100 flex items-center justify-center">
                  {finalAvatar ? (
                    /* eslint-disable-next-html-element-for-jsx */
                    <img src={finalAvatar} alt={finalReviewerName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-sky-700" />
                  )}
                </div>
                <div className="text-left space-y-1">
                  <h3 className="text-3xl font-black text-slate-900">{finalReviewerName}</h3>
                  <div className="text-lg text-slate-500 font-semibold">{finalRole}</div>
                  <div className="flex items-center gap-2 text-base text-slate-400 font-medium pt-0.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Reviewed on {finalDate}</span>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="flex items-center justify-end gap-1.5">
                  {[1, 2, 3, 4, 5].map((starIndex) => (
                    <Star
                      key={starIndex}
                      className={`w-7 h-7 ${
                        starIndex <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                      }`}
                    />
                  ))}
                  <span className="text-3xl font-black text-slate-900 ml-2">{stars.toFixed(1)}<span className="text-xl text-slate-400 font-medium">/5</span></span>
                </div>

                <div className="inline-block bg-sky-50 text-sky-700 text-sm font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wider border border-sky-100">
                  {ratingBadge}
                </div>
              </div>
            </div>

            {/* Review Quote Box */}
            <div className="p-7 rounded-3xl bg-[#F0F7FB] border border-sky-100 text-left relative space-y-2">
              <Quote className="w-8 h-8 text-sky-600 fill-sky-600/20 mb-1" />
              <p className="text-xl italic text-slate-700 leading-relaxed font-normal">
                &ldquo;{finalComment}&rdquo;
              </p>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-4">
              {gallery.slice(0, 3).map((imgUrl, i) => (
                <div key={i} className="h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                  {/* eslint-disable-next-html-element-for-jsx */}
                  <img src={imgUrl} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Trust Verification Banner */}
            <div className="p-4 rounded-2xl bg-[#EAF5FA] border border-sky-100 flex items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Trophy className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-lg font-bold text-sky-800 relative">
                <span>A trusted experience, verified by Higa Lux</span>
                <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-0.5" />
              </div>
            </div>
          </div>

          {/* 4. FOOTER */}
          <div className="relative z-10 flex items-center justify-between pt-2">
            {/* eslint-disable-next-html-element-for-jsx */}
            <img src="/logo/higalux_logo_final.png" alt="Higa Lux" className="h-14 w-auto object-contain" />
            <div className="relative text-right">
              <span className="text-3xl font-bold text-sky-600 italic tracking-wide font-serif">
                More amazing experiences await...
              </span>
              <div className="w-40 h-1 bg-amber-400 rounded-full ml-auto mt-0.5" />
            </div>
          </div>
        </div>
      );
    }

    // Interactive responsive live preview card (scaled for inside modal view)
    return (
      <div
        ref={ref}
        className="w-full max-w-sm mx-auto bg-gradient-to-b from-[#F2F7FA] via-white to-[#E3F2FD] text-slate-900 relative flex flex-col justify-between p-4 rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden select-none font-sans space-y-3"
      >
        {/* Top Header Branding */}
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-html-element-for-jsx */}
          <img src="/logo/higalux_logo_final.png" alt="Higa Lux" className="h-7 w-auto object-contain" />

          <div className="flex items-center gap-1.5 bg-[#E8F4F8] border border-[#D0E8F2] px-2.5 py-1 rounded-full shadow-xs">
            <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 shrink-0">
              <ShieldCheck className="w-2.5 h-2.5 text-slate-900" />
            </div>
            <div className="text-left">
              <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">STATUS</div>
              <div className="text-[9px] font-black text-sky-700 uppercase tracking-wider leading-tight">VERIFIED GUEST REVIEW</div>
            </div>
          </div>
        </div>

        {/* Featured Destination Card */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-md border border-slate-200/60 my-1">
          {/* eslint-disable-next-html-element-for-jsx */}
          <img src={finalImage} alt={finalServiceName} crossOrigin="anonymous" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2942]/90 via-[#0F2942]/30 to-transparent" />

          <div className="absolute top-2.5 left-2.5 bg-[#1E3A5F]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white font-bold text-[9px] flex items-center gap-1 border border-white/10">
            <MapPin className="w-2.5 h-2.5 text-sky-400" />
            <span>{finalLocation}</span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-left space-y-0.5">
            <h3 className="text-base font-black text-white truncate leading-tight drop-shadow-sm">
              {finalServiceName}
            </h3>
            <div className="flex items-center gap-1 text-white/95 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Verified Destination on Higa Lux</span>
            </div>
          </div>
        </div>

        {/* Reviewer Profile & Rating Details Card */}
        <div className="bg-white border border-slate-100 p-3.5 rounded-2xl shadow-md space-y-2.5 text-left">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-sky-100 flex items-center justify-center">
                {finalAvatar ? (
                  /* eslint-disable-next-html-element-for-jsx */
                  <img src={finalAvatar} alt={finalReviewerName} crossOrigin="anonymous" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-sky-700" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">{finalReviewerName}</h4>
                <div className="text-[10px] text-slate-500 font-medium">{finalRole}</div>
                <div className="flex items-center gap-1 text-[9px] text-slate-400 font-normal">
                  <Users className="w-2.5 h-2.5 text-slate-400" />
                  <span>Reviewed on {finalDate}</span>
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-0.5">
                {[1, 2, 3, 4, 5].map((starIndex) => (
                  <Star
                    key={starIndex}
                    className={`w-3 h-3 ${
                      starIndex <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
                <span className="text-xs font-black text-slate-900 ml-1">{stars.toFixed(1)}/5</span>
              </div>
              <div className="inline-block bg-sky-50 text-sky-700 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-sky-100">
                {ratingBadge}
              </div>
            </div>
          </div>

          {/* Quote Box */}
          <div className="p-2.5 rounded-xl bg-[#F0F7FB] border border-sky-100 text-[10px] italic text-slate-700 leading-relaxed font-normal relative">
            <Quote className="w-3.5 h-3.5 text-sky-600 fill-sky-600/20 mb-0.5 inline-block mr-1" />
            &ldquo;{finalComment}&rdquo;
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {gallery.slice(0, 3).map((imgUrl, i) => (
              <div key={i} className="h-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                {/* eslint-disable-next-html-element-for-jsx */}
                <img src={imgUrl} alt="" crossOrigin="anonymous" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Trust Banner */}
          <div className="p-2 rounded-xl bg-[#EAF5FA] border border-sky-100 flex items-center justify-center gap-1.5 text-center">
            <Trophy className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <div className="text-[9px] font-bold text-sky-800 relative">
              <span>A trusted experience, verified by Higa Lux</span>
              <div className="w-8 h-0.5 bg-amber-400 rounded-full mx-auto mt-0.5" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          {/* eslint-disable-next-html-element-for-jsx */}
          <img src="/logo/higalux_logo_final.png" alt="Higa Lux" className="h-5 w-auto object-contain" />
          <div className="text-right">
            <span className="text-[10px] font-bold text-sky-600 italic tracking-wide font-serif">
              More amazing experiences await...
            </span>
            <div className="w-16 h-0.5 bg-amber-400 rounded-full ml-auto mt-0.5" />
          </div>
        </div>
      </div>
    );
  }
);

InstagramStoryCard.displayName = 'InstagramStoryCard';

