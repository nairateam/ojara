import 'server-only';
import { type ResolvedTenant, resolvedTenantSchema } from '@ojara/shared';
import { serverEnv } from '@/env';
import { ApiRequestError, apiRequest } from './client';

/** Server-to-server API calls (proxy, Server Components). Never import from client code. */
export async function resolveTenant(host: string, signal?: AbortSignal): Promise<ResolvedTenant | null> {
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
