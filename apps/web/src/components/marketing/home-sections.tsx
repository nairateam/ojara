import { formatKobo, PLAN_KEYS, PLANS } from '@ojara/shared';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Landmark,
  Play,
  Quote,
  ShieldCheck,
  ShoppingBag,
  Timer,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  DM_COMPARISON,
  DM_COMPARISON_MOBILE,
  HERO_ORDER,
  HERO_PAYOUT_KOBO,
  HOME_STEPS,
  MERCHANT_STORY,
  PLAN_TEASERS,
  SELLER_CATEGORIES,
  SHOWCASE_FEATURES,
} from '@/mock/marketing';
import { BrowserDots, Eyebrow, GUTTER, InitialTile, MarketingIcon } from './primitives';

/* ------------------------------------------------------------------------- Hero */

export function HomeHero({ appOrigin, demoStoreUrl }: { appOrigin: string; demoStoreUrl: string }) {
  return (
    <section aria-labelledby="hero-heading" className="px-3 md:px-10 md:pt-8">
      <div className="flex flex-col overflow-hidden rounded-[22px] bg-surface-muted md:rounded-2xl lg:h-[640px] lg:flex-row">
        <div className="flex flex-col justify-center gap-4 px-5 pt-7 pb-5 md:gap-[26px] md:px-12 md:py-14 lg:flex-1 lg:py-0 lg:pr-10 lg:pl-16">
          <span className="hidden w-fit items-center gap-2 rounded-pill bg-paper/60 px-3 py-1.5 text-ui font-semibold md:inline-flex">
            <span aria-hidden className="size-[7px] rounded-full bg-forest" />
            Built for Nigerian small businesses
          </span>
          <h1
            id="hero-heading"
            className="font-display text-4xl leading-[37px] font-semibold tracking-[-1px] md:text-[52px] md:leading-[54px] md:tracking-[-1.6px] xl:text-[64px] xl:leading-[64px] xl:tracking-[-2px]"
          >
            From DMs to a real store — in one afternoon.
          </h1>
          <p className="text-base leading-6 text-fg-lead md:max-w-[520px] md:text-lg md:leading-[27px]">
            <span className="md:hidden">
              Your own online store with Paystack payments, orders in one place and stock that
              updates itself.
            </span>
            <span className="hidden md:inline">
              Ojara gives your business its own online store, with Paystack payments, orders in one
              place and stock that updates itself. Start free — no card, no developer.
            </span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={`${appOrigin}/signup`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest py-[15px] text-[15px] font-semibold text-paper transition-colors hover:bg-forest/90 md:gap-2.5 md:px-[26px] md:py-4 md:text-base"
            >
              Create your free store
              <ArrowRight aria-hidden className="size-4 md:size-[18px]" />
            </a>
            <a
              href={demoStoreUrl}
              className="hidden items-center justify-center gap-2 rounded-lg px-[22px] py-[15px] text-base font-semibold text-fg ring-[1.5px] ring-forest ring-inset hover:bg-paper/40 md:inline-flex"
            >
              <Play aria-hidden className="size-[15px]" />
              See a live store
            </a>
          </div>
          <p className="text-ui font-medium text-fg-lead md:hidden">
            ₦0 to start · no card · live in ~10 min
          </p>
          <ul className="hidden flex-wrap gap-x-[22px] gap-y-2 text-sm font-medium text-fg-lead md:flex">
            <li className="flex items-center gap-[7px]">
              <BadgeCheck aria-hidden className="size-4" />
              ₦0 to start
            </li>
            <li className="flex items-center gap-[7px]">
              <Timer aria-hidden className="size-4" />
              Live in about 10 minutes
            </li>
            <li className="flex items-center gap-[7px]">
              <ShieldCheck aria-hidden className="size-4" />
              Payments by Paystack
            </li>
          </ul>
        </div>

        <div className="relative flex h-[300px] items-end p-3.5 md:h-[420px] lg:h-full lg:w-[42%] lg:p-0 xl:w-[600px]">
          <Image
            src="/mock/generated-14.jpg"
            alt="A smiling seller in her fabric shop holding a branded shopping bag and her phone"
            fill
            priority
            sizes="(min-width: 1280px) 600px, (min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
          <div className="relative flex w-full items-center gap-2.5 rounded-lg bg-paper px-3.5 py-3 shadow-[0_12px_30px_#333A2F33] md:gap-3 md:rounded-[14px] md:px-4 md:py-3.5 lg:absolute lg:top-[420px] lg:left-7 lg:w-[300px]">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted md:size-[38px]">
              <ShoppingBag aria-hidden className="size-[15px] md:size-[18px]" />
            </span>
            <span className="flex flex-col gap-px md:gap-0.5">
              <span className="text-ui font-semibold md:text-sm">
                {HERO_ORDER.title} · {formatKobo(HERO_ORDER.amountKobo)}
              </span>
              <span className="text-2xs text-fg-muted md:text-xs">
                {HERO_ORDER.customer}
                <span className="hidden md:inline"> · {HERO_ORDER.area}</span> · {HERO_ORDER.when}
              </span>
            </span>
          </div>
          <span className="absolute top-10 right-5 hidden items-center gap-2 rounded-pill bg-forest px-3.5 py-2.5 text-ui font-semibold text-paper shadow-[0_8px_20px_#333A2F33] lg:inline-flex">
            <Landmark aria-hidden className="size-3.5" />
            Payout sent · {formatKobo(HERO_PAYOUT_KOBO)}
          </span>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Sellers strip */

export function SellersStrip() {
  return (
    <section
      aria-label="Who sells on Ojara"
      className={cn('hidden flex-wrap items-center justify-center gap-3 py-9 md:flex', GUTTER)}
    >
      <p className="text-sm text-fg-muted">Made for people who sell</p>
      <ul className="contents">
        {SELLER_CATEGORIES.map((c) => (
          <li
            key={c.label}
            className="flex items-center gap-2 rounded-pill border border-line bg-surface px-3.5 py-[9px] text-sm font-medium"
          >
            <MarketingIcon name={c.icon} className="size-4" />
            {c.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- Before/after */

export function WhySellersSwitch() {
  return (
    <section
      aria-labelledby="switch-heading"
      className="flex flex-col gap-4 px-5 pt-10 pb-8 md:gap-10 md:px-10 md:pt-14 md:pb-[88px] xl:px-[120px]"
    >
      <div className="flex flex-col gap-3">
        <Eyebrow className="hidden md:block">Why sellers switch</Eyebrow>
        <h2
          id="switch-heading"
          className="font-display text-[26px] leading-[29px] font-semibold tracking-[-0.6px] md:max-w-[720px] md:text-[44px] md:leading-[48px] md:tracking-[-1.2px]"
        >
          Selling in DMs works — until it doesn’t.
        </h2>
      </div>

      {/* Mobile cards (01.07) */}
      <ul className="flex flex-col gap-4 md:hidden">
        {DM_COMPARISON_MOBILE.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-3 rounded-[14px] border border-line bg-surface p-3.5"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted">
              <Check aria-hidden className="size-[15px]" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold">{item.title}</span>
              <span className="text-ui text-fg-muted">{item.body}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Desktop comparison table */}
      <table className="hidden w-full overflow-hidden rounded-[20px] border-separate border-spacing-0 border border-line bg-surface md:table">
        <thead className="bg-surface-muted text-left text-sm font-bold">
          <tr>
            <th scope="col" className="w-1/2 px-7 py-[18px] text-fg-muted">
              In your DMs
            </th>
            <th scope="col" className="w-1/2 px-7 py-[18px]">
              <span className="flex items-center gap-2">
                <span aria-hidden className="size-2 rounded-full bg-fg-muted" />
                On Ojara
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {DM_COMPARISON.map((row) => (
            <tr key={row.before}>
              <td className="border-t border-line py-[22px] pr-5 pl-7 align-middle">
                <span className="flex items-center gap-3 text-base text-fg-muted">
                  <X aria-hidden className="size-[18px] shrink-0" />
                  {row.before}
                </span>
              </td>
              <td className="border-t border-line py-[22px] pr-7 pl-5 align-middle">
                <span className="flex items-center gap-3 text-base font-medium">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                    <Check aria-hidden className="size-3.5" />
                  </span>
                  {row.after}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ------------------------------------------------------------ Product showcase */

export function ProductShowcase() {
  return (
    <section aria-labelledby="showcase-heading" className="overflow-hidden bg-forest">
      {/* Mobile (01.07) */}
      <div className="flex flex-col items-center gap-6 px-5 pt-10 text-center md:hidden">
        <h2
          id="showcase-heading"
          className="font-display text-[28px] leading-tight font-semibold tracking-[-0.6px] text-paper"
        >
          Run it all from your phone.
        </h2>
        <p className="text-[15px] leading-[23px] text-fg-on-dark">
          Orders, stock and payouts — most sellers never open a laptop.
        </p>
        <div className="h-[400px] w-[240px] rounded-t-[30px] bg-[#262B23] px-2 pt-2">
          <div className="relative h-full overflow-hidden rounded-t-3xl">
            <Image
              src="/mock/screens/mobile-home.png"
              alt="Ojara merchant app home screen on a phone"
              width={390}
              height={844}
              sizes="224px"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-12 px-10 pt-24 md:flex xl:px-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:gap-16">
          <div className="flex flex-1 flex-col gap-3.5">
            <Eyebrow className="text-surface-muted">One place for the whole business</Eyebrow>
            <h2 className="font-display text-[46px] leading-[49px] font-semibold tracking-[-1.3px] text-paper">
              Wake up to paid orders, not 200 unread messages.
            </h2>
          </div>
          <ul className="flex flex-col gap-[18px] lg:w-[440px]">
            {SHOWCASE_FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3.5">
                <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-paper/8 text-paper">
                  <MarketingIcon name={f.icon} className="size-[18px]" />
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-base font-semibold text-paper">{f.title}</span>
                  <span className="text-sm leading-[21px] text-fg-on-dark">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[1280/520] w-full">
          <div className="absolute top-0 left-0 flex h-[115.4%] w-[78.1%] flex-col overflow-hidden rounded-t-2xl bg-surface shadow-[0_-10px_40px_#00000040]">
            <div className="flex gap-1.5 bg-surface-muted px-3.5 py-2.5">
              <BrowserDots />
            </div>
            <div className="relative flex-1">
              <Image
                src="/mock/screens/dashboard.png"
                alt="Ojara dashboard showing sales, orders and items that need attention"
                width={1440}
                height={1149}
                sizes="(min-width: 1440px) 1000px, 78vw"
                className="w-full"
              />
            </div>
          </div>
          <div className="absolute top-[11.5%] left-[78.9%] h-full w-[19.5%] rounded-t-[32px] bg-[#262B23] px-2 pt-2 shadow-[0_-10px_40px_#00000055]">
            <div className="relative h-full overflow-hidden rounded-t-[26px]">
              <Image
                src="/mock/screens/mobile-order.png"
                alt="Ojara order detail on a phone"
                width={390}
                height={844}
                sizes="250px"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- How it works */

export function HomeSteps() {
  return (
    <section
      aria-labelledby="steps-heading"
      className={cn('hidden flex-col gap-11 py-24 md:flex', GUTTER)}
    >
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Eyebrow>How it works</Eyebrow>
          <h2
            id="steps-heading"
            className="font-display text-[44px] leading-tight font-semibold tracking-[-1.2px]"
          >
            Open your store before lunch.
          </h2>
        </div>
        <Link
          href="/how-it-works"
          className="flex shrink-0 items-center gap-1.5 text-base font-semibold hover:underline"
        >
          See every step <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
      <ol className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {HOME_STEPS.map((step, i) => {
          const last = i === HOME_STEPS.length - 1;
          return (
            <li
              key={step.title}
              className={cn(
                'flex flex-col gap-3.5 rounded-[18px] p-6',
                last ? 'bg-surface-muted' : 'border border-line bg-surface',
              )}
            >
              <span
                className={cn(
                  'font-display text-[32px] leading-none font-semibold',
                  last ? 'text-fg' : 'text-fg-muted',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p
                className={cn(
                  'text-[15px] leading-[23px]',
                  last ? 'text-fg-lead' : 'text-fg-muted',
                )}
              >
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------- Merchant story */

export function MerchantStory() {
  const s = MERCHANT_STORY;
  return (
    <section aria-label="Merchant story" className={cn('hidden pb-24 md:block', GUTTER)}>
      <figure className="flex overflow-hidden rounded-3xl border border-line bg-surface lg:h-[460px]">
        <div className="relative hidden w-[40%] shrink-0 lg:block xl:w-[520px]">
          <Image
            src={s.photo}
            alt="Adùnní in a blue adire dress in a courtyard"
            fill
            sizes="520px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-[22px] px-10 py-12 xl:px-14">
          <Quote aria-hidden className="size-8 text-fg-muted" />
          <blockquote className="font-display text-[28px] leading-9 font-medium tracking-[-0.5px]">
            {s.quote}
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <InitialTile
              initial={s.initial}
              color="#E9A23B"
              className="size-10 rounded-[10px] text-xl text-[#14183A]"
            />
            <span className="flex flex-col gap-px">
              <span className="text-[15px] font-semibold">{s.name}</span>
              <span className="text-ui text-fg-muted">{s.role}</span>
            </span>
          </figcaption>
          <dl className="flex gap-9 border-t border-line pt-[18px]">
            {s.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-0.5">
                <dt className="text-ui text-fg-muted">{stat.label}</dt>
                <dd className="font-display text-[28px] font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </figure>
    </section>
  );
}

/* ------------------------------------------------------------- Pricing teaser */

export function PricingTeaser() {
  return (
    <section
      aria-labelledby="teaser-heading"
      className="flex flex-col gap-3 px-5 py-10 md:gap-6 md:px-10 md:pt-0 md:pb-24 lg:flex-row xl:px-20"
    >
      <div className="flex flex-col gap-3.5 lg:w-[420px] lg:shrink-0">
        <Eyebrow className="hidden md:block">Pricing</Eyebrow>
        <h2
          id="teaser-heading"
          className="font-display text-[26px] leading-[29px] font-semibold tracking-[-0.6px] md:text-[40px] md:leading-[43px] md:tracking-[-1.1px]"
        >
          Free to start. No cut of your sales.
        </h2>
        <p className="hidden text-base leading-[25px] text-fg-muted md:block">
          Upgrade when you need more products, your own domain or a team. Paystack’s payment fee is
          the only charge on each sale.
        </p>
        <Link
          href="/pricing"
          className="hidden w-fit items-center gap-1.5 text-base font-semibold hover:underline md:flex"
        >
          Compare plans <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
      <ul className="flex flex-col gap-3 md:flex-1 md:flex-row md:gap-6">
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const dark = key === 'STARTER';
          const price = formatKobo(plan.priceKobo);
          return (
            <li
              key={key}
              className={cn(
                'flex items-center justify-between rounded-[14px] p-4 md:flex-1 md:flex-col md:items-start md:justify-end md:gap-2.5 md:rounded-[18px] md:p-6',
                dark ? 'bg-forest text-paper' : 'border border-line bg-surface',
              )}
            >
              <span className="flex flex-col gap-0.5 md:contents">
                <span
                  className={cn(
                    'text-[15px] font-semibold',
                    dark ? 'text-surface-muted' : 'text-fg md:text-fg-muted',
                  )}
                >
                  {plan.name}
                </span>
                <span
                  className={cn(
                    'text-[13px] md:order-last md:text-sm',
                    dark ? 'text-fg-on-dark' : 'text-fg-muted',
                  )}
                >
                  <span className="md:hidden">{PLAN_TEASERS[key].mobileSummary}</span>
                  <span className="hidden md:inline">{PLAN_TEASERS[key].summary}</span>
                </span>
              </span>
              <span className="flex items-end gap-1">
                <span className="font-display text-lg font-semibold md:text-4xl md:leading-none md:tracking-[-0.8px]">
                  {price}
                  {plan.priceKobo > 0 && <span className="md:hidden">/mo</span>}
                </span>
                <span
                  className={cn(
                    'hidden text-sm md:inline',
                    dark ? 'text-fg-on-dark' : 'text-fg-muted',
                  )}
                >
                  /mo
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
