import { formatKobo } from '@ojara/shared';
import { Clock3, Landmark, RefreshCw, X } from 'lucide-react';
import type { Metadata } from 'next';
import { OrderResult } from '@/components/storefront/order-result';
import { DELIVERY, ORDER } from '@/mock/storefront';

export const metadata: Metadata = { title: 'Payment failed' };

/** 05.07 Payment Failed (static sample state). */
export default function PaymentFailedPage() {
  return (
    <OrderResult
      tone="danger"
      icon={X}
      title="Your payment didn’t go through"
      sub={`Paystack said: ${ORDER.failureReason}. You haven’t been charged, and your items are held for 30 minutes.`}
      stepsTitle="What you can do"
      steps={[
        {
          icon: RefreshCw,
          title: 'Try again with the same card',
          sub: 'Sometimes a second try works once your bank approves it',
        },
        {
          icon: Landmark,
          title: 'Pay by bank transfer or USSD',
          sub: 'Paystack gives you an account number to transfer to — no card needed',
        },
        {
          icon: Clock3,
          title: `Items held until ${ORDER.heldUntil}`,
          sub: 'After that, they go back on sale',
        },
      ]}
      totalLabel={`Amount to pay (incl. ${formatKobo(DELIVERY.fee)} delivery)`}
      total={ORDER.total}
      primary={{ href: '/checkout', label: 'Try paying again' }}
    />
  );
}
