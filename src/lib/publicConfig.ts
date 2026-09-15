/**
 * Configuration that is safe to read in the browser.
 *
 * `process.env.NEXT_PUBLIC_*` is inlined at build time only when referenced as
 * a literal member expression, so each value is spelled out in full below.
 */

const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production';

export const publicConfig = {
  appEnv,
  isProduction: appEnv === 'production',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * Seeded demo logins, the login quick-fill buttons and the role switcher.
   * The server enforces this independently — this flag only hides the UI.
   */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && appEnv !== 'production',

  social: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || '',
  },
} as const;
