import { formatKobo } from '@ojara/shared';
import { Bike, Check, Loader2, MapPin, Package, Store } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OrderResult } from '@/components/storefront/order-result';
import { ClearCartOnPaid, RefreshWhilePending } from '@/components/storefront/order-status-effects';
import type { HostParams } from '@/components/storefront/store';
import { firstName, loadOrder, type ReferenceSearchParams, totalLabel } from '../order';

export const metadata: Metadata = { title: 'Order confirmed' };

/**
 * 05.06 Order Confirmed: where Paystack sends the shopper back. The webhook usually lands first;
 * if not, the page shows "confirming" and refreshes (the API also re-checks with Paystack).
 */
export default async function OrderConfirmedPage({
  params,
  searchParams,
}: {
  params: HostParams;
  searchParams: ReferenceSearchParams;
}) {
  const { store, order, whatsappHref } = await loadOrder(params, searchParams);
  const ref = encodeURIComponent(order.reference);
  if (order.paymentStatus === 'FAILED') redirect(`/checkout/failed?reference=${ref}`);

  if (order.paymentStatus !== 'PAID') {
    return (
      <>
        <RefreshWhilePending />
        <OrderResult
          tone="pending"
          icon={Loader2}
          title="Confirming your payment…"
          sub={`Order #${order.number} · This usually takes a few seconds. Please don’t pay again.`}
          stepsTitle="What’s happening"
          steps={[
            {
              icon: Package,
              title: 'Paystack is confirming your payment',
              sub: 'This page updates by itself',
            },
            {
              icon: Check,
              title: 'You’ll get a receipt by email',
              sub: order.customerEmail ? `Sent to ${order.customerEmail}` : 'Once it’s confirmed',
            },
          ]}
          items={order.items}
          totalLabel={totalLabel(order, 'Total')}
          total={order.totalKobo}
          primary={null}
          whatsappHref={whatsappHref}
        />
      </>
    );
  }

  const name = firstName(order);
  const place = order.isPickup
    ? {
        icon: Store,
        title: 'Pick it up at the store',
        sub: order.pickupAddress ?? `${store.name} will tell you when it’s ready`,
      }
    : {
        icon: MapPin,
        title: `Delivered to ${order.deliveryAddress?.city || order.zoneName || 'you'}`,
        sub: order.deliveryAddress?.line1 ?? 'At the address you gave',
      };
  return (
    <>
      <ClearCartOnPaid />
      <OrderResult
        tone="success"
        icon={Check}
        title={name ? `Thank you, ${name}. Your order is confirmed.` : 'Your order is confirmed.'}
        sub={`Order #${order.number} · Paid ${formatKobo(order.totalKobo)} via Paystack${
          order.customerEmail ? ` · Receipt sent to ${order.customerEmail}` : ''
        }`}
        stepsTitle="What happens next"
        steps={[
          {
            icon: Package,
            title: `${store.name} prepares your order`,
            sub: store.delivery.orderReadyIn ?? 'The store will be in touch',
          },
          ...(order.isPickup
            ? []
            : [
                {
                  icon: Bike,
                  title: 'It’s sent out for delivery',
                  sub: 'The store will contact you on the number you gave',
                },
              ]),
          place,
        ]}
        items={order.items}
        totalLabel={totalLabel(order, 'Total paid')}
        total={order.totalKobo}
        primary={{ href: '/shop', label: 'Continue shopping' }}
        whatsappHref={whatsappHref}
      />
    </>
  );
}
