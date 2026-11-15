import { CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import {
  ActivationFunnel,
  ExperienceCard,
  MrrChart,
  NeedsAPerson,
} from '@/components/admin/overview';
import { AdminKpiStrip } from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { ADMIN_ACCOUNT, OVERVIEW } from '@/mock/admin';

export const metadata: Metadata = { title: 'Overview' };

/** 06.01 Overview — platform health: KPIs, MRR, activation funnel, experience, work queue. */
export default function AdminOverview() {
  return (
    <PageContainer>
      <PageHeader
        title={`Good afternoon, ${ADMIN_ACCOUNT.firstName}`}
        subtitle={OVERVIEW.subtitle}
        actions={
          <Button variant="secondary">
            <CalendarDays /> This month
          </Button>
        }
      />
      <AdminKpiStrip items={OVERVIEW.kpis} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
        <MrrChart data={OVERVIEW.mrr} />
        <ActivationFunnel funnel={OVERVIEW.funnel} />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
        <ExperienceCard items={OVERVIEW.experience} />
        <NeedsAPerson items={OVERVIEW.needsAPerson} />
      </div>
    </PageContainer>
  );
}
