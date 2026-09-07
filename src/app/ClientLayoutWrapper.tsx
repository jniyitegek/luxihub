'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { SupportTicketModal } from '@/components/support/SupportTicketModal';

const BARE_ROUTES = ['/login'];
const DASHBOARD_PREFIXES = ['/admin', '/partner', '/customer'];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const pathname = usePathname();
  const isBare = BARE_ROUTES.includes(pathname);
  const isDashboard = DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isBare) {
    return <main className="flex-1">{children}</main>;
  }

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:pl-[260px] pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
            {children}
          </div>
        </main>
        <SupportTicketModal isOpen={conciergeOpen} onClose={() => setConciergeOpen(false)} />
      </div>
    );
  }

  return (
    <>
      <Navbar onOpenConcierge={() => setConciergeOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportTicketModal isOpen={conciergeOpen} onClose={() => setConciergeOpen(false)} />
    </>
  );
}
