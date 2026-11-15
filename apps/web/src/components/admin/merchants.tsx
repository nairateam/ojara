import { PLANS } from '@ojara/shared';
import { Flag } from 'lucide-react';
import Link from 'next/link';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  type AdminMerchant,
  MERCHANTS_TOTAL,
  type PLAN_MIX,
  type REVIEW_QUEUE,
} from '@/mock/admin';
import {
  AdminCardTitle,
  FilterButton,
  formatKoboCompact,
  MerchantLogo,
  PlanBadge,
  PrivacyNote,
  StoreStatusBadge,
} from './primitives';

/** 06.02 store table: toolbar filters, rows link to the merchant, risk rows tinted #FDF6F4. */
export function MerchantsTable({ merchants }: { merchants: AdminMerchant[] }) {
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <FilterButton>Plan: All</FilterButton>
        <FilterButton>Status: All</FilterButton>
        <FilterButton>Category: All</FilterButton>
        <span className="ml-auto text-xs text-fg-muted">Sorted by GMV (30d)</span>
      </div>
      <div className="overflow-x-auto border-t border-line">
        <table className="w-full min-w-[640px] border-collapse text-ui">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-2">Store</TableHead>
              <TableHead className="w-[116px] px-3 py-2">Plan</TableHead>
              <TableHead className="w-[132px] px-3 py-2">Status</TableHead>
              <TableHead className="w-[84px] px-3 py-2 text-right">Products</TableHead>
              <TableHead className="w-[104px] py-2 pr-4 pl-3 text-right">GMV 30d</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchants.map((m) => (
              <TableRow
                key={m.id}
                className={cn(
                  'relative hover:bg-selected/50',
                  m.status === 'SUSPENDED' && 'bg-[#FDF6F4] hover:bg-[#FBEEEA]',
                )}
              >
                <TableCell className="h-auto px-4 py-[11px]">
                  <div className="flex items-center gap-2.5">
                    <MerchantLogo name={m.store} bg={m.logoColor} />
                    <div className="flex min-w-0 flex-col gap-px">
                      <Link
                        href={`/merchants/${m.id}`}
                        className="truncate font-semibold text-fg after:absolute after:inset-0"
                      >
                        {m.store}
                      </Link>
                      <span className="truncate text-xs text-fg-muted">
                        {m.domain} · {m.owner}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="h-auto px-3 py-[11px]">
                  <PlanBadge plan={m.plan} />
                </TableCell>
                <TableCell className="h-auto px-3 py-[11px]">
                  <StoreStatusBadge status={m.status} />
                </TableCell>
                <TableCell className="h-auto px-3 py-[11px] text-right text-fg">
                  {m.products}
                </TableCell>
                <TableCell className="h-auto py-[11px] pr-4 pl-3 text-right font-semibold text-fg">
                  {m.gmv30dKobo === null ? '—' : formatKoboCompact(m.gmv30dKobo)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
        <PrivacyNote>
          Shoppers’ personal details are hidden in admin views. Every store you open is recorded in
          the audit log.
        </PrivacyNote>
        <span className="text-xs text-fg-muted">
          1–{merchants.length} of {MERCHANTS_TOTAL.toLocaleString('en-NG')}
        </span>
      </div>
    </section>
  );
}

export function ReviewQueue({ items }: { items: typeof REVIEW_QUEUE }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between px-[18px] py-4">
        <AdminCardTitle>Review queue</AdminCardTitle>
        <span className="rounded-pill bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
          {items.length} open
        </span>
      </div>
      <ul>
        {items.map((r) => (
          <li key={r.caseId} className="border-t border-line">
            <Link
              href={`/reports?case=${r.caseId}`}
              className="flex flex-col gap-1.5 px-[18px] py-3.5 hover:bg-selected/50"
            >
              <span className="flex items-center gap-2">
                <Flag className="size-3.5 shrink-0 text-warning" aria-hidden />
                <span className="flex-1 text-ui font-semibold text-fg">{r.store}</span>
                <span className="text-xs font-semibold text-fg">Review</span>
              </span>
              <span className="text-xs text-fg">{r.reason}</span>
              <span className="text-xs text-fg-subtle">{r.state}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PlanMix({ mix }: { mix: typeof PLAN_MIX }) {
  const total = mix.rows.reduce((s, r) => s + r.count, 0);
  return (
    <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-[18px]">
      <AdminCardTitle>Plan mix</AdminCardTitle>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-[5px]" aria-hidden>
        {mix.rows.map((r) => (
          <span
            key={r.plan}
            className="h-full"
            style={{
              background: r.color,
              width: `${(r.count / total) * 100}%`,
              minWidth: 8,
            }}
          />
        ))}
      </div>
      {mix.rows.map((r) => (
        <div key={r.plan} className="flex items-center gap-2 text-ui">
          <span className="size-2.5 rounded-[3px]" style={{ background: r.color }} aria-hidden />
          <span className="flex-1 text-fg">{PLANS[r.plan].name}</span>
          <span className="font-semibold text-fg">{r.count.toLocaleString('en-NG')}</span>
          <span className="w-11 text-right text-xs text-fg-subtle">{r.pct}</span>
        </div>
      ))}
      <p className="text-xs leading-[17px] text-fg-muted">{mix.insight}</p>
    </section>
  );
}
