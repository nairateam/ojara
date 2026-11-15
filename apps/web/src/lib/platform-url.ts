import 'server-only';
import { PLATFORM_SUBDOMAINS } from '@ojara/shared';
import { headers } from 'next/headers';
import { clientEnv } from '@/env';

type Surface = 'marketing' | 'dashboard' | 'admin';

/**
 * Absolute origin of a platform surface (e.g. http://app.ojara.localhost:3000), keeping the
 * protocol and port of the current request so links work in local dev and production alike.
 */
export async function platformOrigin(surface: Surface): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  const port = /:(\d+)$/.exec(host)?.[1];
  const proto = h.get('x-forwarded-proto') ?? (clientEnv.NEXT_PUBLIC_ROOT_DOMAIN.endsWith('localhost') ? 'http' : 'https');
  const root = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN;
  const hostname =
    surface === 'marketing' ? root : `${surface === 'dashboard' ? PLATFORM_SUBDOMAINS.app : PLATFORM_SUBDOMAINS.admin}.${root}`;
  return `${proto}://${hostname}${port ? `:${port}` : ''}`;
}
