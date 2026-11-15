import { Download, Megaphone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MerchantsTable, PlanMix, ReviewQueue } from '@/components/admin/merchants';
import { AdminKpiStrip } from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { MERCHANT_KPIS, MERCHANTS, PLAN_MIX, REVIEW_QUEUE } from '@/mock/admin';

export const metadata: Metadata = { title: 'Merchants' };

/** 06.02 Merchants — every store, its plan and health, plus the review queue and plan mix. */
export default function MerchantsPage() {
  return (
    <PageContainer className="gap-[22px]">
      <PageHeader
        title="Merchants"
        subtitle="Every store on Ojara, its plan and its health. Updated 2 minutes ago."
        actions={
          <>
            <Button variant="secondary">
              <Download /> Export
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/announcements">
                <Megaphone /> Post announcement
              </Link>
            </Button>
          </>
        }
      />
      <AdminKpiStrip items={MERCHANT_KPIS} />
      <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <MerchantsTable merchants={MERCHANTS} />
        <div className="grid gap-[22px] md:grid-cols-2 xl:grid-cols-1">
          <ReviewQueue items={REVIEW_QUEUE} />
          <PlanMix mix={PLAN_MIX} />
        </div>
      </div>
    </PageContainer>
  );
}
