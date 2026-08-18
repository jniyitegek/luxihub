'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  ChevronDown, 
  Menu, 
  X, 
  MapPin,
  Star,
  ArrowRight,
  Building2,
  UtensilsCrossed,
  Compass,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onOpenConcierge?: () => void;
}

const megaMenuData: Record<string, { title: string; description: string; links: { name: string; href: string; desc: string }[]; image: string; imageAlt: string }> = {
  Stays: {
    title: 'Luxury Stays',
    description: 'RDB-certified 5-star eco-lodges across Rwanda\'s most breathtaking landscapes.',
    links: [
      { name: 'Volcanoes Lodges', href: '/explore?type=HOTEL&location=Musanze', desc: 'Private villas near gorilla territory' },
      { name: 'Lake Kivu Retreats', href: '/explore?type=HOTEL&location=Rubavu', desc: 'Lakefront serenity & wellness spas' },
      { name: 'Kigali City Hotels', href: '/explore?type=HOTEL&location=Kigali', desc: 'Urban luxury in the cleanest city' },
      { name: 'Nyungwe Forest Camps', href: '/explore?type=HOTEL&location=Nyungwe', desc: 'Canopy walks & primate treks' },
    ],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Luxury Rwanda Lodge',
  },
  Experiences: {
    title: 'Safari & Adventures',
    description: 'Once-in-a-lifetime gorilla treks, helicopter safaris, and curated wildlife tours.',
    links: [
      { name: 'Gorilla Trekking', href: '/explore?type=TOUR', desc: 'Face-to-face with mountain gorillas' },
      { name: 'Akagera Big Five Safari', href: '/explore?type=TOUR&location=Akagera', desc: 'Lions, elephants & rhinos' },
      { name: 'Helicopter Safaris', href: '/explore?type=TOUR', desc: 'Aerial views of the volcanoes' },
      { name: 'Cultural Heritage Tours', href: '/explore?type=TOUR', desc: 'Rwanda\'s rich traditions' },
    ],
    image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Gorilla Trekking Rwanda',
  },
  Dining: {
    title: 'Fine Dining',
    description: 'Award-winning restaurants and world-class Rwandan cuisine.',
    links: [
      { name: 'Kigali Restaurants', href: '/explore?type=RESTAURANT&location=Kigali', desc: 'Farm-to-table excellence' },
      { name: 'Lodge Dining', href: '/explore?type=RESTAURANT', desc: 'Private chef experiences' },
      { name: 'Coffee & Tea Tastings', href: '/explore?type=RESTAURANT', desc: 'Specialty Rwandan brews' },
      { name: 'Wine & Sommelier', href: '/explore?type=RESTAURANT', desc: 'Curated cellar selections' },
    ],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Fine Dining Rwanda',
  },
};

