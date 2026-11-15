import 'server-only';
import type { ResolvedTenant } from '@ojara/shared';
import { notFound } from 'next/navigation';
import { getTenant } from '@/lib/tenant';

export type HostParams = Promise<{ host: string }>;

/** Resolves the storefront tenant for a page (cached per request; the layout already checked status). */
export async function getStore(params: HostParams): Promise<ResolvedTenant> {
  const tenant = await getTenant(decodeURIComponent((await params).host));
  if (!tenant) notFound();
  return tenant;
}
