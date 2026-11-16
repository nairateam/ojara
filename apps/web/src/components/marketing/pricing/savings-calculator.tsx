'use client';

import { formatKobo, PLANS } from '@ojara/shared';
import { Pencil } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { SAVINGS_CALCULATOR } from '@/mock/site-pricing';

const KOBO_PER_NAIRA = 100;
/** Keeps the maths inside safe integers (₦10bn a month is plenty). */
const MAX_NAIRA = 10_000_000_000;

function parseNaira(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Math.min(Number(digits), MAX_NAIRA) : 0;
}

/**
 * "The maths" calculator (09 Savings): editable monthly sales, then what a 10% marketplace, a 5%
 * social-commerce app and Ojara Starter's flat fee cost, and the yearly difference.
 */
export function SavingsCalculator() {
  const inputId = useId();
  const [naira, setNaira] = useState(SAVINGS_CALCULATOR.defaultSalesKobo / KOBO_PER_NAIRA);
  const salesKobo = naira * KOBO_PER_NAIRA;
  const starterKobo = PLANS.STARTER.priceKobo;

  const marketplaceKobo = Math.round((salesKobo * SAVINGS_CALCULATOR.marketplacePercent) / 100);
  const bars = [
    {
      label: `Marketplace · ${SAVINGS_CALCULATOR.marketplacePercent}% per sale`,
      kobo: marketplaceKobo,
      ours: false,
    },
    {
      label: `Social-commerce app · ${SAVINGS_CALCULATOR.socialAppPercent}% per sale`,
      kobo: Math.round((salesKobo * SAVINGS_CALCULATOR.socialAppPercent) / 100),
      ours: false,
    },
    { label: 'Ojara Starter · flat', kobo: starterKobo, ours: true },
  ];
  const max = Math.max(...bars.map((b) => b.kobo), 1);
  const keptYearly = Math.max(0, (marketplaceKobo - starterKobo) * 12);

  return (
    <div className="flex w-full flex-col gap-8 rounded-[28px] bg-surface p-6 md:p-10 lg:w-[680px] lg:shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-[15px] text-fg-muted">
          Monthly sales
        </label>
        <div className="flex items-center gap-2.5 rounded-full bg-paper py-2.5 pr-2.5 pl-5 focus-within:ring-2 focus-within:ring-forest/30">
          <span aria-hidden className="font-display text-xl font-semibold text-forest">
            ₦
          </span>
          <input
            id={inputId}
            inputMode="numeric"
            autoComplete="off"
            value={naira.toLocaleString('en-NG')}
            onChange={(e) => setNaira(parseNaira(e.target.value))}
            onFocus={(e) => e.target.select()}
            size={Math.max(4, naira.toLocaleString('en-NG').length)}
            className="-ml-2 min-w-0 bg-transparent font-display text-xl font-semibold text-forest outline-none"
          />
          <label
            htmlFor={inputId}
            className="flex size-[30px] shrink-0 cursor-text items-center justify-center rounded-full bg-surface-muted text-forest"
          >
            <Pencil aria-hidden className="size-3.5" />
            <span className="sr-only">Edit monthly sales</span>
          </label>
        </div>
      </div>

      <ul className="flex flex-col gap-[26px]">
        {bars.map((b) => (
          <li key={b.label} className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <span
                className={cn(
                  'text-[15px]',
                  b.ours ? 'font-semibold text-forest' : 'text-fg-muted',
                )}
              >
                {b.label}
              </span>
              <span className="font-display text-lg font-semibold tracking-[-0.5px] text-forest md:text-[22px]">
                {formatKobo(b.kobo)}
              </span>
            </div>
            <div className="h-3.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                style={{ width: `${(b.kobo / max) * 100}%` }}
                className={cn(
                  'h-full min-w-5 rounded-full transition-[width] duration-300',
                  b.ours ? 'bg-forest' : 'bg-[#B9BEAD]',
                )}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-8">
        <div className="flex flex-col gap-1">
          <span className="text-[15px] text-fg-muted">You keep, compared with a marketplace</span>
          <output
            htmlFor={inputId}
            aria-live="polite"
            className="font-display text-[32px]/[1.1] font-semibold tracking-[-1.4px] text-forest md:text-[40px]/[44px]"
          >
            {formatKobo(keptYearly)} a year
          </output>
        </div>
        <span className="text-[13px] text-fg-subtle">Paystack fees apply on all three</span>
      </div>
    </div>
  );
}
