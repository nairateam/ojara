import 'server-only';
import { type ResolvedTenant, resolvedTenantSchema } from '@ojara/shared';
import { serverEnv } from '@/env';
import { z } from 'zod';
import { ApiRequestError, apiRequest } from './client';

const publicConfigSchema = z.object({ googleSignIn: z.boolean() }).loose();

/** Which sign-in options the API has enabled. Falls back to email-only if the API is down. */
export async function getAuthOptions(): Promise<{ googleSignIn: boolean }> {
  try {
    const config = await apiRequest({
      baseUrl: serverEnv().API_INTERNAL_URL,
      path: '/config/public',
      schema: publicConfigSchema,
      signal: AbortSignal.timeout(2_000),
    });
    return { googleSignIn: config.googleSignIn };
  } catch {
    return { googleSignIn: false };
  }
}

/** Server-to-server API calls (proxy, Server Components). Never import from client code. */
export async function resolveTenant(
  host: string,
  signal?: AbortSignal,
): Promise<ResolvedTenant | null> {
  const env = serverEnv();
  try {
    return await apiRequest({
      baseUrl: env.API_INTERNAL_URL,
      path: `/internal/tenants/resolve?host=${encodeURIComponent(host)}`,
      schema: resolvedTenantSchema,
      headers: { 'x-internal-token': env.INTERNAL_API_TOKEN },
      ...(signal ? { signal } : {}),
    });
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
}
