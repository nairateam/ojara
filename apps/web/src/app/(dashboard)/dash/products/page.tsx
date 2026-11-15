import { PLANS, formatKobo } from '@ojara/shared';
import { Ellipsis, Package, Plus, Upload } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/app/empty-state';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { FilterButton, SearchField } from '@/components/dashboard/filters';
import { LinkTabs } from '@/components/dashboard/link-tabs';
import { PlanLimitCard, PlanUsageBanner } from '@/components/dashboard/system-states';
import { Thumb } from '@/components/dashboard/thumb';
import { StatusPill, Tag } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/form-controls';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { MOCK_MERCHANT, PRODUCT_TABS, PRODUCTS } from '@/mock/dashboard';

export const metadata: Metadata = { title: 'Products' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function param(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** 03.04 Products: plan-limit banner (00.07 plan-limit card at the cap), tabs, product table. */
export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tab =
    PRODUCT_TABS.find((t) => t.key === param(sp.status)?.toUpperCase()) ?? PRODUCT_TABS[0];
  const q = param(sp.q)?.trim().toLowerCase();
  const limit = PLANS[MOCK_MERCHANT.plan].limits.maxProducts;
  const used = MOCK_MERCHANT.productCount;
  const atCap = used >= limit;

  const products = PRODUCTS.filter(
    (p) =>
      (tab.key === 'ALL' || p.status === tab.key) &&
      (!q || p.name.toLowerCase().includes(q) || p.meta.toLowerCase().includes(q)),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        subtitle="18 products · 15 published · 3 need restocking"
        className="max-lg:[&_h1]:hidden"
        actions={
          <>
            <Button variant="secondary" className="hidden sm:inline-flex">
              <Upload /> Import CSV
            </Button>
            <Button asChild className="hidden lg:inline-flex">
              <Link href="/products/new">
                <Plus /> Add product
              </Link>
            </Button>
          </>
        }
      />

      {atCap ? (
        <PlanLimitCard limit={limit} />
      ) : MOCK_MERCHANT.plan === 'FREE' ? (
        <PlanUsageBanner used={used} limit={limit} />
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:border-b lg:border-line">
        <LinkTabs
          className="lg:border-b-0"
          label="Product status"
          active={tab.key}
          tabs={PRODUCT_TABS.map((t) => ({
            key: t.key,
            label: t.label,
            count: t.count,
            href: t.key === 'ALL' ? '/products' : `/products?status=${t.key.toLowerCase()}`,
          }))}
        />
        <div className="flex flex-wrap gap-2 lg:pb-2">
          <SearchField
            placeholder="Search products or SKU"
            defaultValue={param(sp.q)}
            hidden={{ status: tab.key === 'ALL' ? undefined : tab.key.toLowerCase() }}
            className="min-w-[200px] flex-1 lg:w-[240px] lg:flex-none"
          />
          <FilterButton label="Category: All" />
          <FilterButton label="Stock: Any" />
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            q ? `No products match “${param(sp.q)}”` : `No ${tab.label.toLowerCase()} products`
          }
          body={
            tab.key === 'ARCHIVED'
              ? 'Archived products are hidden from your store and don’t count towards your plan.'
              : 'Add photos, a price and stock, and your product goes live on your store.'
          }
          action={
            <Button asChild>
              <Link href="/products/new">
                <Plus /> Add product
              </Link>
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[38px] pr-0 pl-[18px] md:table-cell">
                <Checkbox aria-label="Select all products" />
              </TableHead>
              <TableHead className="pl-4 md:pl-2.5">Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.slug}>
                <TableCell className="hidden pr-0 pl-[18px] md:table-cell">
                  <Checkbox aria-label={`Select ${p.name}`} />
                </TableCell>
                <TableCell className="pl-4 md:pl-2.5">
                  <Link href={`/products/${p.slug}`} className="flex items-center gap-2.5">
                    <Thumb src={p.image} size={40} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[13px]/[19px] font-semibold hover:underline">
                        {p.name}
                      </span>
                      <span className="text-xs text-fg-muted">{p.meta}</span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden text-[13px]/[19px] whitespace-nowrap md:table-cell">
                  {p.category}
                </TableCell>
                <TableCell className="text-[13px]/[19px] font-semibold">
                  {formatKobo(p.priceKobo)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="flex items-center gap-2 text-[13px]/[19px] whitespace-nowrap">
                    <span className={cn(p.stock === 0 && 'text-danger')}>
                      {p.stock === 0 ? '0' : `${p.stock} in stock`}
                    </span>
                    {p.stockTag ? (
                      <Tag className="text-[10px]/[14px]" tone={p.stockTag.tone}>
                        {p.stockTag.label}
                      </Tag>
                    ) : null}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {p.status === 'PUBLISHED' ? (
                    <StatusPill tone="success">Published</StatusPill>
                  ) : p.status === 'DRAFT' ? (
                    <StatusPill tone="neutral">Draft</StatusPill>
                  ) : (
                    <StatusPill tone="neutral">Archived</StatusPill>
                  )}
                </TableCell>
                <TableCell className="w-12 pr-4">
                  <button
                    type="button"
                    aria-label={`More actions for ${p.name}`}
                    className="inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-selected"
                  >
                    <Ellipsis className="size-4" aria-hidden />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot>
            <tr>
              <td colSpan={7} className="p-0">
                <TablePagination
                  summary={`Showing 1–${products.length} of ${tab.count} products`}
                  hasPrevious={false}
                  hasNext={products.length < tab.count}
                />
              </td>
            </tr>
          </tfoot>
        </Table>
      )}
    </PageContainer>
  );
}
