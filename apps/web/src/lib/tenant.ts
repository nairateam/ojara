import 'server-only';
import { type ResolvedTenant, resolvedTenantSchema } from '@ojara/shared';
import { headers } from 'next/headers';
import { cache } from 'react';
import { resolveTenant } from './api/server';
import { TENANT_HEADER } from './routing';

/**
 * The current storefront tenant. Read from the header the proxy sets after resolving the host
 * (no second API call); falls back to resolving `host` directly if the header is missing.
 * Never trust this header from clients: the proxy always overwrites it for storefront hosts and
 * storefront routes are only reachable through the proxy rewrite.
 */
export const getTenant = cache(async (host: string): Promise<ResolvedTenant | null> => {
  const raw = (await headers()).get(TENANT_HEADER);
  if (raw) {
    const parsed = resolvedTenantSchema.safeParse(JSON.parse(raw));
    if (parsed.success && parsed.data.hostname === host) return parsed.data;
  }
  return resolveTenant(host);
});

const HEX = /^#[0-9a-fA-F]{6}$/;

/** CSS variable overrides for the merchant brand (only well-formed hex colours are applied). */
export function tenantThemeStyle(tenant: ResolvedTenant): Record<string, string> {
  return tenant.primaryColor && HEX.test(tenant.primaryColor) ? { '--store-primary': tenant.primaryColor } : {};
}
