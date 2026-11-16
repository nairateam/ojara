import { type EmailOrderLine } from '@ojara/email';
import { formatKobo } from '@ojara/shared';

/** Shared wording for orders in emails (and anywhere else orders are summarised as text). */

export type DeliveryAddressSnapshot = {
  line1: string;
  city: string | null;
  state: string | null;
  landmark: string | null;
};

export function orderEmailLines(
  items: { name: string; variantLabel: string | null; quantity: number; lineTotalKobo: number }[],
): EmailOrderLine[] {
  return items.map((i) => ({
    name: i.name,
    detail: i.variantLabel,
    quantity: i.quantity,
    totalFormatted: formatKobo(i.lineTotalKobo),
  }));
}

export function addressText(a: DeliveryAddressSnapshot): string {
  return [a.line1, a.city, a.state].filter(Boolean).join(', ');
}

/** "Delivery to 12 Market Road, Yaba, Lagos (Lagos Mainland, 1–2 days)." / "Pickup at …". */
export function fulfilmentText(order: {
  isPickup: boolean;
  deliveryAddress: unknown;
  deliveryZone: { name: string; eta: string | null } | null;
  store: { pickupAddress: string | null };
}): string {
  if (order.isPickup) {
    return order.store.pickupAddress
      ? `Pickup at ${order.store.pickupAddress}.`
      : 'Pickup: the store will contact you.';
  }
  const address = order.deliveryAddress as DeliveryAddressSnapshot | null;
  const zone = order.deliveryZone
    ? ` (${[order.deliveryZone.name, order.deliveryZone.eta].filter(Boolean).join(', ')})`
    : '';
  return address ? `Delivery to ${addressText(address)}${zone}.` : `Delivery${zone}.`;
}
