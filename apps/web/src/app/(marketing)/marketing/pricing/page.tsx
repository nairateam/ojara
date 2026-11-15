import { formatKobo, PLAN_KEYS, PLANS } from '@ojara/shared';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Pricing' };

/** 01.04 Pricing — PLACEHOLDER: plan cards driven by the shared PLANS constants (Starter dark). */
export default function PricingPage() {
  return (
    <section className="flex flex-col items-center gap-10 px-4 py-14 md:px-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-bold tracking-eyebrow text-warning uppercase">Pricing</span>
        <h1 className="font-display text-[36px] font-semibold tracking-[-1.2px] md:text-[56px] md:leading-[59px]">
          Simple prices in naira
        </h1>
        <p className="text-lg text-fg-lead">
          Ojara takes no cut of your sales. Paystack fees are separate.
        </p>
      </div>
      <div className="grid w-full max-w-[1080px] gap-5 md:grid-cols-3">
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const dark = key === 'STARTER';
          return (
            <article
              key={key}
              className={cn(
                'flex flex-col gap-3 rounded-xl p-7',
                dark ? 'bg-forest text-paper' : 'border border-line bg-surface',
              )}
            >
              <h2 className="font-display text-2xl font-semibold">{plan.name}</h2>
              <p className={cn('text-sm', dark ? 'text-fg-on-dark' : 'text-fg-muted')}>
                {plan.tagline}
              </p>
              <p className="font-display text-[40px] font-semibold tracking-[-1px]">
                {formatKobo(plan.priceKobo)}
                <span
                  className={cn(
                    'ml-1 text-sm font-normal',
                    dark ? 'text-fg-on-dark' : 'text-fg-muted',
                  )}
                >
                  {plan.priceKobo === 0 ? 'forever' : 'per month'}
                </span>
              </p>
              <p className={cn('text-sm', dark ? 'text-fg-on-dark' : 'text-fg-muted')}>
                Up to {plan.limits.maxProducts.toLocaleString('en-NG')} products
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
