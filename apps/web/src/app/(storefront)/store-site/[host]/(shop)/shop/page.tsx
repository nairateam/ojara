import type { Metadata } from 'next';
import { CategoryListing } from '@/components/storefront/category-listing';

export const metadata: Metadata = { title: 'Shop all' };

/** /shop: every product (05.02 layout); `?q=` filters by name (header search). */
export default async function ShopAllPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim();
  return <CategoryListing query={query || undefined} />;
}
