import 'server-only';
import type { ResolvedTenant, StorefrontStoreDto } from '@ojara/shared';
import { notFound } from 'next/navigation';
import { getStorefront } from '@/lib/api/storefront';
import { getTenant } from '@/lib/tenant';

export type HostParams = Promise<{ host: string }>;

/** Resolves the storefront tenant for a page (cached per request; the layout already checked status). */
export async function getStore(params: HostParams): Promise<ResolvedTenant> {
  const tenant = await getTenant(decodeURIComponent((await params).host));
  if (!tenant) notFound();
  return tenant;
}

/** Tenant plus the store's public details and menu (one API call per request, shared). */
export async function getShop(
  params: HostParams,
): Promise<{ tenant: ResolvedTenant; store: StorefrontStoreDto }> {
  const tenant = await getStore(params);
  return { tenant, store: await getStorefront(tenant.storeId) };
}

/** "+2348035550144" -> wa.me link and "+234 803 555 0144"; null without a number. */
export function whatsappLink(
  number: string | null,
  text?: string,
): { href: string; label: string } | null {
  if (!number) return null;
  const digits = number.replace(/\D/g, '');
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(number);
  return {
    href: `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
    label: m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : number,
  };
}

/** Online checkout needs a linked payout account and at least one way to get the order. */
export function canCheckout(store: StorefrontStoreDto): boolean {
  return (
    store.acceptsPayments && (store.delivery.zones.length > 0 || store.delivery.pickup !== null)
  );
}
