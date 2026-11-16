import { deliverySettingsSchema } from '@ojara/shared';
import type { Metadata } from 'next';
import { PageContainer } from '@/components/app/page-container';
import { DeliveryForm } from '@/components/dashboard/delivery-form';
import { apiGet } from '@/lib/api/session';
import { requireMerchant } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'Delivery & pickup' };

/** 03.11 Delivery & pickup: zones and charges, free-delivery threshold, pickup, order notes. */
export default async function DeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ membership, summary, storeAddress }, { saved }] = await Promise.all([
    requireMerchant(),
    searchParams,
  ]);
  const settings = await apiGet(
    `/stores/${encodeURIComponent(membership.id)}/delivery`,
    deliverySettingsSchema,
  );
  return (
    <PageContainer>
      <DeliveryForm
        key={JSON.stringify(settings)}
        initial={settings}
        storeName={summary.store.name}
        storeAddress={storeAddress}
        saved={saved === '1'}
      />
    </PageContainer>
  );
}
