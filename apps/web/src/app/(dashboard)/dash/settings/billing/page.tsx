import { formatKobo, PLAN_KEYS, PLANS } from '@ojara/shared';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  Download,
  FileText,
  Info,
  Minus,
} from 'lucide-react';
import type { Metadata } from 'next';
import { PaymentBadge, StatusPill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BILLING, INVOICES, PLAN_CARD_COPY } from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Settings · Plan & billing' };

function UsageTile({
  label,
  used,
  limit,
  fill = 'bg-forest',
}: {
  label: string;
  used: number;
  limit: number;
  fill?: string;
}) {
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div className="flex flex-col gap-2 rounded-[10px] bg-paper p-3.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-fg-muted">{label}</span>
        <span className="font-semibold text-fg">
          {used} of {limit}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        className="h-1.5 overflow-hidden rounded-[3px] bg-line"
      >
        <div className={cn('h-full rounded-[3px]', fill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** 03.16 Settings – Plan & billing. Prices and limits come from PLANS (@ojara/shared). */
export default function PlanBillingPage() {
  const current = PLANS[BILLING.currentPlan];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <section className="flex min-w-0 flex-1 flex-col gap-5 rounded-lg border border-line bg-surface p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-h-panel font-semibold tracking-display">
                  {current.name}
                </h2>
                <StatusPill tone="success">Active</StatusPill>
              </div>
              <p className="text-ui text-fg-muted">
                {formatKobo(current.priceKobo)} / month · next charge {BILLING.nextCharge}
              </p>
            </div>
            <Button variant="secondary">
              <ArrowLeftRight /> Change plan
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <UsageTile
              label="Products"
              used={BILLING.usage.products}
              limit={current.limits.maxProducts}
            />
            <UsageTile
              label="Staff accounts"
              used={BILLING.usage.staff}
              limit={current.limits.staffAccounts}
              fill="bg-fg-muted"
            />
            <UsageTile label="Custom domain" used={BILLING.usage.domains} limit={1} />
          </div>
          <p className="text-xs text-fg-muted">
            Need help running the store? Professional adds staff accounts so your team can manage
            orders.
          </p>
        </section>

        <section className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-5 md:p-6 lg:w-[340px] lg:shrink-0">
          <h2 className="text-title font-semibold">Billing card</h2>
          <div className="flex items-center gap-3 rounded-[10px] border border-line p-3.5">
            <span
              aria-hidden
              className="flex h-7 w-[42px] shrink-0 items-center justify-center rounded-[5px] bg-[#0B3B7A] text-[8px] font-extrabold tracking-wide text-white italic"
            >
              VERVE
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-ui font-semibold">
                {BILLING.card.brand} •••• {BILLING.card.last4}
              </span>
              <span className="text-xs text-fg-muted">Expires {BILLING.card.expires}</span>
            </div>
            <Button variant="ghost" size="none" className="text-xs">
              Change
            </Button>
          </div>
          <p className="text-xs text-fg-muted">Receipts go to {BILLING.receiptsTo}</p>
          <div className="flex items-start gap-2.5 rounded-md bg-surface-muted p-3 text-xs leading-[17px] text-fg-muted">
            <Info className="mt-px size-3.5 shrink-0 text-fg" aria-hidden />
            <p>
              This is only your Ojara plan. Paystack fees on your sales come out of payouts and are
              never billed here.
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const copy = PLAN_CARD_COPY[key];
          const isCurrent = key === BILLING.currentPlan;
          const isUpgrade = plan.priceKobo > current.priceKobo;
          return (
            <section
              key={key}
              aria-current={isCurrent ? 'true' : undefined}
              className={cn(
                'flex flex-col gap-3.5 rounded-lg bg-surface p-5 md:min-h-[330px]',
                isCurrent ? 'border-[1.5px] border-forest p-[19.5px]' : 'border border-line',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-title font-semibold">{plan.name}</h3>
                {isCurrent ? (
                  <span className="rounded-pill bg-forest px-2 py-0.5 text-2xs font-semibold text-paper">
                    Your plan
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                <p className="flex items-baseline gap-1.5">
                  <span className="font-display text-h-panel font-semibold tracking-display">
                    {formatKobo(plan.priceKobo)}
                  </span>
                  <span className="text-xs text-fg-muted">/ month</span>
                </p>
                <p className="text-xs text-fg-muted">{copy.tagline}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {copy.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2 text-ui">
                    {f.included ? (
                      <Check className="size-3.5 shrink-0 text-success" aria-hidden />
                    ) : (
                      <Minus className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-2">
                {isCurrent ? (
                  <p className="text-xs text-fg-muted">Active since {BILLING.activeSince}</p>
                ) : isUpgrade ? (
                  <Button className="w-full">
                    <ArrowUpRight /> Upgrade to {plan.name}
                  </Button>
                ) : (
                  <Button variant="secondary" className="w-full">
                    <ArrowDownLeft /> Switch to {plan.name}
                  </Button>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-title font-semibold">Invoices</h2>
          <Button variant="ghost" size="none" className="text-xs font-medium text-fg-muted">
            Cancel subscription
          </Button>
        </div>
        <ul>
          {INVOICES.map((inv) => (
            <li
              key={inv.number}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 not-last:border-b not-last:border-line"
            >
              <FileText className="size-4 shrink-0 text-fg-subtle" aria-hidden />
              <span className="text-ui font-semibold">{inv.number}</span>
              <span className="min-w-0 flex-1 text-ui text-fg-muted">
                {inv.date} · {inv.description}
              </span>
              <span className="text-ui font-semibold">{formatKobo(inv.amountKobo)}</span>
              <PaymentBadge status="PAID" />
              <Button
                variant="none"
                size="none"
                className="rounded-sm p-1"
                aria-label={`Download ${inv.number}`}
              >
                <Download className="text-fg-muted" />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
