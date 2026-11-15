import { Inbox } from 'lucide-react';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { KpiStrip } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Overview' };

/** 06.01 Overview — SHELL ONLY. */
export default function AdminOverview() {
  return (
    <>
      <PageHeader title="Overview" subtitle="Platform health at a glance." />
      <KpiStrip
        compact
        items={[
          { label: 'Live stores', value: '—' },
          { label: 'MRR', value: '—' },
          { label: 'GMV (30 days)', value: '—' },
          { label: 'Open tickets', value: '—' },
        ]}
      />
      <EmptyState
        icon={Inbox}
        title="Nothing needs a person yet"
        body="Abuse reports, failed renewals and support tickets will queue here once those features are live."
      />
    </>
  );
}
