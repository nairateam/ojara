import { z } from 'zod';
import { clientEnv } from '@/env';
import { apiRequest } from './client';

/**
 * Browser-side calls to Better Auth (under /v1/auth). They send the session cookie, which is
 * shared on *.ROOT_DOMAIN. Better Auth endpoint reference: https://better-auth.com/docs
 */
const authUserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    emailVerified: z.boolean(),
  })
  .loose();

function authPost<S extends z.ZodType>(path: `/${string}`, body: unknown, schema: S) {
  return apiRequest({
    baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
    path: `/auth${path}`,
    method: 'POST',
    body,
    credentials: 'include',
    schema,
  });
}

/**
 * Email + password sign-in. When the account has two-factor enabled, Better Auth returns
 * `twoFactorRedirect: true` instead of a session; finish with `verifyTwoFactorCode`.
 */
export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe = true,
): Promise<{ twoFactorRequired: boolean }> {
  const res = await authPost(
    '/sign-in/email',
    { email, password, rememberMe },
    z.union([
      z.object({ twoFactorRedirect: z.literal(true) }).loose(),
      z.object({ user: authUserSchema }).loose(),
    ]),
  );
  return { twoFactorRequired: 'twoFactorRedirect' in res };
}

export function signUpWithEmail(input: { name: string; email: string; password: string }) {
  return authPost(
    '/sign-up/email',
    { ...input, callbackURL: `${window.location.origin}/onboarding` },
    z.object({ user: authUserSchema }).loose(),
  );
}

/** The signed-in user (Ojara API GET /v1/session), or null when signed out. */
export async function fetchCurrentUser(): Promise<{
  id: string;
  role: 'USER' | 'PLATFORM_ADMIN';
  twoFactorEnabled: boolean;
} | null> {
  const res = await apiRequest({
    baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
    path: '/session',
    credentials: 'include',
    schema: z.object({
      user: z.object({
        id: z.string(),
        role: z.enum(['USER', 'PLATFORM_ADMIN']),
        twoFactorEnabled: z.boolean(),
      }),
    }),
  }).catch(() => null);
  return res?.user ?? null;
}

/** Second step of sign-in: a 6-digit authenticator code, or a backup code. */
export function verifyTwoFactorCode(code: string, kind: 'totp' | 'backup' = 'totp') {
  const path = kind === 'totp' ? '/two-factor/verify-totp' : '/two-factor/verify-backup-code';
  return authPost(path, { code: code.trim() }, z.object({}).loose());
}

/** Starts authenticator-app enrolment (needs the account password). */
export function enableTwoFactor(password: string) {
  return authPost(
    '/two-factor/enable',
    { password },
    z.object({ totpURI: z.string(), backupCodes: z.array(z.string()) }).loose(),
  );
}

/** Always resolves the same way whether or not the email exists (no account enumeration). */
export function requestPasswordReset(email: string, redirectTo: string) {
  return authPost('/request-password-reset', { email, redirectTo }, z.object({}).loose());
}

export function resetPassword(token: string, newPassword: string) {
  return authPost('/reset-password', { token, newPassword }, z.object({}).loose());
}

/**
 * Redirects the browser to Google. New accounts land on onboarding; existing ones on the dashboard.
 * Better Auth only accepts callback URLs on trusted origins (the API's CORS_ORIGINS).
 */
export async function continueWithGoogle(): Promise<void> {
  const origin = window.location.origin;
  const res = await authPost(
    '/sign-in/social',
    {
      provider: 'google',
      callbackURL: `${origin}/`,
      newUserCallbackURL: `${origin}/onboarding`,
      errorCallbackURL: `${origin}/login?error=google`,
    },
    z.object({ url: z.string().url() }).loose(),
  );
  window.location.assign(res.url);
}

/** Ends the session (Better Auth clears the cookie on *.ROOT_DOMAIN). */
export async function signOut(): Promise<void> {
  await authPost('/sign-out', {}, z.unknown());
}
