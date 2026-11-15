import type { Metadata } from 'next';
import { StoreClosed } from '@/components/storefront/storefront-chrome';
import { getStore, type HostParams } from '@/components/storefront/store';

export const metadata: Metadata = { title: 'Temporarily closed', robots: { index: false } };

/** Preview of 05.11 "Temporarily closed" without changing the store's status. */
export default async function ClosedPreviewPage({ params }: { params: HostParams }) {
  const store = await getStore(params);
  return <StoreClosed storeName={store.name} />;
}
