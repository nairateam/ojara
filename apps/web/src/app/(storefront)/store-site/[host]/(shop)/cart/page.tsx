import type { Metadata } from 'next';
import { CartView } from '@/components/storefront/cart-view';
import { canCheckout, getShop, type HostParams, whatsappLink } from '@/components/storefront/store';

export const metadata: Metadata = { title: 'Your cart' };

/** 05.04 Cart / 05.14 Mobile – Cart: the cart saved in this browser. */
export default async function CartPage({ params }: { params: HostParams }) {
  const { store } = await getShop(params);
  return (
    <CartView
      whatsappHref={whatsappLink(store.whatsappNumber)?.href ?? null}
      delivery={store.delivery}
      acceptsPayments={canCheckout(store)}
    />
  );
}
