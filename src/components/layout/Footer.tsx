import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Phone, Mail, MapPin, Award, CheckCircle, HeartHandshake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quality Guarantee Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">40-Point Rwandan QA Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Every listed venue undergoes rigorous unannounced inspections on service, hygiene, and sustainability.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">100% Verified Guest Reviews</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Feedback is exclusively submitted by guests who completed platform-processed stays. Zero fake reviews.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Seamless MTN MoMo & Card</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Instant Rwandan mobile money and global card processing with instant voucher delivery and QR codes.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">
          
          <div className="md:col-span-2 space-y-4">
            <Image
              src="/logo/higa_logo_horizontal_white.png"
              alt="Higa Lux"
              width={180}
              height={60}
              className="h-9 w-auto"
            />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
              The premier quality assurance and verified booking platform for Rwanda&apos;s luxury lodges, fine dining institutions, and bespoke safari expeditions.
            </p>
            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Kigali Innovation City, Gasabo, Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>+250 788 123 456 / +250 782 000 000 (VIP Concierge)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>concierge@higalux.rw</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs mb-4 tracking-wider uppercase">Destinations</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/explore?location=Kigali" className="hover:text-sky-400 transition-colors">Kigali City (Urban Luxury)</Link></li>
              <li><Link href="/explore?location=Musanze" className="hover:text-sky-400 transition-colors">Volcanoes National Park</Link></li>
              <li><Link href="/explore?location=Rubavu" className="hover:text-sky-400 transition-colors">Lake Kivu Riviera</Link></li>
              <li><Link href="/explore?location=Nyungwe" className="hover:text-sky-400 transition-colors">Nyungwe Rainforest</Link></li>
              <li><Link href="/explore?location=Akagera" className="hover:text-sky-400 transition-colors">Akagera National Park</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs mb-4 tracking-wider uppercase">Experiences</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/explore?type=HOTEL" className="hover:text-sky-400 transition-colors">Luxury Lodges & Hotels</Link></li>
              <li><Link href="/explore?type=RESTAURANT" className="hover:text-sky-400 transition-colors">Afro-Fusion Fine Dining</Link></li>
              <li><Link href="/explore?type=TOUR" className="hover:text-sky-400 transition-colors">VIP Gorilla Habituation</Link></li>
              <li><Link href="/partner/academy" className="hover:text-sky-400 transition-colors">Hospitality Academy</Link></li>
              <li><Link href="/explore?badge=GOLD_STANDARD" className="hover:text-sky-400 transition-colors">Gold Standard Certified</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs mb-4 tracking-wider uppercase">Partner Portals</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/partner/dashboard" className="text-sky-400 hover:underline font-bold">Partner Business Portal</Link></li>
              <li><Link href="/partner/academy" className="hover:text-sky-400 transition-colors">Staff Certification</Link></li>
              <li><Link href="/partner/subscriptions" className="hover:text-sky-400 transition-colors">Membership Tiers</Link></li>
              <li><Link href="/admin/dashboard" className="text-sky-400 hover:underline font-bold">Admin QA Command Center</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Higa Lux Rwanda. All rights reserved. Registered Quality Assurance Provider.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium">In Alignment with Rwanda Development Board (RDB) Standards</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
