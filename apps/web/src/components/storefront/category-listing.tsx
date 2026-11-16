import type { StorefrontListDto, StorefrontStoreDto } from '@ojara/shared';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumb, ProductCard, storeButton } from './primitives';

export interface ListingParams {
  q?: string | undefined;
  sort: 'newest' | 'price-asc' | 'price-desc';
  /** Naira, as typed in the price boxes. */
  min?: string | undefined;
  max?: string | undefined;
  inStock: boolean;
  page: number;
}

/** Reads the listing's query string (shared by /shop and /shop/:category). */
export function parseListingParams(
  sp: Record<string, string | string[] | undefined>,
): ListingParams {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim();
  const sort = one(sp.sort);
  return {
    q: one(sp.q) || undefined,
    sort: sort === 'price-asc' || sort === 'price-desc' ? sort : 'newest',
    min: one(sp.min) || undefined,
    max: one(sp.max) || undefined,
    inStock: one(sp.inStock) === '1',
    page: Math.max(1, Number(one(sp.page)) || 1),
  };
}

/** Naira text ("₦10,000") -> kobo for the API; undefined when blank or not a number. */
export function nairaParamToKobo(text: string | undefined): number | undefined {
  if (!text) return undefined;
  const n = Number(text.replace(/[₦,\s]/g, ''));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
}

function pageHref(basePath: string, params: ListingParams, page: number): string {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.sort !== 'newest') qs.set('sort', params.sort);
  if (params.min) qs.set('min', params.min);
  if (params.max) qs.set('max', params.max);
  if (params.inStock) qs.set('inStock', '1');
  if (page > 1) qs.set('page', String(page));
  const s = qs.toString();
  return s ? `${basePath}?${s}` : basePath;
}

function FilterGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <fieldset
      className={cn('flex flex-col gap-3', !last && 'border-b border-store-border pb-[22px]')}
    >
      <legend className="mb-3 text-ui font-semibold tracking-[0.3px] text-store-ink">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

const priceInput =
  'w-0 min-w-0 flex-1 rounded-sm border border-store-border bg-store-card px-2.5 py-2 text-ui text-store-ink outline-none focus:border-store-primary';

