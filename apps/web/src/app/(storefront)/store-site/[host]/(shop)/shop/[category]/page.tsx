import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CategoryListing,
  nairaParamToKobo,
  parseListingParams,
} from '@/components/storefront/category-listing';
import { getShop } from '@/components/storefront/store';
import { listStorefrontProducts } from '@/lib/api/storefront';

type Props = {
  params: Promise<{ host: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store } = await getShop(params);
  const slug = (await params).category;
  const category = store.categories.find((c) => c.slug === slug);
  return category ? { title: category.name } : {};
}

/** 05.02 Category: products in one menu category (404 for unknown or hidden categories). */
export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ tenant, store }, { category }, sp] = await Promise.all([
    getShop(params),
    params,
    searchParams,
  ]);
  const listing = parseListingParams(sp);
  const list = await listStorefrontProducts(tenant.storeId, {
    category,
    q: listing.q,
    sort: listing.sort,
    min: nairaParamToKobo(listing.min),
    max: nairaParamToKobo(listing.max),
    inStock: listing.inStock ? '1' : undefined,
    page: listing.page,
  });
  if (!list) notFound();
  return (
    <CategoryListing
      store={store}
      list={list}
      params={listing}
      basePath={`/shop/${encodeURIComponent(category)}`}
    />
  );
}
