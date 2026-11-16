import { PLANS } from '@ojara/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { ProductEditor } from '@/components/dashboard/product-editor';
import { PlanLimitCard } from '@/components/dashboard/system-states';
import { getProduct, listCategories } from '@/lib/api/catalog';
import { getActiveStore, requireMerchant } from '@/lib/auth/guards';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; archived?: string; restored?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (id === 'new') return { title: 'Add product' };
  const store = await getActiveStore();
  const product = store ? await getProduct(store.id, id) : null;
  return { title: product?.name ?? 'Product not found' };
}

/** 03.05 Edit Product (also /products/new). */
export default async function EditProductPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === 'new';
  const { membership, summary, storeAddress } = await requireMerchant();
  const limits = PLANS[summary.plan].limits;

  if (isNew && summary.productCount >= limits.maxProducts) {
    return (
      <PageContainer>
        <PageHeader back={{ href: '/products', label: 'Products' }} title="Add product" />
        <PlanLimitCard limit={limits.maxProducts} className="max-w-[640px]" />
      </PageContainer>
    );
  }

  const [product, categories] = await Promise.all([
    isNew ? null : getProduct(membership.id, id),
    listCategories(membership.id),
  ]);
  if (!isNew && !product) notFound();

  const notice = sp.saved
    ? 'saved'
    : sp.archived
      ? 'archived'
      : sp.restored
        ? 'restored'
        : undefined;

  return (
    <PageContainer className="gap-5 md:pt-6">
      <ProductEditor
        // Remount after a save so the form shows exactly what was stored.
        key={product?.updatedAt ?? 'new'}
        product={product}
        categories={[
          ...categories.categories,
          // Keep showing the product's own category if it has since been archived.
          ...categories.archived
            .filter((c) => c.id === product?.categoryId)
            .map((c) => ({ ...c, name: `${c.name} (archived)` })),
        ].map((c) => ({ id: c.id, name: c.name }))}
        storeName={summary.store.name}
        storeAddress={storeAddress}
        promotionsAllowed={limits.promotions}
        storeId={membership.id}
        maxImages={limits.maxImagesPerProduct}
        maxImageBytes={limits.maxImageBytes}
        notice={notice}
      />
    </PageContainer>
  );
}
