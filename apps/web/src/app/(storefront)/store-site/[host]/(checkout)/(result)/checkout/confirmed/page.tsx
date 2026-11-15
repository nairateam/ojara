import { formatKobo } from '@ojara/shared';
import { Bike, Check, MapPin, Package } from 'lucide-react';
import type { Metadata } from 'next';
import { OrderResult } from '@/components/storefront/order-result';
import { getStore, type HostParams } from '@/components/storefront/store';
import { DELIVERY, ORDER } from '@/mock/storefront';

export const metadata: Metadata = { title: 'Order confirmed' };

/** 05.06 Order Confirmed (static sample order). */
export default async function OrderConfirmedPage({ params }: { params: HostParams }) {
  const store = await getStore(params);
  return (
    <OrderResult
      tone="success"
      icon={Check}
      title={`Thank you, ${ORDER.firstName}. Your order is confirmed.`}
      sub={`Order ${ORDER.number} · Paid ${formatKobo(ORDER.total)} via Paystack · Receipt sent to ${ORDER.email}`}
      stepsTitle="What happens next"
      steps={[
        {
          icon: Package,
          title: `${store.name} prepares your order`,
          sub: 'Usually within 24 hours',
        },
        {
          icon: Bike,
          title: 'It’s sent out for delivery',
          sub: 'You’ll get an SMS and WhatsApp message with the rider’s number',
        },
        { icon: MapPin, title: `Delivered to ${ORDER.town}`, sub: `Expected ${DELIVERY.eta}` },
      ]}
      totalLabel={`Total paid (incl. ${formatKobo(DELIVERY.fee)} delivery)`}
      total={ORDER.total}
      primary={{ href: '/shop', label: 'Continue shopping' }}
    />
  );
}
