import 'server-only';
import { formatKobo, type StorefrontOrderDto } from '@ojara/shared';
import { notFound } from 'next/navigation';
import { getShop, type HostParams, whatsappLink } from '@/components/storefront/store';
import { getStorefrontOrder } from '@/lib/api/storefront';

export type ReferenceSearchParams = Promise<{ reference?: string | string[] }>;

/** The order behind `?reference=` (Paystack's return URL), or a 404. */
export async function loadOrder(params: HostParams, searchParams: ReferenceSearchParams) {
  const { reference } = await searchParams;
  if (typeof reference !== 'string' || !/^[\w-]{1,64}$/.test(reference)) notFound();
  const { tenant, store } = await getShop(params);
  const order = await getStorefrontOrder(tenant.storeId, reference);
  if (!order) notFound();
  const whatsappHref =
    whatsappLink(store.whatsappNumber, `Hi, about my order #${order.number}`)?.href ?? null;
  return { store, order, whatsappHref };
}

export function firstName(order: StorefrontOrderDto): string | null {
  return order.customerName?.trim().split(/\s+/)[0] ?? null;
}

export function totalLabel(order: StorefrontOrderDto, verb: string): string {
  if (order.isPickup) return `${verb} (pickup)`;
  return order.deliveryFeeKobo > 0
    ? `${verb} (incl. ${formatKobo(order.deliveryFeeKobo)} delivery)`
    : `${verb} (free delivery)`;
}
