import { CreditCard, Landmark, RefreshCw, X } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OrderResult } from '@/components/storefront/order-result';
import type { HostParams } from '@/components/storefront/store';
import { loadOrder, type ReferenceSearchParams, totalLabel } from '../order';

export const metadata: Metadata = { title: 'Payment failed' };

/** 05.07 Payment Failed. The cart stays in the browser, so "Try again" starts a fresh checkout. */
export default async function PaymentFailedPage({
  params,
  searchParams,
}: {
  params: HostParams;
  searchParams: ReferenceSearchParams;
}) {
  const { order, whatsappHref } = await loadOrder(params, searchParams);
  if (order.paymentStatus === 'PAID') {
    redirect(`/checkout/confirmed?reference=${encodeURIComponent(order.reference)}`);
  }
  return (
    <OrderResult
      tone="danger"
      icon={X}
      title="Your payment didn’t go through"
      sub={`Order #${order.number} wasn’t paid, and you haven’t been charged. Your cart is still saved.`}
      stepsTitle="What you can do"
      steps={[
        {
          icon: RefreshCw,
          title: 'Try again',
          sub: 'Sometimes a second try works once your bank approves it',
        },
        {
          icon: Landmark,
          title: 'Pay by bank transfer or USSD',
          sub: 'Paystack gives you an account number to transfer to, no card needed',
        },
        {
          icon: CreditCard,
          title: 'Use a different card',
          sub: 'Check it’s enabled for online payments',
        },
      ]}
      items={order.items}
      totalLabel={totalLabel(order, 'Amount to pay')}
      total={order.totalKobo}
      primary={{ href: '/checkout', label: 'Try paying again' }}
      whatsappHref={whatsappHref}
    />
  );
}
