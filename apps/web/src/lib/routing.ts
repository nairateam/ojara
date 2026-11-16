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

/** Request header carrying the visitor's original path + query (for "return to" after login). */
export const REQUEST_PATH_HEADER = 'x-ojara-path';

/** Better Auth session cookie (`cookiePrefix: 'ojara'`); `__Secure-` variant on HTTPS. */
export const SESSION_COOKIE_NAMES = ['ojara.session_token', '__Secure-ojara.session_token'];

/** Paths on each signed-in surface that work without a session. */
const PUBLIC_PATHS: Record<string, readonly string[]> = {
  [ROUTE_PREFIX.dashboard]: ['/login', '/signup', '/reset-password'],
  [ROUTE_PREFIX.admin]: ['/login'],
};

/**
 * Only same-site relative paths are accepted as a post-login destination ("/orders?x=1"), never
 * "//evil.com", "/\evil.com" or absolute URLs.
 */
export function safeReturnPath(value: string | null | undefined): string | undefined {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return undefined;
  }
  return value;
}

/** Login URL that returns the visitor to `returnTo` afterwards. */
export function loginPath(returnTo: string | null | undefined): string {
  const next = safeReturnPath(returnTo);
  return next && next !== '/' ? `/login?next=${encodeURIComponent(next)}` : '/login';
}

/**
 * Optimistic gate run by the proxy: a signed-in surface without any session cookie goes straight
 * to /login. Cookie presence is not proof of a session — layouts verify it with the API, and the
 * API enforces it on every call. Returns the redirect path, or null to continue.
 */
export function signedOutRedirect(
  prefix: string,
  pathname: string,
  search: string,
  hasSessionCookie: boolean,
): string | null {
  const publicPaths = PUBLIC_PATHS[prefix];
  if (!publicPaths || hasSessionCookie) return null;
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return isPublic ? null : loginPath(`${pathname}${search}`);
}

/**
 * Header values must be Latin-1, but store names often aren't ("Ọjà Èkó", emoji), so the tenant
 * travels URI-encoded. Decoding returns null for anything malformed (callers then look it up).
 */
export function encodeTenantHeader(tenant: unknown): string {
  return encodeURIComponent(JSON.stringify(tenant));
}

export function decodeTenantHeader(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(value)) as unknown;
  } catch {
    return null;
  }
}
