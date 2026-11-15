import { createHash } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { Env } from '../config/env.schema.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import type { EmailProducer } from '../email/email.producer.js';

export const AUTH_BASE_PATH = '/v1/auth';

/**
 * Builds the Better Auth instance.
 * - Email + password for merchants, staff and admins; email must be verified before sign-in.
 * - Sessions are httpOnly cookies shared across `*.ROOT_DOMAIN` (app., admin., api.).
 * - Verification emails go through the BullMQ `email` queue (Resend / Mailpit / log).
 * - Customers never get accounts.
 */
export function createAuth(env: Env, prisma: PrismaClient, emails: EmailProducer) {
  const isProd = env.NODE_ENV === 'production';
  return betterAuth({
    appName: 'Ojara',
    baseURL: env.API_PUBLIC_URL,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    trustedOrigins: env.CORS_ORIGINS,
    telemetry: { enabled: false },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60,
      sendVerificationEmail: async ({ user, url, token }) => {
        // Enqueue only; never await delivery inside the auth request (timing attacks, latency).
        const tokenHash = createHash('sha256').update(token).digest('hex').slice(0, 16);
        void emails
          .enqueue({
            template: 'verify-email',
            props: { name: user.name, verifyUrl: url },
            to: user.email,
            subject: 'Confirm your email for Ojara',
            idempotencyKey: `verify:${user.id}:${tokenHash}`,
          })
          .catch(() => undefined);
        return Promise.resolve();
      },
    },
    user: {
      additionalFields: {
        role: {
          type: ['USER', 'PLATFORM_ADMIN'],
          required: false,
          defaultValue: 'USER',
          input: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    advanced: {
      cookiePrefix: 'ojara',
      useSecureCookies: isProd,
      crossSubDomainCookies: { enabled: true, domain: env.ROOT_DOMAIN },
      // Better Auth generates ids for its own tables; app tables use Postgres uuid v7 defaults.
    },
    rateLimit: { enabled: isProd },
  });
}

export type OjaraAuth = ReturnType<typeof createAuth>;
