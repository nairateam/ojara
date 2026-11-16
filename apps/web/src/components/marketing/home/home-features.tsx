import { formatKobo } from '@ojara/shared';
import { CircleCheck, Link2 } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FEATURED_STORE } from '@/mock/marketing';
import {
  BENTO_CHANNELS,
  BENTO_ORDERS,
  BENTO_PAYOUT,
  BENTO_STOCK,
  type StockLevel,
} from '@/mock/site-home';
import { HomeSection, HomeSectionHeading } from './section-heading';

/** Card shell + caption shared by the five bento tiles. */
function BentoCard({
  title,
  body,
  tone = 'light',
  className,
  children,
}: {
  title: string;
  body: string;
  tone?: 'light' | 'muted' | 'dark';
  className?: string;
  children: ReactNode;
}) {
  const dark = tone === 'dark';
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-[24px] md:rounded-[28px]',
        tone === 'light' && 'border border-line bg-surface',
        tone === 'muted' && 'bg-surface-muted',
        dark && 'bg-forest',
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 px-6 pt-6 md:px-8 md:pt-7">
        <h3
          className={cn(
            'font-display text-[22px] font-semibold tracking-[-0.8px] md:text-[26px]',
            dark ? 'text-paper' : 'text-forest',
          )}
        >
          {title}
        </h3>
        <p className={cn('text-base/6', dark ? 'text-paper/70' : 'text-fg-muted')}>{body}</p>
      </div>
      {children}
    </article>
  );
}

const STOCK_TONE: Record<StockLevel, string> = {
  low: 'text-warning',
  out: 'text-danger',
  ok: 'text-fg-muted',
};

/**
 * 08 Home › Features Bento ("Everything a stall needs."): storefront screenshots, the order list,
 * payouts, stock and share-link tiles.
 */
export function HomeFeatures() {
  return (
    <HomeSection id="features-heading" className="flex flex-col gap-10 md:gap-14">
      <HomeSectionHeading
        id="features-heading"
        align="center"
        eyebrow="What you get"
        line1="Everything a stall needs."
        line2="Nothing it doesn’t."
        lead="Five tools that replace the notebook, the calculator and two hundred unread DMs."
      />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          <BentoCard
            title="A store that looks like you"
            body="Your logo, your colours, your web address. Built to sell on the phones your customers actually use."
            className="lg:h-[560px] lg:flex-1"
          >
            <div aria-hidden className="mt-auto flex items-end gap-[2.4%] pt-7 pl-6 md:pl-8">
              <div className="relative aspect-[620/360] w-[75.6%] overflow-hidden rounded-t-[10px] border border-b-0 border-line bg-white md:rounded-t-[14px]">
                <Image
                  src="/marketing/storefront-desktop.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 620px, 75vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="w-[22%] rounded-t-[18px] bg-[#262B23] px-1 pt-1 md:rounded-t-[26px] md:px-[7px] md:pt-[7px]">
                <div className="relative aspect-[166/363] overflow-hidden rounded-t-[14px] md:rounded-t-[20px]">
                  <Image
                    src="/marketing/storefront-mobile.png"
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 166px, 22vw"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            tone="dark"
            title="Every order, one list"
            body="Paid and delivery status side by side — nothing slips through the cracks."
            className="pb-6 lg:h-[560px] lg:w-[440px] lg:shrink-0"
          >
            <ul aria-hidden className="flex flex-col gap-2.5 px-4 pt-7 md:px-6">
              {BENTO_ORDERS.map((o, i) => {
                const first = i === 0;
                return (
                  <li
                    key={o.name}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3.5',
                      first ? 'bg-paper' : 'bg-paper/8',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        first ? 'bg-forest text-paper' : 'bg-paper/12 text-paper',
                      )}
                    >
                      {o.initials}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        className={cn(
                          'truncate text-[15px] font-semibold',
                          first ? 'text-forest' : 'text-paper',
                        )}
                      >
                        {o.name}
                      </span>
                      <span className={cn('text-xs', first ? 'text-fg-muted' : 'text-paper/60')}>
                        {o.status}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'font-display text-base font-semibold',
                        first ? 'text-forest' : 'text-paper',
                      )}
                    >
                      {formatKobo(o.amountKobo)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </BentoCard>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <BentoCard
            title="Paid properly"
            body="Card, transfer or USSD through Paystack. In your bank the next business day."
            className="lg:h-[420px]"
          >
            <div aria-hidden className="px-6 py-6 md:px-8 md:py-[26px]">
              <div className="flex flex-col gap-1.5 rounded-[20px] bg-paper p-5">
                <span className="text-[13px] text-fg-muted">{BENTO_PAYOUT.label}</span>
                <span className="font-display text-[34px] font-semibold tracking-[-1.6px] text-forest md:text-[40px]">
                  {formatKobo(BENTO_PAYOUT.amountKobo)}
                </span>
                <span className="flex items-center gap-2 text-[13px] text-fg-muted">
                  <CircleCheck className="size-4 text-success" />
                  {BENTO_PAYOUT.note}
                </span>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            title="Stock that keeps itself honest"
            body="Sold items come off automatically. A nudge before your best size runs out."
            className="lg:h-[420px]"
          >
            <ul aria-hidden className="flex flex-col gap-2.5 px-6 py-6 md:px-8 md:py-[26px]">
              {BENTO_STOCK.map((s) => (
                <li key={s.name} className="flex flex-col gap-2 rounded-[14px] bg-paper px-4 py-3">
                  <span className="flex justify-between gap-3">
                    <span className="text-sm font-semibold text-forest">{s.name}</span>
                    <span className={cn('text-[13px] font-semibold', STOCK_TONE[s.level])}>
                      {s.left > 0 ? `${s.left} left` : 'Sold out'}
                    </span>
                  </span>
                  <span className="h-1 rounded-sm bg-line">
                    <span
                      style={{ width: `${s.percent}%` }}
                      className="block h-1 min-w-0.5 rounded-sm bg-forest"
                    />
                  </span>
                </li>
              ))}
            </ul>
          </BentoCard>

          <BentoCard
            tone="muted"
            title="One link, everywhere"
            body="Your Instagram bio, WhatsApp status and DMs — customers tap, pick, pay."
            className="md:col-span-2 lg:col-span-1 lg:h-[420px]"
          >
            <div aria-hidden className="flex flex-col gap-3 px-6 py-6 md:px-8 md:py-[26px]">
              <span className="flex items-center gap-2.5 rounded-full bg-surface py-3.5 pr-3.5 pl-4">
                <Link2 className="size-4 shrink-0 text-fg-muted" />
                <span className="flex-1 truncate text-[15px] font-medium text-forest">
                  {FEATURED_STORE.host}
                </span>
                <span className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper">
                  Copy
                </span>
              </span>
              <span className="flex flex-wrap gap-2">
                {BENTO_CHANNELS.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-forest/30 px-3.5 py-[9px] text-[13px] font-semibold text-forest"
                  >
                    {c}
                  </span>
                ))}
              </span>
            </div>
          </BentoCard>
        </div>
      </div>
    </HomeSection>
  );
}
