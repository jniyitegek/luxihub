'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { publicConfig } from '@/lib/publicConfig';
import { 
  Search, 
  ChevronDown, 
  Menu, 
  X, 
  User, 
  LogIn, 
  LogOut, 
  LayoutDashboard,
  Building2,
  UtensilsCrossed,
  Compass,
  Award,
  GraduationCap,
  HelpCircle,
  FileText,
  Check,
  ShieldCheck
} from 'lucide-react';
import { RateServiceButton } from '@/components/reviews/RateServiceButton';

interface NavbarProps {
  onOpenConcierge?: () => void;
}

export function Navbar({ onOpenConcierge }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, switchRole, logout } = useAuth();
  
  // Dropdown states
  const [browseOpen, setBrowseOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  // Search Pill Bar State
  const [searchCategory, setSearchCategory] = useState<string>('ALL');
  const [searchLocation, setSearchLocation] = useState<string>('ALL');
  const [searchSort, setSearchSort] = useState<string>('top_rated');

  const browseRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on route change or click outside
  useEffect(() => {
    setBrowseOpen(false);
    setAccountOpen(false);
    setHamburgerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)) {
        setHamburgerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth scroll handler for landing page sections
  const handleNavClick = (sectionId: string, fallbackHref?: string) => {
    if (pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(fallbackHref || `/#${sectionId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCategory !== 'ALL') params.set('type', searchCategory);
    if (searchLocation !== 'ALL') params.set('location', searchLocation);
    if (searchSort) params.set('sort', searchSort);
    router.push(`/explore?${params.toString()}`);
  };

  const isPartner = user?.role === 'SERVICE_OWNER' || (user?.role as any) === 'PARTNER';

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#FAF9F6] border-b border-slate-200/80 shadow-sm transition-all duration-300">
      
      {/* Primary Header Row — 3-Column Balanced Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* 1. LEFT: Enlarged Logo */}
          <div className="flex-1 flex items-center justify-start shrink-0">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo/higa_logo_horizontal_blue.png"
                alt="Higa Lux"
                width={210}
                height={68}
                priority
                className="h-10 sm:h-12 lg:h-14 w-auto object-contain transition-all"
              />
            </Link>
          </div>

          {/* 2. CENTER: Primary Nav Items (3 Points Centered with Balanced Spacing) */}
          <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-12 shrink-0">
            
            {/* Nav Point 1: Leaderboard Section Link */}
            <button
              type="button"
              onClick={() => handleNavClick('leaderboard', '/explore')}
              className={`text-sm font-bold tracking-wide transition-colors py-2 ${
                pathname === '/explore' ? 'text-sky-600' : 'text-slate-800 hover:text-sky-600'
              }`}
            >
              Leaderboard
            </button>

            {/* Nav Point 2: Browse Dropdown */}
            <div className="relative" ref={browseRef}>
              <button
                type="button"
                onClick={() => setBrowseOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-bold tracking-wide text-slate-800 hover:text-sky-600 transition-colors py-2"
              >
                <span>Browse</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${browseOpen ? 'rotate-180 text-sky-600' : ''}`} />
              </button>

              {browseOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200/90 z-50 animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={() => { setBrowseOpen(false); handleNavClick('destinations', '/explore?type=HOTEL'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 text-slate-800 hover:text-sky-600 text-xs font-bold transition-all text-left"
                  >
                    <Building2 className="w-4 h-4 text-sky-600" />
                    <span>Stays</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setBrowseOpen(false); handleNavClick('destinations', '/explore?type=TOUR'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 text-slate-800 hover:text-sky-600 text-xs font-bold transition-all text-left"
                  >
                    <Compass className="w-4 h-4 text-sky-600" />
                    <span>Experiences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setBrowseOpen(false); handleNavClick('destinations', '/explore?type=RESTAURANT'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 text-slate-800 hover:text-sky-600 text-xs font-bold transition-all text-left"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-sky-600" />
                    <span>Dining</span>
                  </button>
                </div>
              )}
            </div>

            {/* Nav Point 3: Why Higa Lux Section */}
            <button
              type="button"
              onClick={() => handleNavClick('why-higalux')}
              className="text-sm font-bold tracking-wide text-slate-800 hover:text-sky-600 transition-colors py-2"
            >
              Why Higa Lux
            </button>

          </nav>

          {/* 3. RIGHT: Rate a Service CTA + Static Account Icon + Hamburger Menu */}
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 shrink-0">
            
            {/* Restyled "Rate a Service" Link-Style CTA (Transparent, 2px border, ThumbsUp line icon) */}
            <div className="hidden sm:block">
              <RateServiceButton
                variant="default"
                buttonText="Rate a Service"
              />
            </div>

            {/* Static Account Icon Button (Positioned consistently regardless of login state) */}
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Account Menu"
                aria-label="Account Menu"
              >
                <User className="w-5 h-5 text-slate-700" />
              </button>

              {/* Account Dropdown */}
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-200 z-50 space-y-1 animate-in fade-in duration-150">
                  
                  {user ? (
                    <>
                      {/* Logged in User Info */}
                      <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 mb-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">{user.role}</div>
                      </div>

                      {/* Customer / Guest Options */}
                      {user.role === 'CUSTOMER' && (
                        <>
                          <Link
                            href="/customer/bookings"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                          >
                            <Building2 className="w-4 h-4 text-sky-600" />
                            <span>My Bookings</span>
                          </Link>
                          <Link
                            href="/customer/bookings"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            <span>Profile</span>
                          </Link>
                        </>
                      )}

                      {/* Service Owner / Partner Options */}
                      {isPartner && (
                        <>
                          <Link
                            href="/partner/dashboard"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-sky-600" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/partner/listings"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                          >
                            <Building2 className="w-4 h-4 text-slate-600" />
                            <span>Settings & Listings</span>
                          </Link>
                        </>
                      )}

                      {/* Admin Options — ADMIN IS ONLY SURFACED HERE */}
                      {user.role === 'ADMIN' && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-900 text-xs font-extrabold transition-all"
                          >
                            <ShieldCheck className="w-4 h-4 text-sky-600" />
                            <span>Admin Panel</span>
                          </Link>
                          <Link
                            href="/partner/dashboard"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-600" />
                            <span>Partner Dashboard</span>
                          </Link>
                        </>
                      )}

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => { logout(); setAccountOpen(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all justify-center"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/login?mode=signup"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all justify-center border border-slate-200 mt-1"
                      >
                        <span>Sign Up</span>
                      </Link>
                    </>
                  )}

                </div>
              )}
            </div>

            {/* Hamburger Menu Icon (Placed after account icon for secondary links) */}
            <div className="relative" ref={hamburgerRef}>
              <button
                type="button"
                onClick={() => setHamburgerOpen((v) => !v)}
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 flex items-center justify-center transition-all shadow-sm active:scale-95"
                title="Secondary Menu"
                aria-label="Secondary Menu"
              >
                {hamburgerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {hamburgerOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2.5 shadow-2xl border border-slate-200 z-50 space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Secondary Menu
                  </div>
                  
                  <Link
                    href="/partner/academy"
                    onClick={() => setHamburgerOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                  >
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <span>Staff Academy</span>
                  </Link>

                  <Link
                    href="/partner/subscriptions"
                    onClick={() => setHamburgerOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                  >
                    <Award className="w-4 h-4 text-sky-600" />
                    <span>Membership & Payouts</span>
                  </Link>

                  <a
                    href="mailto:support@higalux.rw"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Help & Support</span>
                  </a>

                  <Link
                    href="/terms"
                    onClick={() => setHamburgerOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Terms & Privacy</span>
                  </Link>

                  {/* Demo Account Switcher (if demo mode) */}
                  {publicConfig.demoMode && user && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Switch Demo Account
                      </div>
                      {[
                        { role: 'CUSTOMER' as const, name: 'Clarisse (Guest)' },
                        { role: 'SERVICE_OWNER' as const, name: 'Jean-Paul (Owner)' },
                        { role: 'ADMIN' as const, name: 'Dr. Vanessa (Admin)' },
                      ].map((r) => (
                        <button
                          key={r.role}
                          onClick={() => { switchRole(r.role); setHamburgerOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            user.role === r.role ? 'bg-sky-50 text-sky-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{r.name}</span>
                          {user.role === r.role && <Check className="w-3.5 h-3.5 text-sky-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Search Pill Bar (Category, Location, Sort By with consistent Chevron icons) */}
        <div className="pb-4 pt-1">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-4xl mx-auto rounded-full bg-white border border-slate-200/90 shadow-md hover:shadow-lg transition-all p-2 flex flex-col md:flex-row items-center justify-between gap-1 text-xs"
          >
            {/* Segment 1: Category (Dropdown with Chevron) */}
            <div className="w-full md:w-auto flex-1 px-4 py-2 rounded-full hover:bg-slate-50 cursor-pointer transition-colors border-b md:border-b-0 md:border-r border-slate-200/80">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Category
              </label>
              <div className="flex items-center justify-between">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer appearance-none pr-4"
                >
                  <option value="ALL">All Categories</option>
                  <option value="HOTEL">Stays</option>
                  <option value="TOUR">Experiences</option>
                  <option value="RESTAURANT">Dining</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0 -ml-3" />
              </div>
            </div>

            {/* Segment 2: Location (Dropdown with Chevron) */}
            <div className="w-full md:w-auto flex-1 px-4 py-2 rounded-full hover:bg-slate-50 cursor-pointer transition-colors border-b md:border-b-0 md:border-r border-slate-200/80">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Location
              </label>
              <div className="flex items-center justify-between">
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer appearance-none pr-4"
                >
                  <option value="ALL">Where in Rwanda?</option>
                  <option value="Kigali">Kigali City</option>
                  <option value="Musanze">Musanze / Volcanoes</option>
                  <option value="Rubavu">Rubavu / Lake Kivu</option>
                  <option value="Nyungwe">Nyungwe Rainforest</option>
                  <option value="Akagera">Akagera National Park</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0 -ml-3" />
              </div>
            </div>

            {/* Segment 3: Sort By (Replaces Dates/Guests; Dropdown with Chevron) */}
            <div className="w-full md:w-auto flex-1 px-4 py-2 rounded-full hover:bg-slate-50 cursor-pointer transition-colors">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Sort By
              </label>
              <div className="flex items-center justify-between">
                <select
                  value={searchSort}
                  onChange={(e) => setSearchSort(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-xs focus:outline-none cursor-pointer appearance-none pr-4"
                >
                  <option value="top_rated">Top Rated</option>
                  <option value="most_reviewed">Most Reviewed</option>
                  <option value="trending">Trending This Week</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none shrink-0 -ml-3" />
              </div>
            </div>

            {/* Segment 4: Circular Search Button (Accent Blue) */}
            <button
              type="submit"
              className="w-11 h-11 rounded-full bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/30 transition-transform active:scale-95 self-end md:self-auto mt-2 md:mt-0"
              title="Search Higa Lux"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </div>

      </div>
    </header>
  );
}
