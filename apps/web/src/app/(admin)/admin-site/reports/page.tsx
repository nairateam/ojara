import type { Metadata } from 'next';
import { CaseDetail, CaseListPane } from '@/components/admin/reports';
import { SplitPage } from '@/components/app/page-container';
import { ABUSE_CASES, ABUSE_RESOLVED_COUNT } from '@/mock/admin';

export const metadata: Metadata = { title: 'Reports & abuse' };

type Props = { searchParams: Promise<{ case?: string; tab?: string }> };

/** 06.06 Reports & abuse — case list (~360) + case detail with evidence and a decision. */
export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = params.tab === 'resolved' ? 'resolved' : 'open';
  const open = ABUSE_CASES.filter((c) => c.status === 'open');
  const selected = ABUSE_CASES.find((c) => c.id === params.case) ?? open[0];

  return (
    <SplitPage
      panelSide="left"
      className="flex-col lg:flex-row"
      panel={
        <CaseListPane
          cases={open}
          selectedId={selected?.id}
          tab={tab}
          counts={{ open: open.length, resolved: ABUSE_RESOLVED_COUNT }}
        />
      }
    >
      {selected ? <CaseDetail c={selected} /> : null}
    </SplitPage>
  );
}
