import React from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Quote } from 'lucide-react';
import Image from 'next/image';

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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Authentic Guest Transparency
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Verified Reviews from <span className="text-sky-600">Real Travelers</span>
        </h2>
        <p className="text-sm text-slate-600 font-normal">
          Only guests who booked and completed their stay through Luxe Hub can submit ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 relative"
          >
            <div className="space-y-4">
              
              {/* Reviewer Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-sky-200">
                    <Image src={review.avatar} alt={review.author} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{review.author}</h4>
                    <span className="text-[11px] text-slate-500">{review.origin}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Stay</span>
                </div>
              </div>

              {/* Venue Tag & Rating */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{review.venue}</span>
                <div className="flex items-center gap-0.5">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-slate-900">{review.title}</h5>
                <p className="text-xs text-slate-600 font-normal leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>

              {/* Multi-Criteria Ratings Pill Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                <div>Cleanliness: <span className="text-slate-900 font-bold">5.0/5</span></div>
                <div>Service: <span className="text-slate-900 font-bold">5.0/5</span></div>
                <div>Hospitality: <span className="text-slate-900 font-bold">5.0/5</span></div>
              </div>

            </div>

            {/* Partner Reply Box */}
            {review.partnerReply && (
              <div className="p-3.5 rounded-xl bg-sky-50/70 border-l-4 border-sky-600 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-900">
                  <MessageSquare className="w-3 h-3 text-sky-600" />
                  <span>{review.replyAuthor}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-normal">
                  {review.partnerReply}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

    </section>
  );
}
