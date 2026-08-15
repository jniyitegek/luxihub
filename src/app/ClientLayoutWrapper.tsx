'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SupportTicketModal } from '@/components/support/SupportTicketModal';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [conciergeOpen, setConciergeOpen] = useState(false);

  return (
    <>
      <Navbar onOpenConcierge={() => setConciergeOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportTicketModal isOpen={conciergeOpen} onClose={() => setConciergeOpen(false)} />
    </>
  );
}
