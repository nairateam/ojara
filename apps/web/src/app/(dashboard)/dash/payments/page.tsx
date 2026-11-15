import { formatKobo } from '@ojara/shared';
import { ChevronDown, Download, ExternalLink, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { type PillTone, StatusPill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PAYMENT_KPIS,
  PAYOUT_ACCOUNT,
  PAYOUTS,
  TRANSACTIONS,
  type TxnStatus,
} from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Payments' };

const STATUS: Record<TxnStatus, { label: string; tone: PillTone }> = {
  SUCCESSFUL: { label: 'Successful', tone: 'success' },
  PENDING: { label: 'Pending', tone: 'warning' },
  FAILED: { label: 'Failed', tone: 'danger' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
};

const NOTE_TONE = { warning: 'text-warning', danger: 'text-danger', muted: 'text-fg-muted' };

const TABS = [
  { key: 'transactions', label: 'Transactions', href: '/payments' },
  { key: 'payouts', label: 'Payouts', href: '/payments?tab=payouts' },
  { key: 'refunds', label: 'Refunds', href: '/payments?tab=refunds' },
] as const;

const th =
  'py-2 pr-[18px] text-left text-2xs font-semibold tracking-[0.6px] whitespace-nowrap text-fg-subtle uppercase first:pl-[18px]';
const td = 'py-[11px] pr-[18px] align-middle first:pl-[18px]';

type Props = { searchParams: Promise<{ tab?: string }> };

/** 03.12 Payments: Paystack collections, fees and payouts. */
export default async function PaymentsPage({ searchParams }: Props) {
  const { tab: requested } = await searchParams;
  const tab = TABS.find((t) => t.key === requested)?.key ?? 'transactions';
  const k = PAYMENT_KPIS;
  const kpis = [
    {
      label: 'Collected · last 30 days',
      value: formatKobo(k.collectedKobo),
      context: `${k.successfulCount} successful payments`,
    },
    {
      label: 'Paystack fees',
      value: formatKobo(-k.feesKobo),
      context: `${k.feePercent} of collected`,
      tone: 'text-danger',
    },
    {
      label: 'Paid out to your bank',
      value: formatKobo(k.paidOutKobo),
      context: `${k.payoutCount} payouts`,
    },
    {
      label: 'Next payout',
      value: formatKobo(k.nextPayoutKobo),
      context: `${k.nextPayoutDate} · ${PAYOUT_ACCOUNT.bank} ••${PAYOUT_ACCOUNT.last4}`,
      tone: 'text-success',
    },
  ];
  const rows =
    tab === 'refunds' ? TRANSACTIONS.filter((t) => t.status === 'REFUNDED') : TRANSACTIONS;

  return (
    <PageContainer>
      <PageHeader
        title="Payments"
        badge={<StatusPill tone="success">Paystack connected</StatusPill>}
        subtitle="Money from customers, Paystack fees and payouts to your bank."
        actions={
          <>
            <Button variant="secondary">
              <Download /> Export
            </Button>
            <Button variant="secondary" asChild>
              <a href="https://dashboard.paystack.com" target="_blank" rel="noreferrer">
                <ExternalLink /> Open Paystack
              </a>
            </Button>
          </>
        }
      />

      <div className="grid overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={cn(
              'flex flex-col gap-1.5 border-line px-5 py-4',
              'border-b sm:odd:border-r xl:border-b-0 xl:not-last:border-r',
              i >= 2 && 'sm:border-b-0',
              i === 3 && 'border-b-0',
            )}
          >
            <span className="text-xs text-fg-muted">{kpi.label}</span>
            <span
              className={cn('font-display text-h-panel font-semibold tracking-display', kpi.tone)}
            >
              {kpi.value}
            </span>
            <span className="text-xs text-fg-subtle">{kpi.context}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 px-[18px]">
            <nav aria-label="Payment views" className="flex gap-5">
              {TABS.map((t) => (
                <Link
                  key={t.key}
                  href={t.href}
                  aria-current={t.key === tab ? 'page' : undefined}
                  className={cn(
                    'border-b-2 pt-3.5 pb-3 text-ui',
                    t.key === tab
                      ? 'border-forest font-semibold text-fg'
                      : 'border-transparent font-medium text-fg-muted hover:text-fg',
                  )}
                >
                  {t.label}
                </Link>
              ))}
            </nav>
            <Button
              variant="secondary"
              size="none"
              className="hidden h-auto px-2.5 py-1.5 text-xs sm:inline-flex"
            >
              Status: All <ChevronDown className="size-3" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            {tab === 'payouts' ? (
              <table className="w-full min-w-[560px] border-collapse">
                <thead className="border-t border-line bg-paper">
                  <tr>
                    <th className={th}>Date</th>
                    <th className={th}>Reference</th>
                    <th className={th}>Payments</th>
                    <th className={th}>Amount</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYOUTS.map((p) => (
                    <tr key={p.reference + p.date} className="border-t border-line">
                      <td className={cn(td, 'text-xs text-fg-muted')}>{p.date}</td>
                      <td className={cn(td, 'text-ui font-semibold')}>{p.reference}</td>
                      <td className={cn(td, 'text-xs text-fg-muted')}>{p.payments} payments</td>
                      <td className={cn(td, 'text-ui font-semibold')}>
                        {formatKobo(p.amountKobo)}
                      </td>
                      <td className={td}>
                        <StatusPill tone={p.sent ? 'success' : 'info'}>
                          {p.sent ? 'Sent' : 'Scheduled'}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[680px] border-collapse">
                <thead className="border-t border-line bg-paper">
                  <tr>
                    <th className={cn(th, 'w-[122px]')}>When</th>
                    <th className={th}>Order</th>
                    <th className={cn(th, 'w-[116px]')}>Method</th>
                    <th className={cn(th, 'w-[104px] text-right')}>Amount</th>
                    <th className={cn(th, 'w-[56px] text-right')}>Fee</th>
                    <th className={cn(th, 'w-[130px]')}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.order} className="border-t border-line">
                      <td className={cn(td, 'text-xs whitespace-nowrap text-fg-muted')}>
                        {t.when}
                      </td>
                      <td className={td}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-ui font-semibold">
                            {t.order} · {t.customer}
                          </span>
                          {t.note ? (
                            <span className={cn('text-xs', NOTE_TONE[t.note.tone])}>
                              {t.note.text}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className={cn(td, 'text-xs whitespace-nowrap text-fg-muted')}>
                        {t.method}
                      </td>
                      <td className={cn(td, 'text-right text-ui font-semibold')}>
                        {formatKobo(t.amountKobo)}
                      </td>
                      <td className={cn(td, 'text-right text-xs text-fg-muted')}>
                        {t.feeKobo === null ? '—' : formatKobo(t.feeKobo)}
                      </td>
                      <td className={td}>
                        <StatusPill tone={STATUS[t.status].tone}>
                          {STATUS[t.status].label}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-5 lg:w-[320px] lg:shrink-0">
          <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-title font-semibold">Payout account</h2>
              <Button variant="ghost" size="none" className="text-xs">
                Change
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-md bg-[#DD4F05] text-sm font-bold text-white"
              >
                G
              </span>
              <div className="flex flex-col">
                <span className="text-ui font-semibold">
                  {PAYOUT_ACCOUNT.bank} ••{PAYOUT_ACCOUNT.last4}
                </span>
                <span className="text-xs text-fg-muted">{PAYOUT_ACCOUNT.holder}</span>
              </div>
            </div>
            <p className="text-xs text-fg-muted">Paid out automatically the next business day.</p>
          </section>

          <section className="flex flex-col gap-2 rounded-lg bg-forest p-5 text-paper">
            <h2 className="text-2xs font-semibold tracking-label text-fg-on-dark uppercase">
              Next payout
            </h2>
            <p className="font-display text-[30px] leading-tight font-semibold tracking-display">
              {formatKobo(k.nextPayoutKobo)}
            </p>
            <p className="text-ui text-fg-on-dark">
              {k.nextPayoutLong} · {k.nextPayoutPayments} payments after fees
            </p>
          </section>

          <div className="flex items-start gap-2.5 rounded-lg bg-surface-muted p-3.5 text-xs leading-[17px] text-fg-muted">
            <Info className="mt-px size-3.5 shrink-0" aria-hidden />
            <p>
              Your Ojara plan is billed separately in{' '}
              <Link href="/settings/billing" className="hover:underline">
                Settings › Plan &amp; billing
              </Link>
              . It’s never taken from these payouts.
            </p>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
