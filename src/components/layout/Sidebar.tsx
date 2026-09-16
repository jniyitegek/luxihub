'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { publicConfig } from '@/lib/publicConfig';
import { initialsFor } from '@/lib/initials';
import {
  Building2,
  UtensilsCrossed,
  Compass,
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Award,
  Menu,
  X,
  LogOut,
  ChevronUp
} from 'lucide-react';

const BROWSE_ITEMS = [
  { name: 'Stays', href: '/explore?type=HOTEL', icon: Building2 },
  { name: 'Experiences', href: '/explore?type=TOUR', icon: Compass },
  { name: 'Dining', href: '/explore?type=RESTAURANT', icon: UtensilsCrossed },
];

const PARTNER_NAV_ITEMS = [
  { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
  { name: 'Reservations', href: '/partner/reservations', icon: CalendarCheck },
  { name: 'Listings & Offerings', href: '/partner/listings', icon: Building2 },
  { name: 'Staff Academy', href: '/partner/academy', icon: GraduationCap },
  { name: 'Membership & Payouts', href: '/partner/subscriptions', icon: Award },
  { name: 'Directory View', href: '/explore', icon: Compass },
];

// Seeded identities behind the demo role switcher. The switcher is hidden
// unless demo mode is on, and the API refuses the call in production.
const DEMO_ACCOUNTS = [
  { role: 'CUSTOMER' as const, initials: 'CM', name: 'Clarisse Mutoni', sub: 'Verified Traveler' },
  { role: 'SERVICE_OWNER' as const, initials: 'JP', name: 'Jean-Paul (The Retreat)', sub: 'Hotel Owner' },
  { role: 'ADMIN' as const, initials: 'VU', name: 'Dr. Vanessa Uwase', sub: 'RDB Chief Inspector' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, switchRole, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [pathname]);

  const isPartner = user?.role === 'SERVICE_OWNER' || (user?.role as any) === 'PARTNER';

  const isNavActive = (itemHref: string) => {
    if (itemHref.includes('#')) {
      const [path, hash] = itemHref.split('#');
      return pathname === path && currentHash === `#${hash}`;
    }
    if (itemHref === '/partner/dashboard') {
      return pathname === '/partner/dashboard' && (!currentHash || currentHash === '#');
    }
    return pathname === itemHref;
  };

  const getPortalHref = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (isPartner) return '/partner/dashboard';
    return '/customer/bookings';
  };

  const getPortalLabel = () => {
    if (!user) return 'Login';
    if (user.role === 'ADMIN') return 'Admin Portal';
    if (isPartner) return 'Partner Portal';
    return 'My Bookings';
  };

  const isPortalActive = pathname.startsWith('/admin') || pathname.startsWith('/partner') || pathname.startsWith('/customer');

  const initials = initialsFor(user?.name);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1B36] text-white relative overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/higa_logo_horizontal_white.png"
            alt="Higa Lux"
            width={160}
            height={54}
            className="h-7 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0 scrollbar-thin">
        {isPartner ? (
          <>
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-sky-400/90">
              Service Owner Portal
            </div>
            {PARTNER_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </>
        ) : (
          <>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Browse
            </div>
            {BROWSE_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active ? 'bg-sky-500/15 text-sky-300' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Account
            </div>
            <Link
              href={getPortalHref()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isPortalActive ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>{getPortalLabel()}</span>
            </Link>
          </>
        )}
      </nav>

      {/* User Profile — pinned at bottom */}
      <div className="relative px-3 py-3 border-t border-white/10 shrink-0 bg-[#0B1B36]">
        {profileMenuOpen && user && (
          <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-[#0B1528] border border-white/15 shadow-2xl p-2 space-y-1 z-50">
            {publicConfig.demoMode && (
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                Switch Demo Account
              </div>
            )}
            {publicConfig.demoMode && DEMO_ACCOUNTS.map((r) => (
              <button
                key={r.role}
                onClick={() => { switchRole(r.role); setProfileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-all ${
                  user.role === r.role ? 'bg-sky-500/20 text-sky-200 font-bold' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-sky-500/30 text-sky-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {r.initials}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-bold text-white text-xs leading-tight">{r.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{r.sub}</div>
                </div>
              </button>
            ))}
            <div className="pt-1 border-t border-white/10">
              <button
                onClick={() => { logout(); setProfileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {user ? (
          <button
            type="button"
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-extrabold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-xs font-bold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-white/50 truncate">{user.role}</div>
            </div>
            <ChevronUp className={`w-4 h-4 text-white/40 transition-transform ${profileMenuOpen ? '' : 'rotate-180'}`} />
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B1B36] border-b border-white/10 flex items-center justify-between px-4 z-40">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/higa_logo_horizontal_white.png"
            alt="Higa Lux"
            width={140}
            height={47}
            className="h-6 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop fixed sidebar with strict container boundary */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen w-[260px] z-40 overflow-hidden bg-[#0B1B36] shadow-xl border-r border-white/10">
        {sidebarContent}
      </aside>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[80vw] h-full animate-in slide-in-from-left duration-200 overflow-hidden bg-[#0B1B36]">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
