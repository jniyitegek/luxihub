import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Authenticated surfaces carry no public value and can expose guest data
      // in a crawler's cache if indexed.
      disallow: ['/api/', '/admin/', '/partner/', '/customer/', '/login'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
