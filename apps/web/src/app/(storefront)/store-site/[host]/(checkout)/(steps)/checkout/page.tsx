import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckoutForm } from '@/components/storefront/checkout-form';
import { canCheckout, getShop, type HostParams } from '@/components/storefront/store';

export const metadata: Metadata = { title: 'Checkout' };

/**
 * 05.05 Checkout / 05.15 Mobile – Checkout. Stores that can't take payment online yet keep the
 * cart's WhatsApp ordering, so their checkout URL goes back to the cart.
 */
export default async function CheckoutPage({ params }: { params: HostParams }) {
  const { store } = await getShop(params);
  if (!canCheckout(store)) redirect('/cart');
  return <CheckoutForm storeName={store.name} delivery={store.delivery} />;
}
