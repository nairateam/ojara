import { DEFAULT_ROOT_DOMAIN } from '@ojara/shared';
import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === '' ? undefined : v))
  .optional();

const csv = z
  .string()
  .default('')
  .transform((v) =>
    v
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    CORS_ORIGINS: csv,
    /**
     * Express "trust proxy": which proxies may set X-Forwarded-For. "false" when clients connect
     * directly; a hop count (e.g. "1") or IP/CIDR list behind a load balancer. Never "true" in
     * production unless every request passes through your proxy.
     */
    TRUST_PROXY: z
      .string()
      .default('false')
      .transform((v): boolean | number | string =>
        v === 'true' ? true : v === 'false' ? false : /^\d+$/.test(v) ? Number(v) : v,
      ),

    ROOT_DOMAIN: z.string().trim().min(1).default(DEFAULT_ROOT_DOMAIN),
    DASHBOARD_URL: z.url(),
    API_PUBLIC_URL: z.url(),
    INTERNAL_API_TOKEN: z.string().min(16),

    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),

    BETTER_AUTH_SECRET: z.string().min(32),
    /** Google sign-in is enabled only when both are set. */
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
    /** Reject passwords found in known breaches (Have I Been Pwned, k-anonymity). */
    PASSWORD_BREACH_CHECK: z
      .enum(['true', 'false'])
      .default('true')
      .transform((v) => v === 'true'),
    /** Absolute lifetime of a platform-admin session, in hours. */
    ADMIN_SESSION_MAX_HOURS: z.coerce.number().int().min(1).max(72).default(8),

    RESEND_API_KEY: optionalString,
    EMAIL_FROM: z.string().min(3),
    MAILPIT_API_URL: optionalString.pipe(z.url().optional()),

    CLOUDINARY_CLOUD_NAME: optionalString,
    CLOUDINARY_API_KEY: optionalString,
    CLOUDINARY_API_SECRET: optionalString,

    PAYSTACK_SECRET_KEY: optionalString,
    PAYSTACK_PUBLIC_KEY: optionalString,
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      for (const key of [
        'RESEND_API_KEY',
        'PAYSTACK_SECRET_KEY',
        'CLOUDINARY_API_SECRET',
      ] as const) {
        if (!env[key])
          ctx.addIssue({ code: 'custom', path: [key], message: 'Required in production' });
      }
    }
    if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET)) {
      ctx.addIssue({
        code: 'custom',
        path: ['GOOGLE_CLIENT_SECRET'],
        message: 'Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Loads apps/api/.env (if present) and validates process.env. Throws with every problem listed,
 * so a misconfigured deploy fails at boot instead of on first use.
 */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (source === process.env) {
    try {
      process.loadEnvFile('.env');
    } catch {
      // No .env file: rely on the real environment.
    }
  }
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
}