export function Navbar({ onOpenConcierge }: NavbarProps) {
  const pathname = usePathname();
  const { user, switchRole, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu on route change
  useEffect(() => {
    setActiveMega(null);
    setMobileMenuOpen(false);
    setRoleMenuOpen(false);
  }, [pathname]);

  const handleMegaEnter = (name: string) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setActiveMega(name);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setActiveMega(null), 150);
  };

  const navItems = ['Stays', 'Experiences', 'Dining'];

  // Dashboard link depending on user role
  const getDashboardHref = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'PARTNER') return '/partner/dashboard';
    return '/customer/bookings';
  };

  const getDashboardLabel = () => {
    if (!user) return 'Login';
    if (user.role === 'ADMIN') return 'RDB Admin Portal';
    if (user.role === 'PARTNER') return 'Partner Dashboard';
    return 'My Bookings';
  };

  // Background: fully transparent on homepage at top, sky blue accent on scroll. Dark navy for other pages. Never white.
  const headerBg = isHomePage
    ? scrolled
      ? 'bg-sky-700/95 backdrop-blur-2xl border-b border-white/15 shadow-2xl shadow-sky-900/40'
      : 'bg-transparent border-b border-transparent'
    : scrolled
      ? 'bg-[#0B1B36]/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-slate-950/40'
      : 'bg-[#0B1B36] border-b border-white/10';

  return (
    <>
      {/* Fixed header overlaying the hero */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg} ${scrolled ? 'py-3' : 'py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between flex-nowrap">

            {/* FAR LEFT: Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/logo/higa_logo_horizontal_white.png"
                alt="Higa Lux"
                width={168}
                height={56}
                priority
                className="h-7 sm:h-8 lg:h-24 w-auto"
              />
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </Link>

            {/* CENTER: Minimal nav items with mega menu on hover */}
            <nav className="hidden lg:flex items-center gap-12 xl:gap-16">
              {navItems.map((item) => (
                <div
                  key={item}
                  className="relative"
                  onMouseEnter={() => handleMegaEnter(item)}
                  onMouseLeave={handleMegaLeave}
                >
                  <Link
                    href={`/explore?type=${item === 'Stays' ? 'HOTEL' : item === 'Dining' ? 'RESTAURANT' : 'TOUR'}`}
                    className={`text-[13px] uppercase tracking-[0.2em] font-bold transition-all duration-200 py-2 flex items-center gap-1.5 group ${
                      activeMega === item ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>{item}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeMega === item ? 'rotate-180 text-sky-400' : 'text-white/40'}`} />
                  </Link>
                </div>
              ))}

              {/* Role-based minimal link */}
              {user && (
                <Link 
                  href={getDashboardHref()} 
                  className="text-[13px] uppercase tracking-[0.2em] font-bold text-sky-400/90 hover:text-sky-300 transition-colors py-2 flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{user.role === 'ADMIN' ? 'Admin' : user.role === 'PARTNER' ? 'Portal' : 'Bookings'}</span>
                </Link>
              )}
            </nav>

            {/* FAR RIGHT: Login Button + User Switcher/Account + Search Icon */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              
              {/* Account Dropdown or Login Button */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs font-bold text-white/90 transition-all shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                      {user.role === 'ADMIN' ? 'VU' : user.role === 'PARTNER' ? 'JP' : 'CM'}
                    </div>
                    <span className="max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="w-3 h-3 text-white/40" />
                  </button>
                ) : (
                  <Link href="/login">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95">
                      <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Sign In</span>
                    </button>
                  </Link>
                )}

                {/* Account & Profile Menu Dropdown */}
                {roleMenuOpen && user && (
                  <div
                    className="absolute right-0 mt-3 w-80 rounded-3xl bg-[#0B1528] p-3 shadow-2xl border border-white/15 z-[60] space-y-2 animate-in fade-in duration-200"
                    onMouseLeave={() => setRoleMenuOpen(false)}
                  >
                    {/* Logged User Info */}
                    <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span className="truncate">{user.name}</span>
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>

                    {/* Management Dashboard Quick Link */}
                    <Link
                      href={getDashboardHref()}
                      onClick={() => setRoleMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-bold transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sky-400" />
                      <div className="flex-1 text-left">
                        <div>Go to {getDashboardLabel()}</div>
                        <div className="text-[10px] text-sky-300/70 font-normal">Manage settings & audits</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sky-400" />
                    </Link>

                    {/* Switch Profile Section */}
                    <div className="pt-2">
                      <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase">Switch Demo Account</div>
                      {[
                        { role: 'CUSTOMER' as const, initials: 'CM', name: 'Clarisse Mutoni', sub: 'Verified Traveler', color: 'sky' },
                        { role: 'PARTNER' as const, initials: 'JP', name: 'Jean-Paul (The Retreat)', sub: 'Hotel Owner', color: 'emerald' },
                        { role: 'ADMIN' as const, initials: 'VU', name: 'Dr. Vanessa Uwase', sub: 'RDB Chief Inspector', color: 'amber' },
                      ].map((r) => (
                        <button
                          key={r.role}
                          onClick={() => { switchRole(r.role); setRoleMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left text-xs transition-all ${
                            user?.role === r.role ? `bg-${r.color}-500/20 text-${r.color}-200 font-bold border border-${r.color}-400/40` : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-${r.color}-500/30 text-${r.color}-300 flex items-center justify-center font-bold text-[10px]`}>{r.initials}</div>
                          <div className="flex-1 truncate">
                            <div className="font-bold text-white text-xs leading-tight">{r.name}</div>
                            <div className="text-[10px] text-slate-400 leading-tight">{r.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Logout Option */}
                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={() => { logout(); setRoleMenuOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/20 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Icon */}
              <Link
                href="/explore"
                className="p-2.5 text-white/60 hover:text-white rounded-full hover:bg-white/[0.08] transition-colors"
                title="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* MEGA NAV DROPDOWN: Half-page panel with images */}
        {activeMega && megaMenuData[activeMega] && (
          <div
            className="absolute top-full left-0 right-0 bg-[#09152A]/[0.97] backdrop-blur-2xl border-t border-white/[0.06] animate-in fade-in slide-in-from-top-1 duration-200"
            onMouseEnter={() => handleMegaEnter(activeMega)}
            onMouseLeave={handleMegaLeave}
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
              <div className="grid grid-cols-12 gap-10">

                {/* Left: Category Info & Links */}
                <div className="col-span-5 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">
                      {megaMenuData[activeMega].title}
                    </h3>
                    <p className="text-sm text-white/50 font-normal leading-relaxed max-w-md">
                      {megaMenuData[activeMega].description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    {megaMenuData[activeMega].links.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="group flex items-start gap-3 px-4 py-3 rounded-2xl hover:bg-white/[0.06] transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-sky-400 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                            {link.name}
                          </div>
                          <div className="text-xs text-white/40 font-normal">
                            {link.desc}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-sky-400 hover:text-sky-300 transition-colors pt-2"
                  >
                    <span>View All {megaMenuData[activeMega].title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Right: Featured Image */}
                <div className="col-span-7 relative h-[320px] rounded-3xl overflow-hidden group">
                  <Image
                    src={megaMenuData[activeMega].image}
                    alt={megaMenuData[activeMega].imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09152A]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white/90">RDB Quality Verified</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white/90">4.9 Rating</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to push content below the fixed navbar (taller on lg+ to match the larger desktop logo) */}
      <div className={`${isHomePage ? '' : (scrolled ? 'h-[60px] lg:h-[120px]' : 'h-[76px] lg:h-[136px]')} transition-all duration-500`} />

      {/* MOBILE: Full-screen dark overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#09152A]/[0.98] backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">

          {/* Top: Logo + Close */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <Image
                src="/logo/higa_logo_horizontal_white.png"
                alt="Higa Lux"
                width={168}
                height={56}
                className="h-8 w-auto"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-white/50 hover:text-white rounded-full bg-white/[0.08] border border-white/[0.1]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Full-screen nav links */}
          <nav className="flex-1 flex flex-col justify-center gap-5 px-8 py-10">
            {navItems.map((item) => (
              <Link
                key={item}
                href={`/explore?type=${item === 'Stays' ? 'HOTEL' : item === 'Dining' ? 'RESTAURANT' : 'TOUR'}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl uppercase tracking-[0.2em] font-extrabold text-white/80 hover:text-sky-400 transition-colors"
              >
                {item}
              </Link>
            ))}
            
            <Link
              href={getDashboardHref()}
              onClick={() => setMobileMenuOpen(false)}
              className="text-3xl uppercase tracking-[0.2em] font-extrabold text-sky-400/90 hover:text-sky-300 transition-colors flex items-center gap-3"
            >
              <LayoutDashboard className="w-7 h-7" />
              <span>{getDashboardLabel()}</span>
            </Link>
          </nav>

          {/* Bottom: CTA & Role Switcher */}
          <div className="px-6 py-6 border-t border-white/10 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth className="font-extrabold">
                  Sign In
                </Button>
              </Link>
              <Link href="/explore" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth className="bg-white/[0.06] border-white/[0.15] text-white">
                  Explore
                </Button>
              </Link>
            </div>

            {user && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span className="truncate">Logged in as {user.name}</span>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-rose-400 font-bold hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
