import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | Higa Lux Rwanda',
  description:
    'How Higa Lux Rwanda collects, uses, stores and protects personal data belonging to guests, partners and site visitors.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updatedAt="14 September 2026"
      intro="This policy explains what personal data Higa Lux Rwanda collects when you browse the platform, book a stay or list a property, why we collect it, and the choices you have. It is written to align with Rwanda's Law N° 058/2021 relating to the protection of personal data and privacy."
    >
      <LegalSection heading="Who we are">
        <p>
          Higa Lux Rwanda (&ldquo;Higa Lux&rdquo;, &ldquo;we&rdquo;) operates a quality assurance, directory and booking
          platform for accredited Rwandan hospitality businesses. We are the data controller for the personal data
          described below. Our data protection contact is{' '}
          <strong>privacy@higalux.rw</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="What we collect">
        <ul>
          <li>
            <strong>Account details</strong> — your name, email address, phone number and password (stored only as a
            bcrypt hash, never in readable form).
          </li>
          <li>
            <strong>Reservation details</strong> — the property and package booked, dates, number of guests, the contact
            details you give for the stay, and any special requests you write.
          </li>
          <li>
            <strong>Payment records</strong> — the amount, currency, the mobile money number or card gateway used, and
            the reference our payment provider returns. Full card numbers and mobile money PINs never reach our servers;
            they are handled by the payment provider.
          </li>
          <li>
            <strong>Reviews and ratings</strong> — what you write, the scores you give and the display name you choose.
          </li>
          <li>
            <strong>Anti-abuse data</strong> — when you submit a public rating or newsletter sign-up we store a salted
            SHA-256 hash of your IP address. We do not retain the address itself, and the hash cannot be reversed to
            recover it.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          We set one cookie, <strong>lux_token</strong>. It holds your signed session so you stay logged in, is marked
          HttpOnly and SameSite=Lax, is transmitted only over HTTPS in production, and expires after seven days. We do
          not use advertising or cross-site tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="Why we use it">
        <ul>
          <li>To create and secure your account, and to keep you signed in.</li>
          <li>To take reservations, collect payment and issue booking vouchers.</li>
          <li>To show a partner the bookings, guest contact details and reviews for their own listing.</li>
          <li>To run quality assurance audits and publish certification badges.</li>
          <li>To send the newsletter, if and only if you asked for it.</li>
          <li>To detect and block spam, fraud and abuse of the platform.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Who we share it with">
        <p>
          We share the minimum necessary with the hospitality partner you booked (your name and contact details, so they
          can host you), with our payment providers (MTN MoMo and Flutterwave) to process a transaction, and with our
          hosting and database providers who store the data on our behalf. We do not sell personal data, and we do not
          share it for advertising.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Account and reservation records are retained while your account is open and for as long afterwards as Rwandan
          tax and accounting rules require. Reviews remain published for as long as the listing exists. Anti-abuse IP
          hashes are retained for a rolling period and then deleted. Newsletter records are kept until you unsubscribe.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You may ask us to give you a copy of your data, correct it, delete it, or stop using it for a particular
          purpose, and you may withdraw consent to marketing at any time. Write to{' '}
          <strong>privacy@higalux.rw</strong> and we will respond within the period set by Rwandan law. You also have
          the right to lodge a complaint with the National Cyber Security Authority, Rwanda&apos;s supervisory authority
          for data protection.
        </p>
      </LegalSection>

      <LegalSection heading="Security">
        <p>
          Traffic is served over HTTPS, passwords are hashed with bcrypt, sessions are signed with a secret unique to
          each environment, and administrative functions are restricted by role. No system is perfectly secure; if a
          breach affects your data we will notify you and the supervisory authority as the law requires.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
