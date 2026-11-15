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
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    CORS_ORIGINS: csv,

    ROOT_DOMAIN: z.string().trim().min(1).default(DEFAULT_ROOT_DOMAIN),
    DASHBOARD_URL: z.url(),
    API_PUBLIC_URL: z.url(),
    INTERNAL_API_TOKEN: z.string().min(16),

    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),

    BETTER_AUTH_SECRET: z.string().min(32),

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
      for (const key of ['RESEND_API_KEY', 'PAYSTACK_SECRET_KEY', 'CLOUDINARY_API_SECRET'] as const) {
        if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'Required in production' });
      }
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
    const details = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
}
