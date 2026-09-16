/**
 * @type {import('next').NextConfig}
 */

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production';

/**
 * Hosts next/image is allowed to optimise from.
 *
 * Production media should live on your own object storage (S3, Cloudinary,
 * Vercel Blob); set NEXT_PUBLIC_IMAGE_HOSTS to a comma-separated list of those
 * hostnames. The Unsplash hosts backing the seeded demo content are permitted
 * only while demo mode is on, so a production build cannot quietly keep
 * depending on them.
 */
const configuredHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

const demoHosts = ['images.unsplash.com', 'plus.unsplash.com'];


const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Only meaningful over HTTPS; browsers ignore it on plain HTTP.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [...configuredHosts, ...demoHosts].map((hostname) => ({ protocol: 'https', hostname })),
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Payment webhooks and authenticated JSON must never be cached by a CDN.
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },
};

export default nextConfig;
