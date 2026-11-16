import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata: Metadata = { robots: { index: false } };

/**
 * Checkout group: no announcement bar, nav or footer. Headers come from (steps) / (result).
 *
 * Online checkout isn't live yet (it needs orders and Paystack, pending the decision on who holds
 * customer funds), so these screens still render sample data. Until then every checkout URL sends
 * shoppers back to the cart, which offers ordering by WhatsApp. Remove this redirect when checkout
 * is built on real orders.
 */
export default function CheckoutGroupLayout({ children }: { children: ReactNode }) {
  redirect('/cart');
  return <div className="flex min-h-dvh flex-col bg-store-page">{children}</div>;
}
