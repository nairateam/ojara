import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Award,
  Check,
  ChevronDown,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DIRECTORY_TOTAL, type DirectoryStore, FEATURED_STORE } from '@/mock/marketing';
import { STORES_GET_FEATURED, STORES_HERO } from '@/mock/site-stores';
import {
  ArrowBadge,
  DisplayHeading,
  SITE_GUTTER,
  SiteButton,
  SiteHero,
  siteButton,
} from '../site-shell';

/** Current directory query, carried through every filter link and the search form. */
export type DirectoryQuery = { category: string; q: string; city: string; sort: string };

/** Search form field; the hidden inputs keep the other filters when searching. */
function SearchForm({ query, className }: { query: DirectoryQuery; className?: string }) {
  return (
    <form action="/stores#all-stores" method="get" role="search" className={className}>
      {query.category !== 'All' && <input type="hidden" name="category" value={query.category} />}
      {query.city && <input type="hidden" name="city" value={query.city} />}
      {query.sort !== 'popular' && <input type="hidden" name="sort" value={query.sort} />}
      <label className="flex items-center gap-3 rounded-full bg-surface py-2 pr-2 pl-5 text-forest focus-within:shadow-focus md:pl-[22px]">
        <Search aria-hidden className="size-[18px] shrink-0 text-fg-muted" />
        <span className="sr-only">{STORES_HERO.searchPlaceholder}</span>
        <input
          type="search"
          name="q"
          defaultValue={query.q}
          placeholder={STORES_HERO.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-fg-subtle"
        />
        <button
          type="submit"
          className="site-btn rounded-full bg-forest px-4 py-[13px] text-[15px] font-semibold text-paper hover:opacity-95 sm:px-[22px]"
        >
          Search
        </button>
      </label>
    </form>
  );
}

/** 12 Stores · Hero: rings, live-store count pill, "Real stalls. / Selling for real.", search. */
export function StoresHero({ query }: { query: DirectoryQuery }) {
  return (
    <SiteHero className="pb-14 md:pb-[88px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {[1100, 760].map((d) => (
          <span
            key={d}
            style={{ width: d, height: d }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/6"
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-6 px-5 pt-14 text-center md:gap-7 md:pt-[88px]">
        <p className="flex items-center gap-2.5 rounded-full bg-paper/12 py-[7px] pr-3.5 pl-2 text-sm text-paper">
          <span className="rounded-full bg-paper px-2.5 py-[3px] text-[13px] font-semibold text-forest">
            {DIRECTORY_TOTAL.toLocaleString('en-NG')}
          </span>
          {STORES_HERO.badge}
        </p>
        <DisplayHeading
          as="h1"
          size="xl"
          tone="light"
          line1={STORES_HERO.line1}
          line2={STORES_HERO.line2}
          accentClassName="text-paper"
          className="items-center"
        />
        <p className="max-w-[540px] text-base/[25px] text-paper/80 md:text-lg/[27px]">
          {STORES_HERO.sub}
        </p>
        <SearchForm query={query} className="w-full max-w-[600px] pt-1" />
      </div>
    </SiteHero>
  );
}

/** 12 Stores · Store of the month: photo left, quote and metrics right. */
export function StoreOfTheMonth({ href }: { href: string }) {
  const s = FEATURED_STORE;
  return (
    <section aria-labelledby="featured-heading" className={cn('pt-16 md:pt-[100px]', SITE_GUTTER)}>
      <div className="flex flex-col overflow-hidden rounded-[28px] bg-surface-muted lg:h-[560px] lg:flex-row">
        <div className="relative h-[320px] shrink-0 sm:h-[420px] lg:h-auto lg:w-[46%] xl:w-[640px]">
          <Image
            src={s.heroImage}
            alt=""
            fill
            sizes="(min-width: 1280px) 640px, (min-width: 1024px) 46vw, 100vw"
            className="object-cover"
          />
          <span className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-surface/92 px-3.5 py-2 text-[13px] font-semibold text-forest">
            <Award aria-hidden className="size-3.5" />
            Store of the month · {s.month}
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-10 p-6 md:p-10 xl:p-14">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <span
                aria-hidden
                className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-forest font-accent text-xl text-paper italic"
              >
                {s.initials}
              </span>
              <div className="flex flex-col gap-0.5">
                <h2
                  id="featured-heading"
                  className="font-display text-[22px] font-semibold text-forest"
                >
                  {s.name}
                </h2>
                <p className="text-sm text-fg-muted">
                  {s.host} · {s.city}
                </p>
              </div>
            </div>
            <blockquote className="font-accent text-[28px]/[34px] tracking-[-0.015em] text-forest md:text-[40px]/[46px]">
              {s.quote}
            </blockquote>
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <dl className="flex gap-6 md:gap-10">
              {s.metrics.map((m) => (
                <div key={m.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-[13px] text-fg-muted">{m.label}</dt>
                  <dd className="font-display text-[28px] font-semibold tracking-[-0.035em] text-forest md:text-[34px]">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
            <SiteButton href={href} className="w-fit px-[22px] py-3.5 text-sm">
              Visit store <ArrowUpRight aria-hidden />
            </SiteButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Pill dropdown built on <details> with plain links (no JS). `key` on the caller should change
 * with the selected value so the menu closes after navigating.
 */
export function DirectoryDropdown({
  label,
  options,
}: {
  label: string;
  options: { label: string; href: string; active: boolean }[];
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 rounded-full bg-surface py-[11px] pr-4 pl-[18px] text-sm font-medium text-forest select-none [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="absolute top-full right-0 z-20 mt-1.5 flex w-56 flex-col rounded-2xl border border-line bg-surface p-1.5 shadow-popover">
        {options.map((o) => (
          <li key={o.label}>
            <Link
              href={o.href}
              aria-current={o.active ? 'true' : undefined}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2 text-sm text-forest hover:bg-selected',
                o.active && 'font-semibold',
              )}
            >
              {o.label}
              {o.active && <Check aria-hidden className="size-4" />}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Category chip in the directory filter row. */
export function CategoryChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'shrink-0 rounded-full px-[18px] py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-forest text-paper' : 'border border-line text-forest hover:bg-forest/5',
      )}
    >
      {label}
    </Link>
  );
}

/** 12 Stores · Directory card: rounded photo with category tag, monogram, name, city and count. */
export function StoreCard({ store, href }: { store: DirectoryStore; href: string }) {
  return (
    <a href={href} className="group flex flex-col gap-[18px]">
      <div className="relative h-[260px] overflow-hidden rounded-3xl md:h-[320px]">
        <Image
          src={store.cover}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3.5 left-3.5 rounded-full bg-surface/92 px-3 py-1.5 text-xs font-semibold text-forest">
          {store.category}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted font-accent text-[17px] text-forest italic"
        >
          {store.initials}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate font-display text-[19px] font-semibold text-forest">
            {store.name}
          </h3>
          <p className="text-[13px] text-fg-muted">
            {store.city} · {store.productCount} products
          </p>
        </div>
        <ArrowBadge className="size-10 transition-colors group-hover:bg-forest group-hover:text-paper" />
      </div>
    </a>
  );
}

/** "Show more stores" pill (only rendered when more stores match than are shown). */
export function ShowMoreStores({ href }: { href: string }) {
  return (
    <div className="flex justify-center pt-3">
      <Link href={href} scroll={false} className={siteButton('outline')}>
        Show more stores <ArrowDown aria-hidden />
      </Link>
    </div>
  );
}

/** 12 Stores · Get featured band: "Your stall could be right here." with two pills. */
export function GetFeatured({ appOrigin }: { appOrigin: string }) {
  return (
    <section
      aria-labelledby="get-featured-heading"
      className={cn('pt-20 md:pt-[120px]', SITE_GUTTER)}
    >
      <div className="flex flex-col gap-8 rounded-[28px] bg-surface-muted px-6 py-10 md:px-14 md:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
        <div className="flex max-w-[760px] flex-col gap-2.5">
          <h2
            id="get-featured-heading"
            className="flex flex-wrap items-baseline gap-x-3 text-forest"
          >
            <span className="font-display text-[32px]/[1.1] font-semibold tracking-[-0.04em] md:text-[44px]/[44px]">
              {STORES_GET_FEATURED.line1}
            </span>
            <span className="font-accent text-[36px]/[1.1] tracking-[-0.016em] text-fg-muted italic md:text-[50px]/[50px]">
              {STORES_GET_FEATURED.line2}
            </span>
          </h2>
          <p className="text-base/6 text-fg-muted">{STORES_GET_FEATURED.body}</p>
        </div>
        <div className="flex flex-wrap gap-2.5 lg:shrink-0">
          <SiteButton href={`${appOrigin}/signup`} className="px-6 py-[15px]">
            Open your store <ArrowRight aria-hidden />
          </SiteButton>
          <SiteButton href="/contact" variant="outline" className="px-6 py-[15px]">
            Share your story
          </SiteButton>
        </div>
      </div>
    </section>
  );
}
