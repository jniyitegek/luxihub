import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Use | Higa Lux Rwanda',
  description: 'The terms that govern bookings, partner listings, payments and cancellations on Higa Lux Rwanda.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      updatedAt="14 September 2026"
      intro="These terms govern your use of the Higa Lux Rwanda platform, whether you are booking a stay, listing a property or simply browsing the directory. By creating an account you agree to them."
    >
      <LegalSection heading="What Higa Lux does">
        <p>
          Higa Lux operates a directory, quality assurance programme and booking service for Rwandan hospitality
          businesses. When you book, the contract for the stay, meal or expedition is between you and the partner that
          provides it. Higa Lux facilitates the reservation, collects payment and holds the partner to the published
          quality standards; it does not itself provide accommodation, catering or tours.
        </p>
      </LegalSection>

      <LegalSection heading="Accounts">
        <ul>
          <li>You must be 18 or older to create an account and must give accurate details.</li>
          <li>You are responsible for keeping your password confidential and for activity under your account.</li>
          <li>Partner and administrator accounts are provisioned by Higa Lux and may not be self-registered.</li>
          <li>We may suspend an account that is used for fraud, abuse or repeated breaches of these terms.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Bookings and payment">
        <ul>
          <li>
            Prices are shown in Rwandan francs and include the platform&apos;s commission. Any local tourism levy is
            collected by the partner on arrival unless stated otherwise on the listing.
          </li>
          <li>
            A reservation is <strong>held but not confirmed</strong> until payment settles. Mobile money and card
            payments are processed by third-party gateways; a reservation is confirmed only once that gateway reports
            the payment as successful.
          </li>
          <li>
            Where a deposit option is offered, it is 30% of the total. The balance is due before arrival on the terms
            shown at checkout.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Changes and cancellations">
        <p>
          You may cancel a reservation from your bookings page until it has been completed. Whether a cancellation is
          refundable, and on what timescale, is set by the partner&apos;s policy shown on the listing at the time of
          booking. Refunds are returned through the original payment method. A partner may cancel only for good reason
          (such as a genuine unavailability or a safety issue), in which case you are refunded in full.
        </p>
      </LegalSection>

      <LegalSection heading="Reviews">
        <ul>
          <li>Verified reviews may be submitted only by the guest who completed the booking being reviewed.</li>
          <li>
            Reviews must describe your own experience. We remove content that is unlawful, abusive, discriminatory,
            includes another person&apos;s private information, or is posted in exchange for payment.
          </li>
          <li>Partners may publish one reply per review. Partners may not offer incentives for positive reviews.</li>
          <li>We do not delete a review simply because a partner dislikes it.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Partner obligations">
        <ul>
          <li>Listings must be accurate, must describe a property you are entitled to let, and must be kept current.</li>
          <li>Partners must hold the licences and insurance Rwandan law requires for their activity.</li>
          <li>
            Certification badges are awarded on the basis of an inspection score and remain the property of Higa Lux.
            They may be withdrawn if standards slip, and may not be displayed after withdrawal.
          </li>
          <li>Platform commission is deducted from the payout shown on the partner dashboard.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Liability">
        <p>
          Higa Lux is liable for its own platform and services. It is not liable for the acts or omissions of a partner,
          for events outside reasonable control, or for indirect losses. Nothing here limits liability that cannot be
          limited under Rwandan law, including liability for death or personal injury caused by negligence.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of the Republic of Rwanda, and disputes are subject to the jurisdiction
          of the courts of Kigali. We will always try to resolve a complaint directly first — write to{' '}
          <strong>concierge@higalux.rw</strong>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
