import { formatKobo, PLANS, type ProductListItemDto, PRODUCT_LIST_TABS } from '@ojara/shared';
import { Package, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/app/empty-state';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { SearchField } from '@/components/dashboard/filters';
import { LinkTabs } from '@/components/dashboard/link-tabs';
import { PlanLimitCard, PlanUsageBanner } from '@/components/dashboard/system-states';
import { InitialThumb } from '@/components/dashboard/thumb';
import { StatusPill, Tag } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from '@/components/ui/table';
import { listProducts } from '@/lib/api/catalog';
import { requireMerchant } from '@/lib/auth/guards';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Products' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 25;
const TAB_LABELS: Record<(typeof PRODUCT_LIST_TABS)[number], string> = {
  ALL: 'All',
  PUBLISHED: 'Published',
  DRAFT: 'Drafts',
  ARCHIVED: 'Archived',
};

function param(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function listHref(status: string, q: string | undefined, page = 1): string {
  const params = new URLSearchParams();
  if (status !== 'ALL') params.set('status', status.toLowerCase());
  if (q) params.set('q', q);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : '/products';
}

function StockCell({ p }: { p: ProductListItemDto }) {
  if (!p.trackStock) return <span className="text-fg-muted">Not tracked</span>;
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <span className={cn(p.stockTotal === 0 && 'text-danger')}>
        {p.stockTotal === 0 ? 'Sold out' : `${p.stockTotal} in stock`}
      </span>
      {p.outOfStockCount > 0 && p.stockTotal > 0 ? (
        <Tag className="text-[10px]/[14px]" tone="danger">
          {p.outOfStockCount} sold out
        </Tag>
      ) : p.lowStockCount > 0 ? (
        <Tag className="text-[10px]/[14px]" tone="warning">
          {p.lowStockCount} low
        </Tag>
      ) : null}
    </span>
  );
}

/**
 * 03.04 Products: plan usage (00.07 plan-limit card at the cap), status tabs with counts, search
 * by name or SKU, server-side paging.
 */
export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const statusParam = param(sp.status)?.toUpperCase();
  const tab = PRODUCT_LIST_TABS.find((t) => t === statusParam) ?? 'ALL';
  const q = param(sp.q)?.trim() || undefined;
  const page = Math.max(1, Number(param(sp.page)) || 1);

  const { membership, summary } = await requireMerchant();
  const list = await listProducts(membership.id, {
    ...(tab !== 'ALL' ? { status: tab } : {}),
    ...(q ? { q } : {}),
    page,
    pageSize: PAGE_SIZE,
  });

  const limit = PLANS[summary.plan].limits.maxProducts;
  const used = summary.productCount;
  const atCap = used >= limit;
  const from = list.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, list.total);

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        subtitle={`${list.counts.ALL} products · ${list.counts.PUBLISHED} published`}
        className="max-lg:[&_h1]:hidden"
        actions={
          atCap ? null : (
            <Button asChild className="hidden lg:inline-flex">
              <Link href="/products/new">
                <Plus /> Add product
              </Link>
            </Button>
          )
        }
      />

      {atCap ? (
        <PlanLimitCard limit={limit} />
      ) : summary.plan === 'FREE' ? (
        <PlanUsageBanner used={used} limit={limit} />
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:border-b lg:border-line">
        <LinkTabs
          className="lg:border-b-0"
          label="Product status"
          active={tab}
          tabs={PRODUCT_LIST_TABS.map((t) => ({
            key: t,
            label: TAB_LABELS[t],
            count: list.counts[t] ?? 0,
            href: listHref(t, q),
          }))}
        />
        <div className="flex flex-wrap gap-2 lg:pb-2">
          <SearchField
            placeholder="Search products or SKU"
            defaultValue={q}
            hidden={{ status: tab === 'ALL' ? undefined : tab.toLowerCase() }}
            className="min-w-[200px] flex-1 lg:w-[240px] lg:flex-none"
          />
        </div>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            q
              ? `No products match “${q}”`
              : tab === 'ALL'
                ? 'No products yet'
                : `No ${TAB_LABELS[tab].toLowerCase()} products`
          }
          body={
            tab === 'ARCHIVED'
              ? 'Archived products are hidden from your store and don’t count towards your plan.'
              : 'Add a name, price and stock, and publish it to show it on your store.'
          }
          action={
            atCap ? undefined : (
              <Button asChild>
                <Link href="/products/new">
                  <Plus /> Add product
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4 md:pl-[18px]">Product</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="pl-4 md:pl-[18px]">
                  <Link href={`/products/${p.id}`} className="flex items-center gap-2.5">
                    <InitialThumb name={p.name} size={40} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[13px]/[19px] font-semibold hover:underline">
                        {p.name}
                      </span>
                      <span className="text-xs text-fg-muted">
                        {p.variantCount === 1 ? '1 variant' : `${p.variantCount} variants`}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden text-[13px]/[19px] whitespace-nowrap md:table-cell">
                  {p.categoryName ?? <span className="text-fg-muted">—</span>}
                </TableCell>
                <TableCell className="text-[13px]/[19px] font-semibold whitespace-nowrap">
                  {p.promoPriceKobo !== null ? (
                    <span className="flex flex-col">
                      {formatKobo(p.promoPriceKobo)}
                      <span className="text-xs font-normal text-fg-muted line-through">
                        {formatKobo(p.basePriceKobo)}
                      </span>
                    </span>
                  ) : (
                    formatKobo(p.basePriceKobo)
                  )}
                </TableCell>
                <TableCell className="hidden text-[13px]/[19px] sm:table-cell">
                  <StockCell p={p} />
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
              </TableRow>
            ))}
          </TableBody>
          <tfoot>
            <tr>
              <td colSpan={5} className="p-0">
                <TablePagination
                  summary={`Showing ${from}–${to} of ${list.total} products`}
                  hasPrevious={page > 1}
                  hasNext={to < list.total}
                  previousHref={listHref(tab, q, page - 1)}
                  nextHref={listHref(tab, q, page + 1)}
                />
              </td>
            </tr>
          </tfoot>
        </Table>
      )}
    </PageContainer>
  );
}
