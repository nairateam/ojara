import { Check, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CATEGORIES, type Category, PRODUCTS, type Product, productsIn } from '@/mock/storefront';
import { Breadcrumb, ProductCard } from './primitives';

const SIZES = ['S', 'M', 'L', 'XL'];
const COLOURS = [
  { name: 'Indigo', swatch: '#2A3A7C' },
  { name: 'Rust', swatch: '#B5532E' },
  { name: 'Multicolour', swatch: '#D9A441' },
];

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

/** 05.02 filter sidebar. A GET form (no client JS); options are sample values for now. */
function Filters({ active }: { active?: Category }) {
  return (
    <form action={active ? `/shop/${active.slug}` : '/shop'} className="flex flex-col gap-[26px]">
      <FilterGroup title="Category">
        <ul className="flex flex-col gap-3">
          {[
            { slug: '', name: 'Shop all', count: PRODUCTS.length },
            ...CATEGORIES.map((c) => ({
              slug: c.slug,
              name: c.name,
              count: productsIn(c.slug).length,
            })),
          ].map((c) => {
            const isActive = (active?.slug ?? '') === c.slug;
            return (
              <li key={c.name}>
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
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="checkbox" name="size" value={s} className="peer sr-only" />
              <span className="flex h-9 w-11 items-center justify-center rounded-sm border border-store-border bg-store-card text-ui font-semibold text-store-ink peer-checked:border-store-ink peer-checked:bg-store-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-store-primary">
                {s}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Colour">
        <div className="flex flex-col gap-3">
          {COLOURS.map((c) => (
            <label key={c.name} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <span className="relative flex size-[18px]">
                <input
                  type="checkbox"
                  name="colour"
                  value={c.name.toLowerCase()}
                  className="peer size-full appearance-none rounded-xs border-[1.5px] border-store-muted/60 bg-store-card checked:border-store-primary checked:bg-store-primary focus-visible:outline-2 focus-visible:outline-store-primary"
                />
                <Check
                  className="pointer-events-none absolute inset-0 m-auto size-3 text-store-primary-fg opacity-0 peer-checked:opacity-100"
                  aria-hidden
                />
              </span>
              <span
                className="size-3.5 rounded-full"
                style={{ backgroundColor: c.swatch }}
                aria-hidden
              />
              <span className="text-store-ink">{c.name}</span>
            </label>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <input
            name="min"
            inputMode="numeric"
            defaultValue="₦10,000"
            aria-label="Minimum price"
            className="w-0 min-w-0 flex-1 rounded-sm border border-store-border bg-store-card px-2.5 py-2 text-ui text-store-ink outline-none focus:border-store-primary"
          />
          <span className="text-sm text-store-body">–</span>
          <input
            name="max"
            inputMode="numeric"
            defaultValue="₦30,000"
            aria-label="Maximum price"
            className="w-0 min-w-0 flex-1 rounded-sm border border-store-border bg-store-card px-2.5 py-2 text-ui text-store-ink outline-none focus:border-store-primary"
          />
        </div>
      </FilterGroup>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-store-ink">
        <input type="checkbox" name="inStock" value="1" className="peer sr-only" />
        <span
          aria-hidden
          className="flex h-5 w-[34px] items-center rounded-[10px] bg-store-border p-0.5 transition-colors peer-checked:bg-store-primary peer-checked:[&>span]:translate-x-3.5 peer-focus-visible:outline-2 peer-focus-visible:outline-store-primary"
        >
          <span className="size-4 rounded-full bg-white transition-transform" />
        </span>
        In stock only
      </label>
      <button type="submit" className="sr-only">
        Apply filters
      </button>
    </form>
  );
}

/** 05.02 Category / Shop all listing: breadcrumb, Fraunces title, filter sidebar, 3-col grid. */
export function CategoryListing({ category, query }: { category?: Category; query?: string }) {
  let products: Product[] = category ? productsIn(category.slug) : PRODUCTS;
  if (query) {
    const q = query.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(q));
  }
  const title = query ? `Results for “${query}”` : (category?.name ?? 'Shop all');
  const noun = category?.noun ?? 'pieces';
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
          <p className="text-sm text-store-body md:text-title">
            {category?.description ?? 'Everything we make — hand-dyed and woven in small batches.'}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2.5 md:justify-end">
          <span className="text-ui text-store-body">
            {products.length} {noun}
          </span>
          <label className="relative flex items-center">
            <span className="sr-only">Sort products</span>
            <select
              defaultValue="best"
              className="appearance-none rounded-md border border-store-border bg-store-card py-[9px] pr-8 pl-3 text-ui font-medium text-store-ink"
            >
              <option value="best">Sort: Best selling</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Sort: Price, low to high</option>
              <option value="price-desc">Sort: Price, high to low</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 size-3.5 text-store-ink"
              aria-hidden
            />
          </label>
        </div>
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
            <Filters active={category} />
          </div>
        </details>
        <aside className="hidden w-[200px] shrink-0 md:block xl:w-[240px]">
          <Filters active={category} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 md:gap-5 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} variant="listing" />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-store-body">
              Nothing matches that search yet.{' '}
              <Link href="/shop" className="font-semibold text-store-primary">
                See everything
              </Link>
            </p>
          )}
          {products.length ? (
            <p className="py-3 text-center text-ui text-store-body">
              You’ve seen all {products.length} {noun}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
