import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CategoryListing,
  nairaParamToKobo,
  parseListingParams,
} from '@/components/storefront/category-listing';
import { getShop, type HostParams } from '@/components/storefront/store';
import { listStorefrontProducts } from '@/lib/api/storefront';

export const metadata: Metadata = { title: 'Shop all' };

type Props = {
  params: HostParams;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** /shop: every published product (05.02 layout); `?q=` searches by name (header search). */
export default async function ShopAllPage({ params, searchParams }: Props) {
  const [{ tenant, store }, sp] = await Promise.all([getShop(params), searchParams]);
  const listing = parseListingParams(sp);
  const list = await listStorefrontProducts(tenant.storeId, {
    q: listing.q,
    sort: listing.sort,
    min: nairaParamToKobo(listing.min),
    max: nairaParamToKobo(listing.max),
    inStock: listing.inStock ? '1' : undefined,
    page: listing.page,
  });
  if (!list) notFound();
  return <CategoryListing store={store} list={list} params={listing} basePath="/shop" />;
}
