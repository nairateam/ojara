'use client';

import { formatKobo } from '@ojara/shared';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { YEARLY_MONTHS_CHARGED } from '@/mock/site-pricing';

/**
 * Monthly / yearly billing state for the Pricing page (09). The provider wraps the server-rendered
 * page; only the toggle and the price leaves read it.
 */

type Period = 'monthly' | 'yearly';

const BillingContext = createContext<{ period: Period; setPeriod: (p: Period) => void }>({
  period: 'monthly',
  setPeriod: () => {},
});

export function BillingProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>('monthly');
  return <BillingContext value={{ period, setPeriod }}>{children}</BillingContext>;
}

/** Hero "Billing Toggle": Monthly | Yearly + "2 months free". */
export function BillingToggle() {
  const { period, setPeriod } = useContext(BillingContext);
  const option = (value: Period, label: ReactNode) => (
    <button
      type="button"
      aria-pressed={period === value}
      onClick={() => setPeriod(value)}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper',
        period === value ? 'bg-paper text-forest' : 'text-paper hover:bg-paper/8',
      )}
    >
      {label}
    </button>
  );
  return (
    <div
      role="group"
      aria-label="Billing period"
      className="flex gap-1 rounded-full bg-paper/12 p-[5px]"
    >
      {option('monthly', 'Monthly')}
      {option(
        'yearly',
        <>
          Yearly
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              period === 'yearly' ? 'bg-forest/10' : 'bg-paper/16',
            )}
          >
            2 months free
          </span>
        </>,
      )}
    </div>
  );
}

/** Price + period suffix for a plan, following the toggle. */
export function PlanPrice({
  monthlyKobo,
  valueClassName,
  perClassName,
  short = false,
}: {
  monthlyKobo: number;
  valueClassName?: string;
  perClassName?: string;
  /** "/ mo" instead of "/ month" (comparison table). */
  short?: boolean;
}) {
  const { period } = useContext(BillingContext);
  const yearly = period === 'yearly';
  return (
    <>
      <span className={valueClassName}>
        {formatKobo(yearly ? monthlyKobo * YEARLY_MONTHS_CHARGED : monthlyKobo)}
      </span>
      <span className={perClassName}>
        {yearly ? (short ? '/ yr' : '/ year') : short ? '/ mo' : '/ month'}
      </span>
    </>
  );
}

/** Comparison table caption: "Prices per month, billed monthly" or the yearly equivalent. */
export function BillingCaption() {
  const { period } = useContext(BillingContext);
  return period === 'yearly'
    ? 'Prices per year, billed yearly (2 months free)'
    : 'Prices per month, billed monthly';
}
