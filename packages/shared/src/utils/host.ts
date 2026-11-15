import { PLATFORM_SUBDOMAINS } from '../constants/domains.js';

export type HostClassification =
  | { kind: 'marketing' }
  | { kind: 'dashboard' }
  | { kind: 'admin' }
  | { kind: 'api' }
  | { kind: 'store-subdomain'; slug: string }
  | { kind: 'custom-domain'; hostname: string }
  | { kind: 'invalid' };

/** Lower-cases a Host header value and strips the port and any trailing dot. */
export function normalizeHost(host: string): string {
  const withoutPort = host.trim().toLowerCase().replace(/:\d+$/, '');
  return withoutPort.endsWith('.') ? withoutPort.slice(0, -1) : withoutPort;
}

/**
 * Classifies a request host against the platform root domain.
 * `ojara.localhost` -> marketing, `app.` -> dashboard, `admin.` -> admin, `{slug}.` -> store,
 * anything outside the root domain -> custom domain (must be verified by the API).
 */
export function classifyHost(rawHost: string, rootDomain: string): HostClassification {
  const host = normalizeHost(rawHost);
  const root = normalizeHost(rootDomain);
  if (!host || host.length > 253) return { kind: 'invalid' };

  if (host === root || host === `${PLATFORM_SUBDOMAINS.www}.${root}`) return { kind: 'marketing' };

  const suffix = `.${root}`;
  if (host.endsWith(suffix)) {
    const sub = host.slice(0, -suffix.length);
    if (!sub || sub.includes('.')) return { kind: 'invalid' };
    if (sub === PLATFORM_SUBDOMAINS.app) return { kind: 'dashboard' };
    if (sub === PLATFORM_SUBDOMAINS.admin) return { kind: 'admin' };
    if (sub === PLATFORM_SUBDOMAINS.api) return { kind: 'api' };
    return { kind: 'store-subdomain', slug: sub };
  }

  if (!/^[a-z0-9.-]+$/.test(host) || !host.includes('.')) return { kind: 'invalid' };
  return { kind: 'custom-domain', hostname: host };
}
