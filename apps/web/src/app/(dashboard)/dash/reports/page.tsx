import { formatKobo } from '@ojara/shared';
import { Calendar, ChartNoAxesColumnIncreasing, Download } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { formatCompactKobo } from '@/components/dashboard/format';
import { KpiStripCard } from '@/components/dashboard/kpis';
import { Thumb } from '@/components/dashboard/thumb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PAYMENT_METHODS,
  REGIONS,
  REPORT_KPIS,
  REPORT_RANGE,
  TOP_PRODUCTS,
  WEEKLY_REVENUE,
} from '@/mock/dashboard';

export const metadata: Metadata = { title: 'Reports' };

const card = 'flex flex-col rounded-lg border border-line bg-surface';

function CardHead({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-[15px]/[21px] font-semibold">{title}</h2>
      {caption ? <p className="text-xs text-fg-muted">{caption}</p> : null}
    </div>
  );
}

/** Labelled percentage bars (payment methods, regions): first row forest, rest muted. */
function Meters({ rows }: { rows: { label: string; pct: number }[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((r, i) => (
        <li key={r.label} className="flex flex-col gap-2">
          <span className="flex items-center justify-between text-[13px]/[19px]">
            <span>{r.label}</span>
            <span className="font-semibold">{r.pct}%</span>
          </span>
          <span className="h-1.5 overflow-hidden rounded-[3px] bg-surface-muted" aria-hidden>
            <span
              className={cn('block h-full rounded-[3px]', i === 0 ? 'bg-forest' : 'bg-chart-muted')}
              style={{ width: `${r.pct}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** 03.08 Reports: KPIs, revenue by week, payment split, top products, regions, upsell. */
export default function ReportsPage() {
  const max = Math.max(...WEEKLY_REVENUE.map((w) => w.kobo));
  const topMax = Math.max(...TOP_PRODUCTS.map((p) => p.kobo));

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        className="max-lg:[&_h1]:hidden"
        subtitle="Sales performance · paid orders only"
        actions={
          <>
            <Button variant="secondary">
              <Calendar /> {REPORT_RANGE}
            </Button>
            <Button variant="secondary" className="hidden sm:inline-flex">
              <Download /> Export CSV
            </Button>
          </>
        }
      />

      <KpiStripCard
        size="md"
        items={REPORT_KPIS.map((k) => ({
          label: k.label,
          value: k.value,
          delta: {
            value: k.context,
            tone: k.tone === 'success' ? 'up' : k.tone === 'danger' ? 'down' : 'muted',
            icon: false,
            weight: 'normal',
          },
        }))}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className={cn(card, 'gap-5 p-5')}>
          <CardHead title="Revenue by week" caption="Hover a bar for daily detail" />
          <ul className="flex h-[200px] items-end gap-2.5">
            {WEEKLY_REVENUE.map((w, i) => {
              const last = i === WEEKLY_REVENUE.length - 1;
              return (
                <li
                  key={w.label}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  title={`Week of ${w.label}: ${formatKobo(w.kobo)}`}
                >
                  <span className="text-[11px]/[14px] font-semibold text-fg-muted">
                    {formatCompactKobo(w.kobo)}
                  </span>
                  <span
                    className={cn('w-full rounded-[4px]', last ? 'bg-forest' : 'bg-chart-muted')}
                    style={{ height: `${(w.kobo / max) * 130}px` }}
                  />
                  <span className="pt-1.5 text-[11px]/[14px] whitespace-nowrap text-fg-subtle">
                    {w.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={cn(card, 'gap-5 p-5')}>
          <CardHead title="How customers pay" caption="Through Paystack" />
          <Meters rows={PAYMENT_METHODS} />
        </section>

        <section className={card}>
          <h2 className="px-5 py-4 text-[15px]/[21px] font-semibold">Top products</h2>
          <ol>
            {TOP_PRODUCTS.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3 border-t border-line px-5 py-2.5">
                <span className="w-2 text-xs text-fg-subtle">{i + 1}</span>
                <Thumb src={p.image} size={34} className="rounded-sm" />
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="truncate text-[13px]/[19px] font-semibold">{p.name}</span>
                  <span className="h-1 overflow-hidden rounded-[2px] bg-surface-muted" aria-hidden>
                    <span
                      className="block h-full rounded-[2px] bg-fg-muted"
                      style={{ width: `${(p.kobo / topMax) * 63}%` }}
                    />
                  </span>
                </span>
                <span className="w-16 text-right text-xs text-fg-muted">{p.sold} sold</span>
                <span className="w-20 text-right text-[13px]/[19px] font-semibold">
                  {formatKobo(p.kobo)}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={cn(card, 'gap-5 p-5')}>
          <CardHead title="Where orders go" caption="Share of paid orders" />
          <Meters rows={REGIONS} />
        </section>
      </div>

      <aside className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-lg bg-surface-muted px-5 py-3.5">
        <ChartNoAxesColumnIncreasing className="size-[18px] shrink-0 text-fg-muted" aria-hidden />
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-0.5">
          <p className="text-[13px]/[19px] font-semibold">
            Want profit per product and repeat-customer trends?
          </p>
          <p className="text-xs text-fg-muted">
            Advanced reports, scheduled email summaries and staff accounts come with Professional —
            ₦10,000/month.
          </p>
        </div>
        <Link href="/settings/billing" className="text-[13px]/[19px] font-semibold">
          See Professional
        </Link>
      </aside>
    </PageContainer>
  );
}
