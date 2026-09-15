import { z } from 'zod';

/**
 * Server-side environment contract.
 *
 * Everything the server needs is declared here and validated once, at module
 * load, so a misconfigured deployment fails immediately and loudly instead of
 * silently falling back to an insecure default at request time.
 */

/**
 * The deployment environment, which is not the same thing as NODE_ENV.
 * `next build` runs with NODE_ENV=production even when you are only smoke
 * testing locally, so the security posture is keyed off NEXT_PUBLIC_APP_ENV
 * instead. It defaults to NODE_ENV, which means it fails closed: a deployment
 * that sets nothing is treated as production.
 */
const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production') as
  | 'development'
  | 'staging'
  | 'production';

const isProduction = appEnv === 'production';

const secret = (label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .min(32, `${label} must be at least 32 characters. Generate one with: openssl rand -base64 48`);

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const gatewayChoice = z.enum(['mtn_momo', 'flutterwave', 'manual']).default('manual');

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default(appEnv),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    JWT_SECRET: secret('JWT_SECRET'),
    RATING_IP_SALT: isProduction ? secret('RATING_IP_SALT') : z.string().default('higa-lux-local-rating-salt'),

    NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be an absolute URL').default('http://localhost:3000'),
    NEXT_PUBLIC_DEMO_MODE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),

    PAYMENTS_MOMO_PROVIDER: gatewayChoice,
    PAYMENTS_CARD_PROVIDER: gatewayChoice,

    MTN_MOMO_BASE_URL: z.string().url().default('https://sandbox.momodeveloper.mtn.com'),
    MTN_MOMO_SUBSCRIPTION_KEY: optionalString,
    MTN_MOMO_API_USER: optionalString,
    MTN_MOMO_API_KEY: optionalString,
    MTN_MOMO_TARGET_ENVIRONMENT: z.string().default('sandbox'),
    MTN_MOMO_CALLBACK_SECRET: optionalString,

    FLUTTERWAVE_BASE_URL: z.string().url().default('https://api.flutterwave.com/v3'),
    FLUTTERWAVE_SECRET_KEY: optionalString,
    FLUTTERWAVE_WEBHOOK_HASH: optionalString,
  })
  .superRefine((value, ctx) => {
    // Demo shortcuts (seeded logins, quick-fill, role switching) must never be
    // reachable on a production deployment, even if the flag is left on.
    if (value.NEXT_PUBLIC_APP_ENV === 'production' && value.NEXT_PUBLIC_DEMO_MODE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['NEXT_PUBLIC_DEMO_MODE'],
        message: 'NEXT_PUBLIC_DEMO_MODE must be "false" when NEXT_PUBLIC_APP_ENV=production',
      });
    }

    const requireAll = (provider: string, keys: Array<keyof typeof value>) => {
      const missing = keys.filter((k) => !value[k]);
      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [missing[0] as string],
          message: `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required when a payment rail is set to "${provider}"`,
        });
      }
    };

    const rails = [value.PAYMENTS_MOMO_PROVIDER, value.PAYMENTS_CARD_PROVIDER];

    if (rails.includes('mtn_momo')) {
      requireAll('mtn_momo', ['MTN_MOMO_SUBSCRIPTION_KEY', 'MTN_MOMO_API_USER', 'MTN_MOMO_API_KEY']);
    }
    if (rails.includes('flutterwave')) {
      requireAll('flutterwave', ['FLUTTERWAVE_SECRET_KEY', 'FLUTTERWAVE_WEBHOOK_HASH']);
    }
  });

function load() {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `  • ${i.path.join('.') || 'env'}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${details}\n\nSee .env.example for the full contract.`);
  }

  return parsed.data;
}

export const env = load();

export const isProd = env.NEXT_PUBLIC_APP_ENV === 'production';

/** Demo logins, quick-fill and role switching. Never true in production. */
export const demoModeEnabled = env.NEXT_PUBLIC_DEMO_MODE && !isProd;
