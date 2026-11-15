import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  AccountCard,
  ActivityCard,
  InvoicesCard,
  MerchantHeader,
  NotesCard,
} from '@/components/admin/merchant-detail';
import { AdminKpiStrip } from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { getMerchantDetail } from '@/mock/admin';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = getMerchantDetail((await params).id);
  return { title: detail?.merchant.store ?? 'Merchant not found' };
}

/** 06.03 Merchant detail — account, invoices, activity and internal notes for one store. */
export default async function MerchantDetailPage({ params }: Props) {
  const detail = getMerchantDetail((await params).id);
  if (!detail) notFound();
  return (
    <PageContainer>
      <MerchantHeader detail={detail} />
      <AdminKpiStrip items={detail.kpis} size="sm" />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <AccountCard detail={detail} />
          <InvoicesCard detail={detail} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <ActivityCard detail={detail} />
          <NotesCard detail={detail} />
        </div>
      </div>
    </PageContainer>
  );
}
