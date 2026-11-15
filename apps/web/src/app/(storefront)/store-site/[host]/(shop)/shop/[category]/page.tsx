import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CategoryListing } from '@/components/storefront/category-listing';
import { getCategory } from '@/mock/storefront';

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).category);
  return category ? { title: category.name } : {};
}

/** 05.02 Category. */
export default async function CategoryPage({ params }: Props) {
  const category = getCategory((await params).category);
  if (!category) notFound();
  return <CategoryListing category={category} />;
}
