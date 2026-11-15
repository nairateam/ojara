import type { ReactNode } from 'react';
import { BrandOnlyHeader } from '@/components/storefront/storefront-chrome';
import { getStore, type HostParams } from '@/components/storefront/store';

/** 05.06 / 05.07: brand-only header, no nav, no footer. */
export default async function CheckoutResultLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: HostParams;
}) {
  const store = await getStore(params);
  return (
    <>
      <BrandOnlyHeader storeName={store.name} />
      <main className="flex-1">{children}</main>
    </>
  );
}
