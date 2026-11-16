import { PLAN_KEYS, PLANS, type PlanKey } from '@ojara/shared';
import { ArrowRight, Check, MessageCircle, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SUPPORT } from '@/mock/marketing';
import {
  BILLING_FAQ,
  PRICING_COMPARE,
  PRICING_PLAN_CARDS,
  type CompareCell,
} from '@/mock/site-pricing';
import { DisplayHeading, SITE_GUTTER, SiteButton, SiteEyebrow } from '../site-shell';
import { BillingCaption, BillingToggle, PlanPrice } from './billing';
import { SavingsCalculator } from './savings-calculator';

/** The highlighted plan (dark card, dark comparison column). */
const FEATURED: PlanKey = 'STARTER';

/* ------------------------------------------------------------------- Hero */

/** 09 Hero body (inside `SiteHero`): "0%" pill, heading, sub and the billing toggle. */
export function PricingHeroBody() {
  return (
    <div className="relative flex flex-col items-center gap-6 px-5 pt-16 pb-16 text-center md:gap-7 md:pt-24 md:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {[1100, 760].map((d) => (
          <span
            key={d}
            style={{ width: d, height: d }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/6"
          />
        ))}
      </div>
      <p className="inline-flex items-center gap-2.5 rounded-full bg-paper/12 py-[7px] pr-3.5 pl-2 text-left text-sm text-paper">
        <span className="rounded-full bg-paper px-2.5 py-[3px] text-[13px] font-semibold text-forest">
          0%
        </span>
        Commission on every plan, forever
      </p>
      <DisplayHeading
        as="h1"
        size="xl"
        tone="light"
        accentClassName="text-paper"
        line1="Flat monthly plans."
        line2="No cut of your sales."
      />
      <p className="max-w-[560px] text-base text-paper/80 md:text-lg/[27px]">
        Start free, upgrade when the orders pick up. Every plan includes Paystack checkout, your own
        store link and WhatsApp-ready product pages.
      </p>
      <BillingToggle />
    </div>
  );
}

/* ------------------------------------------------------------------ Plans */

function CheckDot({ dark, size = 'sm' }: { dark?: boolean; size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        size === 'md' ? 'size-6' : 'size-[22px]',
        dark ? 'bg-forest text-paper' : 'bg-surface-muted text-forest',
      )}
    >
      <Check aria-hidden strokeWidth={2.5} className="size-3" />
    </span>
  );
}

