import { classifyHost, type HostClassification } from '@ojara/shared';

/**
 * Internal path prefixes the proxy rewrites each host to. Every request is rewritten, so these
 * prefixes are never reachable directly from outside (e.g. ojara.localhost/dash -> /marketing/dash
 * -> 404).
 */
export const ROUTE_PREFIX = {
  marketing: '/marketing',
  dashboard: '/dash',
  admin: '/admin-site',
  storefront: '/store-site',
  notFound: '/not-found-host',
  unavailable: '/service-unavailable',
} as const;

/** Request header carrying the resolved tenant (JSON) from the proxy to the storefront layout. */
export const TENANT_HEADER = 'x-ojara-tenant';

export type RouteTarget =
  | { kind: 'platform'; prefix: string }
  | { kind: 'storefront'; hostname: string }
  | { kind: 'not-found' };

/** Pure host -> route decision (tenant lookup happens afterwards for storefront hosts). */
export function routeForHost(
  host: string,
  rootDomain: string,
): { target: RouteTarget; host: HostClassification } {
  const c = classifyHost(host, rootDomain);
  switch (c.kind) {
    case 'marketing':
      return { target: { kind: 'platform', prefix: ROUTE_PREFIX.marketing }, host: c };
    case 'dashboard':
      return { target: { kind: 'platform', prefix: ROUTE_PREFIX.dashboard }, host: c };
    case 'admin':
      return { target: { kind: 'platform', prefix: ROUTE_PREFIX.admin }, host: c };
    case 'store-subdomain':
      return { target: { kind: 'storefront', hostname: `${c.slug}.${rootDomain}` }, host: c };
    case 'custom-domain':
      return { target: { kind: 'storefront', hostname: c.hostname }, host: c };
    default:
      // api.* is served by the API itself, never by the web app.
      return { target: { kind: 'not-found' }, host: c };
  }
}

/** Builds the internal path, keeping the visitor's path and avoiding a trailing "/" duplicate. */
export function internalPath(prefix: string, pathname: string): string {
  return pathname === '/' ? prefix : `${prefix}${pathname}`;
}
