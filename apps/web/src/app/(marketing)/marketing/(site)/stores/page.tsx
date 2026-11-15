import { ArrowUpRight, ChevronDown, MapPin, Search, ShieldCheck, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow, GUTTER, InitialTile, PhoneCtaBand } from '@/components/marketing/primitives';
import { StorefrontPreview } from '@/components/marketing/storefront-preview';
import { platformOrigin } from '@/lib/platform-url';
import { cn } from '@/lib/utils';
import { DIRECTORY_STORES, DIRECTORY_TOTAL, FEATURED_STORE, STORE_FILTERS } from '@/mock/marketing';

export const metadata: Metadata = { title: 'Stores on Ojara' };

const LOCATIONS = ['Lagos', 'Abuja', 'Ibadan', 'Enugu', 'Abeokuta', 'Kano'];

type SearchParams = Promise<{ category?: string; q?: string; location?: string }>;

function filterHref(params: { category?: string; q?: string; location?: string }) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v && v !== 'All') sp.set(k, v);
  const qs = sp.toString();
  return qs ? `/stores?${qs}` : '/stores';
}

/** 01.03 Stores on Ojara — public directory of stores that opted in. Filters are plain links. */
export default async function StoresPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ category = 'All', q = '', location = '' }, appOrigin, siteOrigin] = await Promise.all([
    searchParams,
    platformOrigin('dashboard'),
    platformOrigin('marketing'),
  ]);
  const storeUrl = (host: string) =>
    siteOrigin.replace('://', `://${host.split('.')[0] ?? 'demo'}.`);

  const needle = q.trim().toLowerCase();
  const stores = DIRECTORY_STORES.filter(
    (s) =>
      (category === 'All' || s.category === category) &&
      (!location || s.location.includes(location)) &&
      (!needle || `${s.name} ${s.description} ${s.category}`.toLowerCase().includes(needle)),
  );
  const filtered = category !== 'All' || Boolean(location) || Boolean(needle);

  return (
    <>
      <section
        aria-labelledby="stores-heading"
        className={cn('flex flex-col gap-5 pt-10 pb-8 md:pt-16', GUTTER)}
      >
        <Eyebrow>Stores on Ojara</Eyebrow>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <h1
            id="stores-heading"
            className="max-w-[640px] font-display text-[38px] leading-[40px] font-semibold tracking-[-1.2px] md:text-[56px] md:leading-[57px] md:tracking-[-1.8px]"
          >
            Shop from real Nigerian businesses.
          </h1>
          <form action="/stores" method="get" role="search" className="w-full lg:w-[440px]">
            {category !== 'All' && <input type="hidden" name="category" value={category} />}
            {location && <input type="hidden" name="location" value={location} />}
            <label className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-4 py-3.5 focus-within:shadow-focus">
              <Search aria-hidden className="size-[18px] text-fg-muted" />
              <span className="sr-only">Search stores or products</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search stores or products"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-fg-subtle"
              />
            </label>
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            {STORE_FILTERS.map((f) => {
              const active = f === category;
              return (
                <Link
                  key={f}
                  href={filterHref({ category: f, q, location })}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-pill px-4 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-forest text-paper'
                      : 'border border-line bg-surface hover:bg-selected',
                  )}
                >
                  {f}
                </Link>
              );
            })}
          </nav>
          <details className="relative sm:ml-6">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
              <MapPin aria-hidden className="size-3.5" />
              {location || 'Anywhere in Nigeria'}
              <ChevronDown aria-hidden className="size-3.5" />
            </summary>
            <ul className="absolute top-full left-0 z-20 mt-1 flex w-52 flex-col rounded-lg border border-line bg-surface p-1 shadow-popover">
              {['', ...LOCATIONS].map((loc) => (
                <li key={loc || 'any'}>
                  <Link
                    href={filterHref({ category, q, location: loc })}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm hover:bg-selected',
                      loc === location && 'font-semibold',
                    )}
                  >
                    {loc || 'Anywhere in Nigeria'}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      {!filtered && (
        <section aria-labelledby="featured-heading" className={cn('pt-4 pb-10', GUTTER)}>
          <div className="flex overflow-hidden rounded-3xl bg-surface-muted lg:h-[440px]">
            <div className="flex flex-col justify-center gap-[18px] p-6 md:p-11 lg:w-[460px] lg:shrink-0">
              <span className="flex w-fit items-center gap-1.5 rounded-pill bg-paper/65 px-2.5 py-[5px] text-xs font-semibold">
                <Star aria-hidden className="size-3" />
                Featured this week
              </span>
              <div className="flex items-center gap-3">
                <InitialTile
                  initial={FEATURED_STORE.initial}
                  color="#E9A23B"
                  className="size-12 rounded-lg text-2xl text-[#14183A]"
                />
                <div className="flex flex-col gap-0.5">
                  <h2 id="featured-heading" className="font-display text-[26px] font-semibold">
                    {FEATURED_STORE.name}
                  </h2>
                  <p className="text-sm text-fg-lead">{FEATURED_STORE.meta}</p>
                </div>
              </div>
              <p className="text-base leading-6 text-fg-lead">{FEATURED_STORE.description}</p>
              <a
                href={storeUrl('demo.ojara.store')}
                className="flex w-fit items-center gap-2 rounded-[10px] bg-forest px-5 py-[13px] text-base font-semibold text-paper transition-colors hover:bg-forest/90"
              >
                Visit store <ArrowUpRight aria-hidden className="size-4" />
              </a>
            </div>
            <div className="hidden flex-1 pt-11 lg:block">
              <StorefrontPreview />
            </div>
          </div>
        </section>
      )}

      <section
        aria-labelledby="directory-heading"
        className={cn('flex flex-col gap-6 pt-4 pb-16 md:pb-[88px]', GUTTER)}
      >
        <div className="flex items-end justify-between gap-4">
          <h2
            id="directory-heading"
            className="font-display text-[26px] font-semibold tracking-[-0.6px] md:text-[30px]"
          >
            {filtered ? 'Matching stores' : 'New on Ojara'}
          </h2>
          <p className="text-sm text-fg-muted">
            {(filtered ? stores.length : DIRECTORY_TOTAL).toLocaleString('en-NG')} stores
          </p>
        </div>
        {stores.length === 0 ? (
          <p className="rounded-[18px] border border-line bg-surface p-8 text-center text-[15px] text-fg-muted">
            No stores match that yet.{' '}
            <Link href="/stores" className="font-semibold text-fg underline">
              Clear filters
            </Link>
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <li key={s.name}>
                <a
                  href={storeUrl(s.host)}
                  className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface transition-shadow hover:shadow-mock"
                >
                  <div className="relative h-[220px]">
                    <Image
                      src={s.cover}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5 p-5">
                    <div className="flex items-center gap-2.5">
                      <InitialTile
                        initial={s.initial}
                        color={s.logoColor}
                        className="size-9 rounded-[9px] text-[17px] text-surface"
                      />
                      <div className="flex flex-1 flex-col gap-px">
                        <h3 className="text-[17px] font-semibold">{s.name}</h3>
                        <p className="text-ui text-fg-muted">
                          {s.category} · {s.location}
                        </p>
                      </div>
                      <ArrowUpRight
                        aria-hidden
                        className="size-[18px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                    <p className="text-sm leading-[21px] text-fg-muted">{s.description}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
        {!filtered && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              className="rounded-[10px] px-[22px] py-3 text-base font-semibold ring-[1.5px] ring-forest ring-inset hover:bg-surface"
            >
              Show more stores
            </button>
          </div>
        )}
        <p className="flex items-start justify-center gap-2 text-center text-ui text-fg-muted">
          <ShieldCheck aria-hidden className="mt-0.5 size-[15px] shrink-0" />
          Stores choose to be listed. Every listing follows the Ojara Seller Policy — report a store
          from its footer.
        </p>
      </section>

      <PhoneCtaBand appOrigin={appOrigin} title="Your store could be the next one here." />
    </>
  );
}
