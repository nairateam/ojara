import { createHash } from 'node:crypto';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { haveIBeenPwned, twoFactor } from 'better-auth/plugins';
import type { Env } from '../config/env.schema.js';
import type { EmailProducer } from '../email/email.producer.js';
import type { PrismaClient } from '../generated/prisma/client.js';

export const AUTH_BASE_PATH = '/v1/auth';

/**
 * Request header carrying the client IP for rate limiting. Set by bootstrap.ts from Express req.ip
 * (TRUST_PROXY-aware), overwriting any client-supplied value.
 */
export const CLIENT_IP_HEADER = 'x-ojara-client-ip';

/**
 * The only Better Auth endpoints allowed to create a session for a PLATFORM_ADMIN. Admins must use
 * email + password followed by a second factor; Google sign-in, email-verification auto sign-in
 * and any future passwordless method are refused for them. (An admin who hasn't enrolled 2FA yet
 * gets a session from /sign-in/email, but the API refuses every admin route until they enrol.)
 */
export const ADMIN_SESSION_PATHS = new Set([
  '/sign-in/email',
  '/two-factor/verify-totp',
  '/two-factor/verify-backup-code',
]);

/** Short-hash a token so it can appear in an idempotency key without leaking the token. */
function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex').slice(0, 16);
}

/**
 * Builds the Better Auth instance.
 * - Email + password (verified email required) and, when configured, Google.
 * - Two-factor (TOTP authenticator app + backup codes); mandatory for platform admins.
 * - Passwords checked against known breaches (Have I Been Pwned; only a 5-char hash prefix leaves
 *   the server). Hashing is Better Auth's default scrypt.
 * - Rate limits stored in Postgres so they hold across API instances (and without Redis).
 * - Sessions are httpOnly cookies shared across `*.ROOT_DOMAIN`. Admin sessions are limited to
 *   ADMIN_SESSION_MAX_HOURS by the API guard (see admin-policy.ts).
 * - All auth emails go through the BullMQ `email` queue (Resend / Mailpit / log).
 * - Customers never get accounts.
 */
export function createAuth(env: Env, prisma: PrismaClient, emails: EmailProducer) {
  const isProd = env.NODE_ENV === 'production';
  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return betterAuth({
    appName: 'Ojara',
    baseURL: env.API_PUBLIC_URL,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    // transaction: password reset revokes sessions and saves the password atomically.
    database: prismaAdapter(prisma, { provider: 'postgresql', transaction: true }),
    trustedOrigins: env.CORS_ORIGINS,
    telemetry: { enabled: false },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url, token }) => {
        void emails
          .enqueue({
            template: 'password-reset',
            props: { name: user.name, resetUrl: url },
            to: user.email,
            subject: 'Reset your Ojara password',
            idempotencyKey: `reset:${user.id}:${tokenHash(token)}`,
          })
          .catch(() => undefined);
        return Promise.resolve();
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60,
      sendVerificationEmail: async ({ user, url, token }) => {
        // Enqueue only; never await delivery inside the auth request (timing attacks, latency).
        void emails
          .enqueue({
            template: 'verify-email',
            props: { name: user.name, verifyUrl: url },
            to: user.email,
            subject: 'Confirm your email for Ojara',
            idempotencyKey: `verify:${user.id}:${tokenHash(token)}`,
          })
          .catch(() => undefined);
        return Promise.resolve();
      },
    },

    ...(googleEnabled
      ? {
          socialProviders: {
            google: {
              clientId: env.GOOGLE_CLIENT_ID ?? '',
              clientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
              prompt: 'select_account' as const,
            },
          },
        }
      : {}),
    // Linking is on by default: a Google sign-in with a Google-verified email that matches an
    // existing account is attached to that account (no forced linking for unverified emails).
    account: { accountLinking: { enabled: true } },

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

    databaseHooks: {
      session: {
        create: {
          before: async (session, ctx) => {
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
              select: { role: true },
            });
            if (user?.role !== 'PLATFORM_ADMIN') return;
            const path = ctx?.path ?? '';
            // Returning false aborts sign-in: admins only get sessions via password (+2FA).
            // The 8-hour admin limit is enforced by the API guard from session.createdAt (absolute),
            // not here: Better Auth's sliding refresh would extend a shortened expiresAt anyway.
            if (!ADMIN_SESSION_PATHS.has(path)) return false;
            return undefined;
          },
        },
      },
    },

    plugins: [
      twoFactor({ issuer: 'Ojara' }),
      haveIBeenPwned({
        enabled: env.PASSWORD_BREACH_CHECK,
        customPasswordCompromisedMessage:
          'This password has appeared in a data breach. Please choose a different one.',
      }),
    ],

    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 60, max: 5 },
        '/request-password-reset': { window: 300, max: 3 },
        '/reset-password': { window: 300, max: 5 },
        '/two-factor/*': { window: 60, max: 5 },
        '/get-session': false,
      },
    },

    advanced: {
      cookiePrefix: 'ojara',
      useSecureCookies: isProd,
      crossSubDomainCookies: { enabled: true, domain: env.ROOT_DOMAIN },
      // Rate limits key on the IP that bootstrap.ts derives from the connection (see TRUST_PROXY).
      ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
      // Better Auth generates ids for its own tables; app tables use Postgres uuid v7 defaults.
    },
  });
}

export type OjaraAuth = ReturnType<typeof createAuth>;
