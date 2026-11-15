import { formatKobo, PLAN_KEYS, PLANS } from '@ojara/shared';
import { Check, Minus } from 'lucide-react';
import type { Metadata } from 'next';
import { MarketingCtaFooter } from '@/components/marketing/marketing-footer';
import { Eyebrow, FaqList, GUTTER } from '@/components/marketing/primitives';
import { platformOrigin } from '@/lib/platform-url';
import { cn } from '@/lib/utils';
import { PLAN_CTAS, PLAN_FEATURES, PRICING_FAQ } from '@/mock/marketing';

export const metadata: Metadata = { title: 'Pricing' };

/**
 * 01.04 Pricing. Lives outside the (site) group because it ends with a dark CTA band and a
 * one-line footer instead of the standard footer.
 */
export default async function PricingPage() {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <>
      <main className="flex-1">
        <section
          aria-labelledby="pricing-heading"
          className={cn(
            'flex flex-col items-center gap-4 pt-10 pb-8 text-center md:pt-16 md:pb-10',
            GUTTER,
          )}
        >
          <Eyebrow className="text-warning">Pricing</Eyebrow>
          <h1
            id="pricing-heading"
            className="max-w-[820px] font-display text-[38px] leading-[40px] font-semibold tracking-[-1.2px] md:text-[56px] md:leading-[59px] md:tracking-[-1.6px]"
          >
            Start free. Pay when your business grows.
          </h1>
          <p className="max-w-[620px] text-base leading-6 text-fg-muted md:text-[17px] md:leading-[26px]">
            No setup fees and no cut of your sales. Paystack’s card and transfer fees are separate
            and go straight to Paystack.
          </p>
        </section>

        <section aria-label="Plans" className={cn('pt-6 pb-14', GUTTER)}>
          <ul className="grid gap-5 lg:grid-cols-3">
            {PLAN_KEYS.map((key) => {
              const plan = PLANS[key];
              const dark = key === 'STARTER';
              return (
                <li
                  key={key}
                  className={cn(
                    'flex flex-col gap-[18px] rounded-2xl p-7',
                    dark ? 'bg-forest text-paper' : 'border border-line bg-surface',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    {dark && (
                      <span className="rounded-pill bg-paper px-2.5 py-[3px] text-2xs font-bold text-forest">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="flex items-end gap-1.5">
                    <span className="font-display text-[44px] leading-none font-semibold tracking-[-1px]">
                      {formatKobo(plan.priceKobo)}
                    </span>
                    <span className={cn('text-sm', dark ? 'text-fg-on-dark' : 'text-fg-muted')}>
                      {plan.priceKobo === 0 ? 'forever' : 'per month'}
                    </span>
                  </p>
                  <p className={cn('text-sm', dark ? 'text-fg-on-dark' : 'text-fg-muted')}>
                    {plan.tagline}
                  </p>
                  <a
                    href={`${appOrigin}/signup?plan=${key.toLowerCase()}`}
                    className={cn(
                      'rounded-[10px] py-[13px] text-center text-[15px] font-semibold transition-colors',
                      dark
                        ? 'bg-paper text-forest hover:bg-paper/90'
                        : 'border border-forest bg-surface text-fg hover:bg-selected',
                    )}
                  >
                    {PLAN_CTAS[key]}
                  </a>
                  <ul className="flex flex-col gap-2.5 pt-2">
                    {PLAN_FEATURES[key].map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm">
                        {f.included ? (
                          <Check
                            aria-label="Included"
                            className={cn(
                              'size-4 shrink-0',
                              dark ? 'text-fg-on-dark' : 'text-success',
                            )}
                          />
                        ) : (
                          <Minus
                            aria-label="Not included"
                            className="size-4 shrink-0 text-fg-subtle"
                          />
                        )}
                        <span className={cn(!f.included && 'text-fg-muted')}>{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="pricing-faq-heading"
          className="mx-auto w-full max-w-[1200px] px-5 pt-6 pb-16 md:px-10 md:pb-[72px] xl:px-[120px]"
        >
          <h2
            id="pricing-faq-heading"
            className="font-display text-[28px] font-semibold tracking-[-0.6px] md:text-[32px]"
          >
            Questions sellers ask
          </h2>
          <FaqList items={PRICING_FAQ} size="md" />
        </section>
      </main>
      <MarketingCtaFooter appOrigin={appOrigin} />
    </>
  );
}
