import { type NextRequest, NextResponse } from 'next/server';
import { clientEnv, serverEnv } from '@/env';
import { resolveTenant } from '@/lib/api/server';
import { internalPath, ROUTE_PREFIX, routeForHost, TENANT_HEADER } from '@/lib/routing';
import { TenantCache } from '@/lib/tenant-cache';

/**
 * Host-based multi-tenant routing (Next.js 16 `proxy`, formerly `middleware`; Node.js runtime).
 *
 *   ojara.localhost          -> /marketing/...
 *   app.ojara.localhost      -> /dash/...           (merchant dashboard + auth)
 *   admin.ojara.localhost    -> /admin-site/...     (platform admin)
 *   {slug}.ojara.localhost   -> /store-site/{host}/...  (storefront, tenant resolved via API)
 *   verified custom domain   -> /store-site/{host}/...
 *   anything else            -> friendly 404
 */
const tenantCache = new TenantCache(serverEnv().TENANT_CACHE_TTL_SECONDS * 1000);

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const { pathname, search } = request.nextUrl;
  const { target } = routeForHost(host, clientEnv.NEXT_PUBLIC_ROOT_DOMAIN);

  const rewriteTo = (path: string, headers?: Headers) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = search;
    return headers ? NextResponse.rewrite(url, { request: { headers } }) : NextResponse.rewrite(url);
  };

  if (target.kind === 'not-found') return rewriteTo(ROUTE_PREFIX.notFound);
  if (target.kind === 'platform') return rewriteTo(internalPath(target.prefix, pathname));

  let tenant = tenantCache.get(target.hostname);
  if (tenant === undefined) {
    try {
      tenant = await resolveTenant(target.hostname, AbortSignal.timeout(3_000));
      tenantCache.set(target.hostname, tenant);
    } catch (err) {
      console.error('[proxy] tenant resolution failed', err);
      return rewriteTo(ROUTE_PREFIX.unavailable);
    }
  }
  if (!tenant || tenant.status === 'DRAFT') return rewriteTo(ROUTE_PREFIX.notFound);

  // Pass the resolved tenant to the storefront layout so it doesn't look it up again.
  const headers = new Headers(request.headers);
  headers.set(TENANT_HEADER, JSON.stringify(tenant));
  return rewriteTo(internalPath(`${ROUTE_PREFIX.storefront}/${encodeURIComponent(tenant.hostname)}`, pathname), headers);
}

export const config = {
  // Everything except Next internals and files with an extension (public/ assets, favicon).
  matcher: ['/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)'],
};
