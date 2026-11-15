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
import { timeOfDayGreeting } from '@/components/dashboard/format';
import { Button } from '@/components/ui/button';
import { firstName, requireAdmin } from '@/lib/auth/guards';
import { OVERVIEW } from '@/mock/admin';

export const metadata: Metadata = { title: 'Overview' };

/** 06.01 Overview — platform health: KPIs, MRR, activation funnel, experience, work queue. */
export default async function AdminOverview() {
  // The layout shows "no admin access" for non-admins; render nothing in that case.
  const admin = await requireAdmin();
  if (!admin) return null;
  return (
    <PageContainer>
      <PageHeader
        title={`${timeOfDayGreeting()}, ${firstName(admin.name)}`}
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