/** 09 Plans Section: three plan cards (Starter dark) and the Paystack fee note. */
export function PlanCards({ appOrigin }: { appOrigin: string }) {
  return (
    <section
      aria-label="Plans"
      className={cn('flex flex-col gap-7 pt-12 md:pt-[72px]', SITE_GUTTER)}
    >
      <ul className="grid gap-5 lg:grid-cols-3">
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const card = PRICING_PLAN_CARDS[key];
          const dark = key === FEATURED;
          return (
            <li
              key={key}
              className={cn(
                'flex flex-col gap-7 rounded-[28px] p-7 md:p-9 lg:min-h-[544px]',
                dark ? 'bg-forest text-paper' : 'bg-surface text-forest',
              )}
            >
              <div className="flex flex-col gap-7">
                <div className="flex min-h-[30px] items-center justify-between gap-3">
                  <h2 className="font-display text-[22px] font-semibold">{plan.name}</h2>
                  {dark ? (
                    <span className="rounded-full bg-paper px-3 py-1.5 text-[13px] font-semibold text-forest">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <p className="flex flex-wrap items-baseline gap-2">
                  <PlanPrice
                    monthlyKobo={plan.priceKobo}
                    valueClassName="font-display text-[48px]/[1] font-semibold tracking-[-2.4px] sm:text-[64px]/[64px] lg:text-[52px] xl:text-[64px]"
                    perClassName={cn('text-[15px]', dark ? 'text-[#B9BEAD]' : 'text-fg-muted')}
                  />
                </p>
                <p className={cn('text-base/[23px]', dark ? 'text-[#B9BEAD]' : 'text-fg-muted')}>
                  {card.description}
                </p>
              </div>
              <SiteButton
                href={`${appOrigin}/signup?plan=${key.toLowerCase()}`}
                variant={dark ? 'light' : 'outline'}
                className="w-full py-4"
              >
                {card.cta} <ArrowRight aria-hidden />
              </SiteButton>
              <hr className={cn('border-0 border-t', dark ? 'border-[#4A5245]' : 'border-line')} />
              <ul className="flex flex-col gap-3.5">
                {card.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px]">
                    <span
                      className={cn(
                        'inline-flex size-[22px] shrink-0 items-center justify-center rounded-full',
                        dark ? 'bg-[#434B3E] text-paper' : 'bg-surface-muted text-forest',
                      )}
                    >
                      <Check aria-hidden strokeWidth={2.5} className="size-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <p className="text-center text-sm text-fg-subtle">
        Paystack’s standard processing fee applies on each payment. Ojara never takes a commission.
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------- Compare */

function CellValue({ value, featured }: { value: CompareCell; featured: boolean }) {
  if (value === true)
    return (
      <>
        <CheckDot dark={featured} size="md" />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <span aria-hidden className="inline-block h-[1.5px] w-3 bg-[#B9BEAD] align-middle" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-[15px] font-medium">{value}</span>;
}

/** 09 Compare: heading row and the side-by-side table (scrolls sideways on phones). */
export function CompareTable() {
  const lastGroup = PRICING_COMPARE.length - 1;
  const featuredCell = (key: PlanKey) => (key === FEATURED ? 'bg-surface-muted' : '');
  const labelCell = 'sticky left-0 z-10 bg-paper pr-4 text-left';

  return (
    <section
      aria-labelledby="compare-heading"
      className={cn('flex flex-col gap-10 pt-20 md:gap-12 md:pt-[120px]', SITE_GUTTER)}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-[18px]">
          <SiteEyebrow>Compare plans</SiteEyebrow>
          <DisplayHeading
            line1={<span id="compare-heading">Everything, side by side.</span>}
            line2="No small print."
          />
        </div>
        <p className="max-w-[340px] text-base/6 text-fg-muted">
          Switch plans whenever you like. Upgrades apply straight away; downgrades at the end of
          your billing month.
        </p>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[680px] border-collapse text-forest">
          <colgroup>
            <col className="w-[34%]" />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-forest">
              <th
                scope="col"
                className={cn(labelCell, 'pb-6 align-bottom text-sm font-normal text-fg-subtle')}
              >
                <BillingCaption />
              </th>
              {PLAN_KEYS.map((key) => {
                const featured = key === FEATURED;
                return (
                  <th
                    key={key}
                    scope="col"
                    className={cn(
                      'px-4 pt-7 pb-6 text-center align-bottom font-normal md:px-6',
                      featured && 'rounded-t-[20px] bg-forest text-paper',
                    )}
                  >
                    <span className="block font-display text-lg font-semibold md:text-xl">
                      {PLANS[key].name}
                    </span>
                    <span className="mt-1.5 flex items-baseline justify-center gap-1.5 whitespace-nowrap">
                      <PlanPrice
                        short
                        monthlyKobo={PLANS[key].priceKobo}
                        valueClassName="font-display text-[26px]/[1] font-semibold tracking-[-1.2px] md:text-[34px]/[34px]"
                        perClassName={cn('text-sm', featured ? 'text-[#B9BEAD]' : 'text-fg-muted')}
                      />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          {PRICING_COMPARE.map((group, gi) => (
            <tbody key={group.group}>
              <tr className="h-[76px]">
                <th
                  scope="colgroup"
                  className={cn(
                    labelCell,
                    'pb-3.5 align-bottom text-[13px] font-semibold tracking-[1.3px] uppercase',
                  )}
                >
                  {group.group}
                </th>
                {PLAN_KEYS.map((key) => (
                  <td key={key} className={featuredCell(key)} />
                ))}
              </tr>
              {group.rows.map((row, ri) => {
                const last = gi === lastGroup && ri === group.rows.length - 1;
                return (
                  <tr key={row.label} className="h-[61.5px] border-t border-line">
                    <th
                      scope="row"
                      className={cn(labelCell, 'py-3 text-[15px] font-normal md:text-base')}
                    >
                      {row.label}
                    </th>
                    {PLAN_KEYS.map((key, i) => (
                      <td
                        key={key}
                        className={cn(
                          'px-4 py-3 text-center',
                          featuredCell(key),
                          last && key === FEATURED && 'rounded-b-[20px]',
                        )}
                      >
                        <CellValue value={row.cells[i] ?? false} featured={key === FEATURED} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Savings */

/** 09 Savings: "Keep what you earn." copy and the calculator. */
export function SavingsSection() {
  return (
    <section
      aria-labelledby="savings-heading"
      className={cn(
        'flex flex-col gap-10 pt-24 md:pt-[140px] lg:flex-row lg:items-center lg:gap-20',
        SITE_GUTTER,
      )}
    >
      <div className="flex flex-1 flex-col gap-6">
        <SiteEyebrow>The maths</SiteEyebrow>
        <DisplayHeading
          line1={<span id="savings-heading">Keep what you earn.</span>}
          line2="Not ten percent less."
        />
        <p className="max-w-[520px] text-base text-fg-muted md:text-lg/[27px]">
          Marketplaces take a slice of every sale, so the busier you get, the more you pay. Ojara is
          one flat fee — a good month stays a good month.
        </p>
      </div>
      <SavingsCalculator />
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */

/** 09 FAQ: "Money talk, plainly answered." with WhatsApp CTA and native accordions. */
export function BillingFaq() {
  return (
    <section
      aria-labelledby="billing-faq-heading"
      className={cn('flex flex-col gap-10 pt-20 md:pt-[120px] lg:flex-row lg:gap-20', SITE_GUTTER)}
    >
      <div className="flex flex-col items-start gap-7 lg:w-[440px] lg:shrink-0">
        <div className="flex flex-col gap-[18px]">
          <SiteEyebrow>Billing questions</SiteEyebrow>
          <DisplayHeading
            line1={<span id="billing-faq-heading">Money talk,</span>}
            line2="plainly answered."
          />
        </div>
        <p className="text-base/[26px] text-fg-muted md:text-[17px]">
          Questions about a plan or an invoice? Message us on WhatsApp, 8am–8pm, every day.
        </p>
        <SiteButton href={SUPPORT.whatsapp} className="px-[22px] py-3.5">
          <MessageCircle aria-hidden /> Chat with us
        </SiteButton>
      </div>
      <div className="flex-1 border-t border-line lg:border-t-0">
        {BILLING_FAQ.map((item, i) => (
          <details key={item.q} open={i < 2} className="group border-b border-line py-6 md:py-7">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-xl font-medium tracking-[-0.5px] text-forest md:text-2xl">
                {item.q}
              </span>
              <span
                aria-hidden
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-forest transition group-open:border-forest group-open:bg-forest group-open:text-paper"
              >
                <Plus className="size-4 group-open:hidden" />
                <Minus className="hidden size-4 group-open:block" />
              </span>
            </summary>
            <p className="max-w-[720px] pt-3.5 pr-16 text-base/[26px] text-fg-muted md:text-[17px]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
