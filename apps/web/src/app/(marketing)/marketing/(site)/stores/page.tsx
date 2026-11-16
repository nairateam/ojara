import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CategoryChip,
  DirectoryDropdown,
  type DirectoryQuery,
  GetFeatured,
  ShowMoreStores,
  StoreCard,
  StoreOfTheMonth,
  StoresHero,
} from '@/components/marketing/stores/stores-sections';
import { DisplayHeading, SITE_GUTTER, SiteEyebrow } from '@/components/marketing/site-shell';
import { platformOrigin } from '@/lib/platform-url';
import { cn } from '@/lib/utils';
import { DIRECTORY_STORES, type DirectoryStore, STORE_FILTERS } from '@/mock/marketing';
import { STORE_SORTS, STORES_DIRECTORY, type StoreSort } from '@/mock/site-stores';

export const metadata: Metadata = { title: 'Stores on Ojara' };

/** Stores shown per "page"; "Show more stores" raises the limit by this much. */
const PAGE_SIZE = 9;

const CITIES = [...new Set(DIRECTORY_STORES.map((s) => s.city))].sort();

type SearchParams = Promise<{
  category?: string;
  q?: string;
  city?: string;
  sort?: string;
  limit?: string;
}>;

function directoryHref(query: DirectoryQuery, limit?: number) {
  const sp = new URLSearchParams();
  if (query.category !== 'All') sp.set('category', query.category);
  if (query.q) sp.set('q', query.q);
  if (query.city) sp.set('city', query.city);
  if (query.sort !== 'popular') sp.set('sort', query.sort);
  if (limit && limit > PAGE_SIZE) sp.set('limit', String(limit));
  const qs = sp.toString();
  return `/stores${qs ? `?${qs}` : ''}#all-stores`;
}

function sortStores(stores: DirectoryStore[], sort: StoreSort) {
  if (sort === 'products') return [...stores].sort((a, b) => b.productCount - a.productCount);
  if (sort === 'name') return [...stores].sort((a, b) => a.name.localeCompare(b.name));
  return stores;
}

/**
 * 12 Stores — public directory of stores that opted in. Category chips, city and sort menus are
 * plain links and the search is a GET form, so filtering works without JavaScript.
 */
export default async function StoresPage({ searchParams }: { searchParams: SearchParams }) {
  const [params, appOrigin, siteOrigin] = await Promise.all([
    searchParams,
    platformOrigin('dashboard'),
    platformOrigin('marketing'),
  ]);
  const storeUrl = (host: string) =>
    siteOrigin.replace('://', `://${host.split('.')[0] ?? 'demo'}.`);

  const sort: StoreSort = STORE_SORTS.find((s) => s.key === params.sort)?.key ?? 'popular';
  const query: DirectoryQuery = {
    category: STORE_FILTERS.find((f) => f === params.category) ?? 'All',
    q: params.q?.trim() ?? '',
    city: params.city && CITIES.includes(params.city) ? params.city : '',
    sort,
  };
  const limit = Math.max(PAGE_SIZE, Number.parseInt(params.limit ?? '', 10) || PAGE_SIZE);

  const needle = query.q.toLowerCase();
  const matches = sortStores(
    DIRECTORY_STORES.filter(
      (s) =>
        (query.category === 'All' || s.category === query.category) &&
        (!query.city || s.city === query.city) &&
        (!needle ||
          `${s.name} ${s.description} ${s.category} ${s.city}`.toLowerCase().includes(needle)),
    ),
    sort,
  );
  const shown = matches.slice(0, limit);
  const filtered = query.category !== 'All' || Boolean(query.city) || Boolean(needle);

  return (
    <>
      <StoresHero query={query} />

      {!filtered && <StoreOfTheMonth href={storeUrl('demo.ojara.store')} />}

      <section
        id="all-stores"
        aria-label="All stores"
        className={cn('flex scroll-mt-4 flex-col gap-8 pt-20 md:gap-9 md:pt-[110px]', SITE_GUTTER)}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-[18px]">
            <SiteEyebrow>{STORES_DIRECTORY.eyebrow}</SiteEyebrow>
            <DisplayHeading line1={STORES_DIRECTORY.line1} line2={STORES_DIRECTORY.line2} />
          </div>
          <div className="flex flex-wrap gap-2.5">
            <DirectoryDropdown
              key={`city-${query.city}`}
              label={query.city || 'All cities'}
              options={['', ...CITIES].map((city) => ({
                label: city || 'All cities',
                href: directoryHref({ ...query, city }),
                active: city === query.city,
              }))}
            />
            <DirectoryDropdown
              key={`sort-${sort}`}
              label={STORE_SORTS.find((s) => s.key === sort)?.label ?? 'Most popular'}
              options={STORE_SORTS.map((s) => ({
                label: s.label,
                href: directoryHref({ ...query, sort: s.key }),
                active: s.key === sort,
              }))}
            />
          </div>
        </div>

        <nav
          aria-label="Categories"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
        >
          {STORE_FILTERS.map((f) => (
            <CategoryChip
              key={f}
              label={f}
              href={directoryHref({ ...query, category: f })}
              active={f === query.category}
            />
          ))}
        </nav>

        {filtered && (
          <p className="-mt-2 text-sm text-fg-muted">
            {matches.length === 1 ? '1 store matches' : `${matches.length} stores match`}
            {query.q && <> “{query.q}”</>} ·{' '}
            <Link href="/stores#all-stores" className="font-semibold text-forest underline">
              Clear filters
            </Link>
          </p>
        )}

        {shown.length === 0 ? (
          <p className="rounded-[28px] bg-surface p-10 text-center text-[15px] text-fg-muted">
            No stores match that yet. Try another category or city.
          </p>
        ) : (
          <ul className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((s) => (
              <li key={s.host}>
                <StoreCard store={s} href={storeUrl(s.host)} />
              </li>
            ))}
          </ul>
        )}

        {matches.length > shown.length && (
          <ShowMoreStores href={directoryHref(query, limit + PAGE_SIZE)} />
        )}
      </section>

      <GetFeatured appOrigin={appOrigin} />
    </>
  );
}
