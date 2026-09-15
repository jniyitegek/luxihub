import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Legal & Compliance | Higa Lux Rwanda',
  description: 'Company information, regulatory alignment and compliance contacts for Higa Lux Rwanda.',
};

export default function LegalPageRoute() {
  return (
    <LegalPage
      title="Legal & Compliance"
      updatedAt="14 September 2026"
      intro="Company information, the standards the platform is built against, and where to direct a formal notice."
    >
      <LegalSection heading="Company details">
        <ul>
          <li>
            <strong>Trading name:</strong> Higa Lux Rwanda
          </li>
          <li>
            <strong>Registered office:</strong> Kigali Innovation City, Gasabo District, Kigali, Rwanda
          </li>
          <li>
            <strong>General contact:</strong> concierge@higalux.rw &middot; +250 788 123 456
          </li>
          <li>
            <strong>Legal notices:</strong> legal@higalux.rw
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Regulatory alignment">
        <p>
          The Higa Lux quality assurance programme is designed around Rwanda Development Board hospitality standards.
          Personal data is handled in line with Law N° 058/2021 relating to the protection of personal data and privacy.
          Payment collection is carried out through licensed payment service providers; Higa Lux does not store card
          numbers or mobile money credentials.
        </p>
      </LegalSection>

      <LegalSection heading="Certification marks">
        <p>
          <strong>Luxe Verified</strong>, <strong>Gold Standard</strong> and <strong>Eco Sustainable</strong> are
          certification marks issued by Higa Lux on the basis of an inspection score. They remain the property of Higa
          Lux, are licensed to a partner only while the certification is current, and may not be reproduced by a
          business that has not been awarded them.
        </p>
      </LegalSection>

      <LegalSection heading="Reporting a concern">
        <p>
          To report inaccurate listing information, a safety concern at a certified property, a suspected fraudulent
          booking or an intellectual property infringement, write to <strong>legal@higalux.rw</strong> with the listing
          name, the date and what you observed. Quality assurance concerns are routed to the audit team and investigated
          against the published inspection checklist.
        </p>
      </LegalSection>

      <LegalSection heading="Related pages">
        <ul>
          <li>
            <Link href="/privacy" className="font-bold text-sky-700 hover:underline">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="font-bold text-sky-700 hover:underline">
              Terms of Use
            </Link>
          </li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
