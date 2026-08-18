import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import ClientLayoutWrapper from './ClientLayoutWrapper';

export const metadata: Metadata = {
  title: 'Higa Lux Rwanda | Verified Luxury Hospitality, Lodges & Safari Booking',
  description: 'Rwanda\'s official quality-assured platform for booking 5-star eco-lodges, Volcanoes gorilla trekking safaris, and fine dining with 40-point inspection guarantees and instant MTN MoMo payments.',
  keywords: [
    'Rwanda Luxury Hotels',
    'Volcanoes National Park Lodges',
    'Bisate Lodge Rwanda',
    'The Retreat Kigali',
    'Gorilla Trekking Permits',
    'Rwanda Hospitality Quality Assurance',
    'Kigali Fine Dining',
    'MTN MoMo Hotel Booking Rwanda',
  ],
  openGraph: {
    title: 'Higa Lux Rwanda | Quality Assured Luxury Hospitality',
    description: 'Experience the Land of a Thousand Hills in uncompromised luxury with verified booking guarantees.',
    url: 'https://higalux.rw',
    siteName: 'Higa Lux Rwanda',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col selection:bg-sky-500 selection:text-white">
        <AuthProvider>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
