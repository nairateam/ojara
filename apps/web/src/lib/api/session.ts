import 'server-only';
import {
  type SessionUserDto,
  sessionResponseSchema,
  storeMembershipSchema,
  storeSummarySchema,
} from '@ojara/shared';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { z } from 'zod';
import { serverEnv } from '@/env';
import { ApiRequestError, apiRequest } from './client';

/**
 * Signed-in API calls made by Server Components on the browser's behalf. The browser's cookies
 * are forwarded, plus its IP (trusted by the API only alongside the internal token) so rate limits
 * apply per visitor rather than to the web server as a whole. Each call is memoised per request
 * with React `cache`, so layouts and pages can both ask without extra round trips.
 */

/** Rightmost X-Forwarded-For entry: the address the nearest hop (Next itself or our LB) saw. */
function clientIp(h: Headers): string {
  const xff = h.get('x-forwarded-for');
  const last = xff?.split(',').at(-1)?.trim();
  return last || h.get('x-real-ip') || 'unknown';
}

async function forwardedHeaders(): Promise<Record<string, string>> {
  const [c, h] = await Promise.all([cookies(), headers()]);
  return {
    cookie: c.toString(),
    'x-internal-token': serverEnv().INTERNAL_API_TOKEN,
    'x-ojara-forwarded-for': clientIp(h),
  };
}

async function signedInRequest<S extends z.ZodType>(
  path: `/${string}`,
  schema: S,
  write?: { method: 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown },
) {
  return apiRequest({
    baseUrl: serverEnv().API_INTERNAL_URL,
    path,
    schema,
    headers: await forwardedHeaders(),
    signal: AbortSignal.timeout(write ? 10_000 : 5_000),
    ...(write ? { method: write.method, body: write.body ?? {} } : {}),
  });
}

/**
 * Signed-in write from a Server Action (never memoised). The API authorises it from the
 * forwarded session cookie, so callers pass only what changes, never who may change it.
 */
export function apiWrite<S extends z.ZodType>(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: `/${string}`,
  schema: S,
  body?: unknown,
) {
  return signedInRequest(path, schema, { method, body });
}

/** The signed-in user, or null when there is no valid session. Other failures throw. */
export const getSessionUser = cache(async (): Promise<SessionUserDto | null> => {
  try {
    return (await signedInRequest('/session', sessionResponseSchema)).user;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return null;
    throw err;
  }
});

export const getMyStores = cache(() => signedInRequest('/stores', z.array(storeMembershipSchema)));

export const getStoreSummary = cache((storeId: string) =>
  signedInRequest(`/stores/${encodeURIComponent(storeId)}/summary`, storeSummarySchema),
);

export type AdminAccess =
  | { status: 'ok'; user: { id: string; name: string; email: string } }
  | { status: 'signed-out' | 'expired' | 'two-factor-required' | 'forbidden' };

const adminSessionSchema = z.object({
  user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
});

/** Whether the caller may use the admin console (API: PLATFORM_ADMIN + 2FA + fresh session). */
export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  try {
    const { user } = await signedInRequest('/admin/session', adminSessionSchema);
    return { status: 'ok', user };
  } catch (err) {
    if (!(err instanceof ApiRequestError)) throw err;
    if (err.code === 'TWO_FACTOR_REQUIRED') return { status: 'two-factor-required' };
    if (err.code === 'ADMIN_SESSION_EXPIRED') return { status: 'expired' };
    if (err.status === 401) return { status: 'signed-out' };
    if (err.status === 403) return { status: 'forbidden' };
    throw err;
  }
});

/** Signed-in read for feature data (not memoised: pass what the page needs). */
export function apiGet<S extends z.ZodType>(path: `/${string}`, schema: S) {
  return signedInRequest(path, schema);
}

/**
 * Server-to-server read that doesn't act as anyone (no cookies): storefront data for shoppers.
 * Still forwards the shopper's IP so rate limits apply per visitor.
 */
export async function apiPublicGet<S extends z.ZodType>(path: `/${string}`, schema: S) {
  const h = await headers();
  return apiRequest({
    baseUrl: serverEnv().API_INTERNAL_URL,
    path,
    schema,
    headers: {
      'x-internal-token': serverEnv().INTERNAL_API_TOKEN,
      'x-ojara-forwarded-for': clientIp(h),
    },
    signal: AbortSignal.timeout(5_000),
  });
}

/** Server-to-server write for shoppers (no cookies), e.g. checkout. Forwards the shopper's IP. */
export async function apiPublicPost<S extends z.ZodType>(
  path: `/${string}`,
  schema: S,
  body: unknown,
) {
  const h = await headers();
  return apiRequest({
    baseUrl: serverEnv().API_INTERNAL_URL,
    path,
    schema,
    method: 'POST',
    body,
    headers: {
      'x-internal-token': serverEnv().INTERNAL_API_TOKEN,
      'x-ojara-forwarded-for': clientIp(h),
    },
    signal: AbortSignal.timeout(20_000),
  });
}
