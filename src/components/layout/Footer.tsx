'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';
import { publicConfig } from '@/lib/publicConfig';
import { Text } from '@/components/ui/Text';

const SOCIAL_LINKS = [
  { icon: Facebook, href: publicConfig.social.facebook, label: 'Facebook' },
  { icon: Twitter, href: publicConfig.social.twitter, label: 'Twitter' },
  { icon: Instagram, href: publicConfig.social.instagram, label: 'Instagram' },
  { icon: Linkedin, href: publicConfig.social.linkedin, label: 'LinkedIn' },
  // Channels without a configured URL are omitted rather than rendered as
  // dead links to "#".
].filter((link) => link.href);

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-12 sm:pt-16 pb-12 text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Newsletter Banner */}
        <div className="relative mb-16 rounded-[32px] bg-gradient-to-r from-sky-600 to-sky-700 shadow-2xl shadow-sky-950/40 overflow-hidden">
          <div className="absolute -top-14 -right-14 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-14 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-12 sm:px-14 sm:py-14">
            <div className="max-w-xl space-y-4 text-center md:text-left">
              <Image
                src="/logo/higa_logo_horizontal_white.png"
                alt="Higa Lux"
                width={180}
                height={60}
                className="h-8 w-auto mx-auto md:mx-0"
              />
              <div className="space-y-3">
                <Text variant="h3" color="white" className="text-2xl sm:text-3xl leading-tight">
                  Subscribe to our newsletter for exclusive Rwandan luxury updates
                </Text>
                <Text variant="body" className="text-sky-100/80">
                  Get early access to new Gold Standard partners, seasonal rates, and Hospitality Academy openings.
                </Text>
              </div>
            </div>

            <NewsletterForm />
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">

          <div className="md:col-span-2 space-y-4">
            <Image
              src="/logo/higa_logo_horizontal_blue.png"
              alt="Higa Lux"
              width={180}
              height={60}
              className="h-9 w-auto"
            />
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-normal">
              The premier quality assurance and verified booking platform for Rwanda&apos;s luxury lodges, fine dining institutions, and bespoke safari expeditions.
            </p>
            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-sky-600" />
                <span>Kigali Innovation City, Gasabo, Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-sky-600" />
                <span>+250 788 123 456 / +250 782 000 000 (VIP Concierge)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-sky-600" />
                <span>concierge@higalux.rw</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={`Higa Lux on ${label}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-sky-600 hover:border-sky-600 hover:text-white transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-xs mb-4 tracking-wider uppercase">Destinations</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/explore?location=Kigali" className="hover:text-sky-600 transition-colors">Kigali City (Urban Luxury)</Link></li>
              <li><Link href="/explore?location=Musanze" className="hover:text-sky-600 transition-colors">Volcanoes National Park</Link></li>
              <li><Link href="/explore?location=Rubavu" className="hover:text-sky-600 transition-colors">Lake Kivu Riviera</Link></li>
              <li><Link href="/explore?location=Nyungwe" className="hover:text-sky-600 transition-colors">Nyungwe Rainforest</Link></li>
              <li><Link href="/explore?location=Akagera" className="hover:text-sky-600 transition-colors">Akagera National Park</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-xs mb-4 tracking-wider uppercase">Experiences</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/explore?type=HOTEL" className="hover:text-sky-600 transition-colors">Luxury Lodges & Hotels</Link></li>
              <li><Link href="/explore?type=RESTAURANT" className="hover:text-sky-600 transition-colors">Afro-Fusion Fine Dining</Link></li>
              <li><Link href="/explore?type=TOUR" className="hover:text-sky-600 transition-colors">VIP Gorilla Habituation</Link></li>
              <li><Link href="/partner/academy" className="hover:text-sky-600 transition-colors">Hospitality Academy</Link></li>
              <li><Link href="/explore?badge=GOLD_STANDARD" className="hover:text-sky-600 transition-colors">Gold Standard Certified</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-slate-900 font-bold text-xs mb-4 tracking-wider uppercase">Partner Portals</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/partner/dashboard" className="text-sky-600 hover:underline font-bold">Partner Business Portal</Link></li>
              <li><Link href="/partner/academy" className="hover:text-sky-600 transition-colors">Staff Certification</Link></li>
              <li><Link href="/partner/subscriptions" className="hover:text-sky-600 transition-colors">Membership Tiers</Link></li>
              <li><Link href="/admin/dashboard" className="text-sky-600 hover:underline font-bold">Admin QA Command Center</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Higa Lux Rwanda. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-sky-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-sky-600 transition-colors">Terms of Use</Link>
            <Link href="/legal" className="hover:text-sky-600 transition-colors">Legal</Link>
            <a href="/sitemap.xml" className="hover:text-sky-600 transition-colors">Site Map</a>
          </div>
        </div>

        <div className="pt-4 text-center text-[11px] text-slate-400">
          In Alignment with Rwanda Development Board (RDB) Standards
        </div>

      </div>
    </footer>
  );
}
