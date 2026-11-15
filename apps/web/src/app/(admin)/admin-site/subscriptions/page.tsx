import { formatKobo } from '@ojara/shared';
import { Download, MoreHorizontal } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AdminKpiStrip,
  PlanBadge,
  SearchBox,
  SubscriptionBadge,
} from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  SUBSCRIPTION_KPIS,
  SUBSCRIPTION_TABS,
  SUBSCRIPTIONS,
  type SubscriptionStatus,
} from '@/mock/admin';

export const metadata: Metadata = { title: 'Subscriptions' };

type Props = { searchParams: Promise<{ tab?: string }> };

const TAB_STATUS: Record<string, SubscriptionStatus | undefined> = {
  active: 'ACTIVE',
  'past-due': 'PAST_DUE',
  cancelling: 'CANCELLING',
};

const CELL = 'h-auto px-3 py-[11px]';

/** 06.04 Subscriptions — every paid plan, its renewal date and payment health. */
export default async function SubscriptionsPage({ searchParams }: Props) {
  const { tab: rawTab } = await searchParams;
  const tab = SUBSCRIPTION_TABS.some((t) => t.key === rawTab) ? rawTab! : 'all';
  const status = TAB_STATUS[tab];
  const rows = status ? SUBSCRIPTIONS.filter((s) => s.status === status) : SUBSCRIPTIONS;
  const total = SUBSCRIPTION_TABS.find((t) => t.key === tab)?.count ?? rows.length;

  return (
    <PageContainer>
      <PageHeader
        title="Subscriptions"
        subtitle="Every paid plan, its renewal date and payment health."
        actions={
          <Button variant="secondary">
            <Download /> Export
          </Button>
        }
      />
      <AdminKpiStrip items={SUBSCRIPTION_KPIS} />

      <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4">
          <nav className="-mb-px flex gap-5 overflow-x-auto" aria-label="Subscription status">
            {SUBSCRIPTION_TABS.map((t) => {
              const active = t.key === tab;
              return (
                <Link
                  key={t.key}
                  href={t.key === 'all' ? '/subscriptions' : `/subscriptions?tab=${t.key}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 border-b-2 pt-3.5 pb-3 text-ui whitespace-nowrap',
                    active
                      ? 'border-forest font-semibold text-fg'
                      : 'border-transparent font-medium text-fg-muted hover:text-fg',
                  )}
                >
                  {t.label}
                  <span className="text-xs font-normal text-fg-subtle">{t.count}</span>
                </Link>
              );
            })}
          </nav>
          <SearchBox
            placeholder="Store or owner"
            label="Search subscriptions by store or owner"
            className="my-1.5 w-full sm:w-60"
          />
        </div>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[860px] border-collapse text-ui">
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-2">Store</TableHead>
                <TableHead className="w-[122px] px-3 py-2">Plan</TableHead>
                <TableHead className="w-[130px] px-3 py-2">Status</TableHead>
                <TableHead className="w-[84px] px-0 py-2 text-right">Amount</TableHead>
                <TableHead className="w-[182px] px-3 py-2">Renews</TableHead>
                <TableHead className="w-[150px] px-3 py-2">Billing card</TableHead>
                <TableHead className="w-12 py-2 pr-4">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const risk = s.status === 'PAST_DUE';
                return (
                  <TableRow key={s.merchantId} className={cn(risk && 'bg-[#FDF6F4]')}>
                    <TableCell className="h-auto px-4 py-[11px]">
                      <div className="flex flex-col gap-px">
                        <Link
                          href={`/merchants/${s.merchantId}`}
                          className="font-semibold text-fg hover:underline"
                        >
                          {s.store}
                        </Link>
                        <span className="text-xs text-fg-muted">{s.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell className={CELL}>
                      <PlanBadge plan={s.plan} />
                    </TableCell>
                    <TableCell className={CELL}>
                      <SubscriptionBadge status={s.status} />
                    </TableCell>
                    <TableCell className="h-auto px-0 py-[11px] text-right font-semibold text-fg">
                      {formatKobo(s.amountKobo)}
                    </TableCell>
                    <TableCell className={cn(CELL, risk ? 'text-danger' : 'text-fg-muted')}>
                      {s.renews}
                    </TableCell>
                    <TableCell className={cn(CELL, 'text-fg-muted')}>{s.card}</TableCell>
                    <TableCell className="h-auto py-[11px] pr-4 text-right">
                      <Button
                        variant="none"
                        size="none"
                        className="size-7 rounded-sm text-fg-muted"
                        aria-label={`Actions for ${s.store}`}
                      >
                        <MoreHorizontal />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs text-fg-muted">
          <span>
            1–{rows.length} of {total}
          </span>
          <span>
            Failed renewals retry 3 times over 7 days, then the store moves to Free — products above
            20 are hidden, not deleted.
          </span>
        </div>
      </section>
    </PageContainer>
  );
}