/** 05.02 filter sidebar: a GET form, so it works without client JS. */
function Filters({
  store,
  activeSlug,
  params,
  basePath,
}: {
  store: StorefrontStoreDto;
  activeSlug: string | undefined;
  params: ListingParams;
  basePath: string;
}) {
  return (
    <form action={basePath} className="flex flex-col gap-[26px]">
      {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
      {params.sort !== 'newest' ? <input type="hidden" name="sort" value={params.sort} /> : null}
      <FilterGroup title="Category">
        <ul className="flex flex-col gap-3">
          {[
            { slug: '', name: 'Shop all', count: store.productCount },
            ...store.categories.map((c) => ({ slug: c.slug, name: c.name, count: c.productCount })),
          ].map((c) => {
            const isActive = (activeSlug ?? '') === c.slug;
            return (
              <li key={c.slug || 'all'}>
                <Link
                  href={c.slug ? `/shop/${c.slug}` : '/shop'}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex items-center justify-between text-sm"
                >
                  <span
                    className={isActive ? 'font-semibold text-store-primary' : 'text-store-ink'}
                  >
                    {c.name}
                  </span>
                  <span className="text-ui text-store-muted">{c.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>
      <FilterGroup title="Price (₦)">
        <div className="flex items-center gap-2">
          <input
            name="min"
            inputMode="numeric"
            defaultValue={params.min}
            placeholder="Min"
            aria-label="Minimum price in naira"
            className={priceInput}
          />
          <span className="text-sm text-store-body">–</span>
          <input
            name="max"
            inputMode="numeric"
            defaultValue={params.max}
            placeholder="Max"
            aria-label="Maximum price in naira"
            className={priceInput}
          />
        </div>
      </FilterGroup>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-store-ink">
        <input
          type="checkbox"
          name="inStock"
          value="1"
          defaultChecked={params.inStock}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="flex h-5 w-[34px] items-center rounded-[10px] bg-store-border p-0.5 transition-colors peer-checked:bg-store-primary peer-checked:[&>span]:translate-x-3.5 peer-focus-visible:outline-2 peer-focus-visible:outline-store-primary"
        >
          <span className="size-4 rounded-full bg-white transition-transform" />
        </span>
        In stock only
      </label>
      <button type="submit" className={storeButton('ink', 'py-2.5 text-ui')}>
        Apply filters
      </button>
    </form>
  );
}

/** 05.02 Category / Shop all listing: breadcrumb, title, filter sidebar, grid, pages. */
export function CategoryListing({
  store,
  list,
  params,
  basePath,
}: {
  store: StorefrontStoreDto;
  list: StorefrontListDto;
  params: ListingParams;
  basePath: string;
}) {
  const category = list.category;
  const title = params.q ? `Results for “${params.q}”` : (category?.name ?? 'Shop all');
  const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));
  const filtered = Boolean(params.min || params.max || params.inStock);

  return (
    <div className="flex flex-col gap-6 px-4 pt-5 pb-14 md:gap-7 md:px-8 md:pt-7 md:pb-[72px] xl:px-16">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={
              category
                ? [{ label: 'Shop all', href: '/shop' }, { label: category.name }]
                : [{ label: 'Shop all' }]
            }
          />
          <h1 className="font-serif text-[36px] font-medium tracking-[-1px] text-store-ink md:text-5xl">
            {title}
          </h1>
          {category?.description ? (
            <p className="text-sm text-store-body md:text-title">{category.description}</p>
          ) : null}
        </div>
        <form
          action={basePath}
          className="flex items-center justify-between gap-2.5 md:justify-end"
        >
          {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
          {params.min ? <input type="hidden" name="min" value={params.min} /> : null}
          {params.max ? <input type="hidden" name="max" value={params.max} /> : null}
          {params.inStock ? <input type="hidden" name="inStock" value="1" /> : null}
          <span className="text-ui text-store-body">
            {list.total === 1 ? '1 product' : `${list.total} products`}
          </span>
          <label className="relative flex items-center">
            <span className="sr-only">Sort products</span>
            <select
              name="sort"
              defaultValue={params.sort}
              className="appearance-none rounded-md border border-store-border bg-store-card py-[9px] pr-8 pl-3 text-ui font-medium text-store-ink"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Sort: Price, low to high</option>
              <option value="price-desc">Sort: Price, high to low</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 size-3.5 text-store-ink"
              aria-hidden
            />
          </label>
          <button type="submit" className="text-ui font-semibold text-store-primary">
            Sort
          </button>
        </form>
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <details className="group/filters rounded-md border border-store-border bg-store-card md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-3 text-sm font-semibold text-store-ink [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="size-4" aria-hidden />
            Filters
            <ChevronDown
              className="ml-auto size-4 transition-transform group-open/filters:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="border-t border-store-border p-4">
            <Filters
              store={store}
              activeSlug={category?.slug}
              params={params}
              basePath={basePath}
            />
          </div>
        </details>
        <aside className="hidden w-[200px] shrink-0 md:block xl:w-[240px]">
          <Filters store={store} activeSlug={category?.slug} params={params} basePath={basePath} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {list.items.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:gap-5 lg:grid-cols-3">
              {list.items.map((p) => (
                <ProductCard key={p.slug} product={p} variant="listing" />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-store-body">
              {params.q || filtered ? 'Nothing matches that yet. ' : 'No products here yet. '}
              <Link href="/shop" className="font-semibold text-store-primary">
                See everything
              </Link>
            </p>
          )}
          {lastPage > 1 ? (
            <nav aria-label="Pages" className="flex items-center justify-center gap-4 py-3 text-ui">
              {params.page > 1 ? (
                <Link
                  href={pageHref(basePath, params, params.page - 1)}
                  className="font-semibold text-store-primary"
                >
                  Previous
                </Link>
              ) : null}
              <span className="text-store-body">
                Page {params.page} of {lastPage}
              </span>
              {params.page < lastPage ? (
                <Link
                  href={pageHref(basePath, params, params.page + 1)}
                  className="font-semibold text-store-primary"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : list.items.length ? (
            <p className="py-3 text-center text-ui text-store-body">
              You’ve seen all {list.total === 1 ? '1 product' : `${list.total} products`}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
