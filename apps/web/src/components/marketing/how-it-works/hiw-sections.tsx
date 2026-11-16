import { formatKobo } from '@ojara/shared';
import {
  ArrowDownRight,
  Bell,
  Check,
  CircleCheck,
  CreditCard,
  Link as LinkIcon,
  MessageCircle,
  Music2,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { InstagramIcon } from '@/components/storefront/instagram-icon';
import { cn } from '@/lib/utils';
import {
  HIW_CHAPTERS,
  HIW_CHECKOUT_POINTS,
  HIW_CHECKOUT_SUCCESS,
  HIW_INTEGRATIONS,
  HIW_ORDERS,
  HIW_ORDERS_POINTS,
  HIW_PAYOUT,
  HIW_SHARE,
  HIW_STOCK,
  HIW_STOCK_POINTS,
  HIW_STOREFRONT_POINTS,
} from '@/mock/site-how-it-works';
import { DisplayHeading, SITE_GUTTER, SiteEyebrow } from '../site-shell';

const pad = (n: number) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------- Hero */

/** 10 Hero body (inside `SiteHero`): eyebrow, heading and the six-chapter index. */
export function HowItWorksHeroBody() {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-12 pt-16 pb-12 md:pt-[110px] md:pb-[72px] lg:flex-row lg:items-end lg:justify-between',
        SITE_GUTTER,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[-200px] -z-10 size-[900px] -translate-y-1/2 rounded-full border border-paper/6"
      />
      <div className="flex flex-col gap-7">
        <SiteEyebrow tone="light" className="text-paper/70">
          How it works
        </SiteEyebrow>
        <DisplayHeading
          as="h1"
          size="xl"
          tone="light"
          accentClassName="text-paper"
          line1="The whole shop,"
          line2="in one link."
        />
        <p className="max-w-[520px] text-base text-paper/80 md:text-lg/[27px]">
          Six parts that replace the notebook, the calculator and the hundred unread DMs. Here’s
          what each one does, and why sellers stay.
        </p>
      </div>
      <nav aria-label="Chapters" className="w-full lg:w-[420px] lg:shrink-0">
        <ol>
          {HIW_CHAPTERS.map((c, i) => (
            <li key={c.id} className="border-b border-paper/12">
              <a
                href={`#${c.id}`}
                className={cn(
                  'flex items-center gap-[18px] py-4 text-paper transition-opacity hover:opacity-100',
                  i === 0 ? 'opacity-100' : 'opacity-60',
                )}
              >
                <span className="w-7 font-accent text-2xl italic">{pad(i + 1)}</span>
                <span className="flex-1 font-display text-xl font-medium tracking-[-0.6px] md:text-[22px]">
                  {c.title}
                </span>
                <ArrowDownRight aria-hidden className="size-[18px]" />
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------- Shared bits */

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3.5 pt-1.5">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-3 text-[15px]/[22px] text-forest">
          <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-surface-muted">
            <Check aria-hidden strokeWidth={2.5} className="size-3" />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Chapter copy column: big italic number, two-line heading, description, check points. */
function ChapterCopy({
  n,
  id,
  line1,
  line2,
  body,
  points,
}: {
  n: number;
  id: string;
  line1: string;
  line2: string;
  body: string;
  points: string[];
}) {
  return (
    <div className="flex flex-col gap-6 lg:w-[420px] lg:shrink-0">
      <span
        aria-hidden
        className="font-accent text-[56px]/[1] text-fg-subtle italic md:text-[72px]"
      >
        {pad(n)}
      </span>
      <DisplayHeading size="sm" line1={<span id={`${id}-heading`}>{line1}</span>} line2={line2} />
      <p className="text-base/[26px] text-fg-muted md:text-[17px]">{body}</p>
      <CheckList items={points} />
    </div>
  );
}

function Chapter({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn('scroll-mt-6 pt-20 md:pt-[130px]', className)}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------- 01 · Storefront */

/** 10 Chapter 01 · Storefront: copy + desktop and phone storefront screenshots. */
export function StorefrontChapter() {
  return (
    <Chapter
      id="storefront"
      className={cn('flex flex-col gap-10 lg:flex-row lg:items-center', SITE_GUTTER)}
    >
      <ChapterCopy
        n={1}
        id="storefront"
        line1="A store that"
        line2="looks like you."
        body="Drop in your logo and colours, and add products straight from your phone’s camera roll. It’s ready to share in under ten minutes."
        points={HIW_STOREFRONT_POINTS}
      />
      <div className="flex h-[300px] min-w-0 flex-1 items-end justify-center gap-5 overflow-hidden rounded-[28px] bg-surface-muted px-5 pt-10 sm:h-[420px] lg:h-[540px] lg:pt-14 lg:pl-8">
        <div className="relative hidden aspect-[620/360] w-[620px] max-w-[78%] shrink overflow-hidden rounded-t-[14px] shadow-[0_-4px_24px_#333A2F14] sm:block">
          <Image
            src="/marketing/storefront-desktop.png"
            alt="An Ojara storefront on desktop: product page for an Adire wrap dress"
            fill
            sizes="(min-width: 1024px) 620px, 70vw"
            className="object-cover object-top"
          />
        </div>
        <div className="w-[180px] shrink-0 rounded-t-[26px] bg-[#262B23] px-[7px] pt-[7px]">
          <div className="relative h-[260px] overflow-hidden rounded-t-[20px] sm:h-[363px]">
            <Image
              src="/marketing/storefront-mobile.png"
              alt="The same Ojara storefront on a phone"
              fill
              sizes="166px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </Chapter>
  );
}

/* --------------------------------------------------------- 02 · Checkout */

/** 10 Chapter 02 · Checkout: forest card with rings, points and the Paystack checkout phone. */
export function CheckoutChapter() {
  return (
    <Chapter id="checkout" className="px-2 md:px-3.5">
      <div className="relative isolate flex flex-col gap-14 overflow-hidden rounded-[24px] bg-forest px-5 py-14 text-paper md:rounded-[32px] md:px-10 md:py-20 lg:min-h-[720px] lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-20 lg:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {[360, 540, 720, 900, 1080].map((d) => (
            <span
              key={d}
              style={{ width: d, height: d }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/6 lg:left-[72%]"
            />
          ))}
        </div>
        <div className="flex flex-col gap-[26px] lg:w-[560px]">
          <SiteEyebrow tone="light" className="text-paper/70">
            02 · Checkout
          </SiteEyebrow>
          <DisplayHeading
            tone="light"
            accentClassName="text-paper/70"
            line1={<span id="checkout-heading">They tap pay.</span>}
            line2="You wake up paid."
          />
          <ul className="flex flex-col gap-[26px]">
            {HIW_CHECKOUT_POINTS.map((p) => (
              <li key={p.title} className="flex items-start gap-3.5">
                <span className="mt-0.5 inline-flex size-[26px] shrink-0 items-center justify-center rounded-full bg-paper/12">
                  <Check aria-hidden strokeWidth={2.5} className="size-3.5" />
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-[17px] font-semibold">{p.title}</span>
                  <span className="text-[15px] text-paper/70">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-[250px] shrink-0 sm:w-[290px] lg:mr-[110px]">
          <div className="rounded-[42px] bg-[#262B23] p-[9px]">
            <div className="relative aspect-[272/582] overflow-hidden rounded-[34px]">
              <Image
                src="/marketing/checkout-mobile.png"
                alt="Ojara checkout on a phone: delivery details and the Paystack pay button"
                fill
                sizes="290px"
                className="object-cover object-top"
              />
            </div>
          </div>
          <div className="absolute top-[46%] left-[-24px] flex w-[260px] flex-col gap-2 rounded-[22px] bg-surface p-5 text-forest shadow-[0_20px_50px_#0000004D] sm:left-[-150px] sm:w-[300px]">
            <p className="flex items-center gap-2.5 text-base font-semibold">
              <span className="inline-flex size-[30px] items-center justify-center rounded-full bg-success text-paper">
                <Check aria-hidden strokeWidth={2.5} className="size-4" />
              </span>
              Payment successful
            </p>
            <p className="text-sm/5 text-fg-muted">
              {formatKobo(HIW_CHECKOUT_SUCCESS.amountKobo)} from {HIW_CHECKOUT_SUCCESS.customer} is
              on its way to your bank.
            </p>
          </div>
          <p className="absolute top-[52px] right-[-12px] inline-flex items-center gap-2 rounded-full bg-[#4A5245] px-4 py-2.5 text-sm font-medium whitespace-nowrap sm:right-[-80px]">
            <ShieldCheck aria-hidden className="size-4" />
            Secured by Paystack
          </p>
        </div>
      </div>
    </Chapter>
  );
}

/* ----------------------------------------------------------- 03 · Orders */

/** 10 Chapter 03 · Orders: forest panel with the sample order list, then copy. */
export function OrdersChapter() {
  return (
    <Chapter
      id="orders"
      className={cn(
        'flex flex-col-reverse gap-10 lg:flex-row lg:items-center lg:gap-[72px]',
        SITE_GUTTER,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-center rounded-[28px] bg-forest px-5 py-14 lg:h-[540px]">
        <ul aria-label="Sample orders" className="flex w-full max-w-[460px] flex-col gap-2.5">
          {HIW_ORDERS.map((o, i) => {
            const first = i === 0;
            return (
              <li
                key={o.name}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3.5',
                  first ? 'bg-paper text-forest' : 'bg-paper/8 text-paper',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-[34px] shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    first ? 'bg-forest text-paper' : 'bg-paper/12',
                  )}
                >
                  {o.initials}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-semibold">{o.name}</span>
                  <span className={cn('text-xs', first ? 'text-fg-muted' : 'text-paper/60')}>
                    {o.status}
                  </span>
                </span>
                <span className="font-display text-base font-semibold">
                  {formatKobo(o.amountKobo)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <ChapterCopy
        n={3}
        id="orders"
        line1="Every order,"
        line2="one calm list."
        body="Every order from your store lands in one inbox with the customer, the items and the payment status side by side. No more scrolling chats to find who paid."
        points={HIW_ORDERS_POINTS}
      />
    </Chapter>
  );
}

/* ------------------------------------------------------------ 04 · Stock */

const STOCK_TONE = { low: 'text-[#A86A12]', out: 'text-[#B93A28]', ok: 'text-fg-muted' } as const;

/** 10 Chapter 04 · Stock: copy, then stock levels with a low-stock nudge. */
export function StockChapter() {
  const low = HIW_STOCK.find((s) => s.tone === 'low');
  return (
    <Chapter
      id="stock"
      className={cn('flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-[72px]', SITE_GUTTER)}
    >
      <ChapterCopy
        n={4}
        id="stock"
        line1="Stock that keeps"
        line2="itself honest."
        body="When an order is paid, the count goes down. When something runs low, you see it before a customer does."
        points={HIW_STOCK_POINTS}
      />
      <div className="flex min-w-0 flex-1 items-center justify-center rounded-[28px] bg-surface-muted px-5 pt-24 pb-14 lg:h-[540px] lg:py-0">
        <div className="relative w-full max-w-[480px]">
          {low ? (
            <div className="absolute -top-16 right-0 flex w-[min(330px,100%)] items-center gap-3 rounded-[18px] bg-forest px-4 py-3.5 text-paper shadow-[0_16px_40px_#333A2F33] sm:-right-6 sm:-top-10">
              <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-paper/12">
                <Bell aria-hidden className="size-4" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold">{low.name} is running low</span>
                <span className="text-xs text-[#B9BEAD]">{low.left} left · tap to restock</span>
              </span>
            </div>
          ) : null}
          <ul
            aria-label="Sample stock levels"
            className="flex flex-col gap-2.5 rounded-[24px] bg-surface px-5 py-8 sm:px-8"
          >
            {HIW_STOCK.map((s) => (
              <li key={s.name} className="flex flex-col gap-2 rounded-[14px] bg-paper px-4 py-3">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-forest">{s.name}</span>
                  <span className={cn('text-[13px] font-semibold', STOCK_TONE[s.tone])}>
                    {s.left === 0 ? 'Sold out' : `${s.left} left`}
                  </span>
                </span>
                <span className="h-1 overflow-hidden rounded-sm bg-line">
                  <span
                    style={{ width: `${s.level * 100}%` }}
                    className="block h-full min-w-0.5 rounded-sm bg-forest"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Chapter>
  );
}

/* ------------------------------------------------- 05 · Payouts, 06 · Share */

function SmallChapter({
  n,
  id,
  line1,
  line2,
  body,
  children,
}: {
  n: number;
  id: string;
  line1: string;
  line2: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="flex scroll-mt-6 flex-col gap-9 rounded-[28px] bg-surface-muted p-6 md:p-11 lg:min-h-[600px]"
    >
      <div className="flex flex-col gap-[18px]">
        <span
          aria-hidden
          className="font-accent text-[48px]/[1] text-fg-subtle italic md:text-[56px]"
        >
          {pad(n)}
        </span>
        <h2 className="flex flex-col">
          <span
            id={`${id}-heading`}
            className="font-display text-[30px]/[1.05] font-semibold tracking-[-1.4px] text-forest md:text-[38px]/[39px]"
          >
            {line1}
          </span>
          <span className="font-accent text-[34px]/[1.05] tracking-[-0.6px] text-fg-muted italic md:text-[44px]/[45px]">
            {line2}
          </span>
        </h2>
        <p className="max-w-[500px] text-base/[25px] text-fg-muted">{body}</p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[460px] rounded-[22px] bg-surface px-5 py-8 sm:px-8">
          {children}
        </div>
      </div>
    </section>
  );
}

/** 10 Chapters 05–06: payouts and sharing, side by side. */
export function PayoutsAndSharing() {
  return (
    <div className={cn('grid gap-5 pt-20 md:pt-[130px] lg:grid-cols-2', SITE_GUTTER)}>
      <SmallChapter
        n={5}
        id="payouts"
        line1="Paid properly,"
        line2="next business day."
        body="Card, transfer or USSD through Paystack. Money settles into your Nigerian bank account — no chasing screenshots of transfers."
      >
        <div className="flex flex-col gap-1.5 rounded-[20px] bg-paper p-5">
          <span className="text-[13px] text-fg-muted">{HIW_PAYOUT.label}</span>
          <span className="font-display text-[34px] font-semibold tracking-[-1.6px] text-forest md:text-[40px]">
            {formatKobo(HIW_PAYOUT.amountKobo)}
          </span>
          <span className="flex items-center gap-2 text-[13px] text-fg-muted">
            <CircleCheck aria-hidden className="size-4 text-success" />
            {HIW_PAYOUT.note}
          </span>
        </div>
      </SmallChapter>
      <SmallChapter
        n={6}
        id="sharing"
        line1="One link,"
        line2="everywhere you sell."
        body="Your Instagram bio, WhatsApp status and DMs all point to the same store, so customers can browse, pick and pay without asking."
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-3.5">
            <LinkIcon aria-hidden className="size-4 shrink-0 text-forest" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-forest">
              {HIW_SHARE.host}
            </span>
            <span className="rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-paper">
              Copy
            </span>
          </div>
          <ul className="flex flex-wrap gap-2">
            {HIW_SHARE.channels.map((c) => (
              <li
                key={c}
                className="rounded-full border border-line px-3.5 py-2 text-[13px] font-semibold text-forest"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </SmallChapter>
    </div>
  );
}

/* ----------------------------------------------------------- Integrations */

const INTEGRATION_ICON = {
  'credit-card': CreditCard,
  'message-circle': MessageCircle,
  instagram: InstagramIcon,
  music: Music2,
} as const;

/** 10 Integrations: "Plays well with" tiles (only what Ojara really works with). */
export function Integrations() {
  return (
    <section
      aria-labelledby="integrations-heading"
      className={cn('flex flex-col gap-10 pt-20 md:gap-12 md:pt-[130px]', SITE_GUTTER)}
    >
      <div className="flex flex-col items-center gap-[18px] text-center">
        <SiteEyebrow>Plays well with</SiteEyebrow>
        <DisplayHeading
          className="items-center"
          line1={<span id="integrations-heading">Keep the apps you use.</span>}
          line2="Lose the copy-pasting."
        />
      </div>
      <ul className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {HIW_INTEGRATIONS.map((t) => {
          const Icon = INTEGRATION_ICON[t.icon];
          return (
            <li key={t.name} className="flex flex-col gap-7 rounded-[22px] bg-surface p-5 md:p-6">
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-forest text-paper">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="font-display text-[19px] font-semibold text-forest">{t.name}</span>
                <span className="text-sm/5 text-fg-muted">{t.body}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
