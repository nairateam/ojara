import { PLANS, formatKobo } from '@ojara/shared';
import { Archive, ArrowUpRight, Gauge, PackagePlus, Send } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DetailRow } from '@/components/ui/panels';
import { Alert } from '@/components/ui/feedback';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * System states (00.07) used across the merchant app. Empty states use
 * `@/components/app/empty-state`; the success toast lives in ./order-status-action.
 */

const ROW_OPACITY = [1, 0.85, 0.7, 0.55, 0.4];
const NAME_WIDTHS = ['w-[110px]', 'w-[90px]', 'w-[130px]', 'w-[100px]', 'w-[70px]'];

/** Loading · orders table: paper header + five skeleton rows that fade out (1 → 0.4). */
export function TableSkeleton({
  rows = 5,
  className,
  label = 'Loading orders',
}: {
  rows?: number;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}
    >
      <div className="flex items-center gap-3 bg-paper px-[18px] py-3">
        <Skeleton className="h-2 w-[60px]" />
        <Skeleton className="h-2 w-[190px]" />
        <span className="flex-1" />
        <Skeleton className="h-2 w-[50px]" />
        <Skeleton className="h-2 w-[60px]" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{ opacity: ROW_OPACITY[i % ROW_OPACITY.length] }}
          className="flex items-center gap-3 border-t border-line px-[18px] py-3"
        >
          <span className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-[60px]" />
            <Skeleton className="h-2 w-10" />
          </span>
          <span className="flex flex-col gap-1.5">
            <Skeleton className={cn('h-2.5', NAME_WIDTHS[i % NAME_WIDTHS.length])} />
            <Skeleton className="h-2 w-[70px]" />
          </span>
          <span className="flex-1" />
          <Skeleton className="hidden h-2.5 w-[50px] sm:block" />
          <Skeleton className="h-[18px] w-[60px] rounded-sm" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Error · payment failed: red alert + attempt details + recovery actions. */
export function PaymentFailedNotice({
  orderNumber,
  reason,
  amountKobo,
  attempted,
  reference,
  className,
}: {
  orderNumber: string;
  reason: string;
  amountKobo: number;
  attempted: string;
  reference: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Alert tone="error" title={`Payment failed for ${orderNumber}`}>
        {reason}
      </Alert>
      <div className="flex flex-col gap-2">
        <DetailRow label="Amount" value={formatKobo(amountKobo)} />
        <DetailRow label="Attempted" value={attempted} />
        <DetailRow label="Paystack ref" value={reference} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="flex-1">
          <Send /> Send new payment link
        </Button>
        <Button variant="secondary">Cancel order</Button>
      </div>
    </div>
  );
}

/** Products page banner (03.04): amber, gauge icon, slots left, usage meter, Compare plans. */
export function PlanUsageBanner({
  used,
  limit,
  className,
}: {
  used: number;
  limit: number;
  className?: string;
}) {
  const left = Math.max(0, limit - used);
  const pct = Math.min(100, (used / limit) * 100);
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[10px] bg-attention-soft px-4 py-3 text-[#6E4A0E]',
        className,
      )}
    >
      <Gauge className="size-[18px] shrink-0 text-warning" aria-hidden />
      <div className="flex min-w-0 flex-1 basis-60 flex-col gap-0.5">
        <p className="text-[13px]/[19px] font-semibold">
          {left} product slot{left === 1 ? '' : 's'} left on the {PLANS.FREE.name} plan
        </p>
        <p className="text-xs">
          Starter holds {PLANS.STARTER.limits.maxProducts} products, adds discounts and removes
          Ojara branding — {formatKobo(PLANS.STARTER.priceKobo)}/month.
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Products used"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        className="h-1.5 w-[120px] overflow-hidden rounded-[3px] bg-[#E9D7B0]"
      >
        <div className="h-full rounded-[3px] bg-warning" style={{ width: `${pct}%` }} />
      </div>
      <Link href="/settings/billing" className="text-[13px]/[19px] font-semibold">
        Compare plans
      </Link>
    </div>
  );
}

/** Plan limit · product cap reached: amber icon box, plan tiles (Starter selected), actions. */
export function PlanLimitCard({ limit, className }: { limit: number; className?: string }) {
  const tiles = [
    {
      key: 'STARTER' as const,
      detail: `${PLANS.STARTER.limits.maxProducts} products · custom domain`,
      selected: true,
    },
    { key: 'PROFESSIONAL' as const, detail: 'Unlimited* · staff accounts', selected: false },
  ];
  return (
    <section
      className={cn(
        'flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-[22px]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-attention-soft text-warning">
          <PackagePlus className="size-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[15px]/[21px] font-semibold">
            You’ve used all {limit} products on {PLANS.FREE.name}
          </h2>
          <p className="text-[13px]/[19px] text-fg-muted">
            Your published products stay live. To add more, archive one or upgrade.
          </p>
        </div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {tiles.map((t) => (
          <div
            key={t.key}
            className={cn(
              'flex flex-col gap-0.5 rounded-md p-3',
              t.selected
                ? 'border-[1.5px] border-forest bg-selected'
                : 'border border-line bg-surface',
            )}
          >
            <span className="flex items-center justify-between text-[13px]/[19px] font-semibold">
              {PLANS[t.key].name}
              <span>{formatKobo(PLANS[t.key].priceKobo)}/mo</span>
            </span>
            <span className="text-xs text-fg-muted">{t.detail}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" asChild>
          <Link href="/products?status=PUBLISHED">
            <Archive /> Archive a product
          </Link>
        </Button>
        <Button asChild>
          <Link href="/settings/billing">
            <ArrowUpRight /> Upgrade to Starter
          </Link>
        </Button>
      </div>
    </section>
  );
}
