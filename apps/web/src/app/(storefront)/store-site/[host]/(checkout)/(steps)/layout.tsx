import type { ReactNode } from 'react';
import { CheckoutHeader } from '@/components/storefront/storefront-chrome';
import { getStore, type HostParams } from '@/components/storefront/store';

/** 05.05 / 05.15 checkout: brand + 3-step stepper + "Secure checkout" (mobile: back · title · lock). */
export default async function CheckoutStepsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: HostParams;
}) {
  const store = await getStore(params);
  return (
    <>
      <CheckoutHeader storeName={store.name} current={1} />
      <main className="flex-1">{children}</main>
    </>
  );
}
