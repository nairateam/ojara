'use client';

import { formatKobo, PLAN_KEYS, PLANS } from '@ojara/shared';
import { ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PLAN_CTAS } from '@/mock/marketing';
import { HOME_PLAN_BLURBS, HOME_PLAN_FEATURES, YEARLY_MONTHS_CHARGED } from '@/mock/site-home';
import { siteButton } from '../site-ui';

type Billing = 'monthly' | 'yearly';

/**
 * 08 Home › Pricing › Billing Toggle + Plans: monthly/yearly switch (yearly = ten months) and the
 * three plan cards, Starter dark with a "Most popular" badge. Prices come from `PLANS`.
 */
export function HomePricingPlans({ appOrigin }: { appOrigin: string }) {
  const [billing, setBilling] = useState<Billing>('monthly');
  const yearly = billing === 'yearly';

  return (
    <div className="flex flex-col items-center gap-10 md:gap-12">
      <div
        role="radiogroup"
        aria-label="Billing period"
        className="flex gap-1 rounded-full bg-surface-muted p-[5px]"
      >
        {(
          [
            ['monthly', 'Monthly'],
            ['yearly', 'Yearly · 2 months free'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={billing === value}
            onClick={() => setBilling(value)}
            className={cn(
              'rounded-full px-[18px] py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest',
              billing === value ? 'bg-forest text-paper' : 'text-fg-muted hover:text-forest',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="grid w-full gap-5 lg:grid-cols-3">
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const dark = key === 'STARTER';
          const price = yearly ? plan.priceKobo * YEARLY_MONTHS_CHARGED : plan.priceKobo;
          return (
            <li
              key={key}
              className={cn(
                'flex flex-col gap-7 rounded-[24px] p-7 md:rounded-[28px] md:p-9',
                dark ? 'bg-forest text-paper' : 'border border-line bg-surface text-forest',
              )}
            >
              <div className="flex min-h-[30px] items-center justify-between gap-3">
                <h3 className="font-display text-[22px] font-semibold">{plan.name}</h3>
                {dark ? (
                  <span className="rounded-full bg-paper px-3 py-1.5 text-[13px] font-semibold text-forest">
                    Most popular
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <p className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-[52px] leading-none font-semibold tracking-[-2.4px] md:text-[64px]">
                    {formatKobo(price)}
                  </span>
                  <span className={cn('text-[15px]', dark ? 'text-[#B9BEAD]' : 'text-fg-muted')}>
                    / {yearly ? 'year' : 'month'}
                  </span>
                </p>
                <p className={cn('text-base/[23px]', dark ? 'text-[#B9BEAD]' : 'text-fg-muted')}>
                  {HOME_PLAN_BLURBS[key]}
                </p>
              </div>

              <a
                href={`${appOrigin}/signup?plan=${key.toLowerCase()}`}
                className={cn(
                  siteButton(dark ? 'light' : 'outline'),
                  'w-full py-4',
                  !dark && 'border-forest/80',
                )}
              >
                {PLAN_CTAS[key]} <ArrowRight aria-hidden />
              </a>

              <ul
                className={cn(
                  'flex flex-col gap-3.5 border-t pt-7',
                  dark ? 'border-[#4A5245]' : 'border-line',
                )}
              >
                {HOME_PLAN_FEATURES[key].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px]">
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-[22px] shrink-0 items-center justify-center rounded-full',
                        dark ? 'bg-[#434B3E]' : 'bg-surface-muted',
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
