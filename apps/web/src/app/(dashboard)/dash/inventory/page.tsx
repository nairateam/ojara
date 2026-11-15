import { Boxes, Download, History, type LucideIcon, PackagePlus, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/app/empty-state';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { SearchField } from '@/components/dashboard/filters';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { KpiStripCard } from '@/components/dashboard/kpis';
import { LinkSegments } from '@/components/dashboard/link-tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  INVENTORY,
  INVENTORY_COUNTS,
  INVENTORY_DRAFT_NOTE,
  INVENTORY_KPIS,
  STOCK_CHANGES,
} from '@/mock/dashboard';

export const metadata: Metadata = { title: 'Inventory' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const CHANGE_ICONS: Record<(typeof STOCK_CHANGES)[number]['kind'], LucideIcon> = {
  order: ShoppingBag,
  released: History,
  restock: PackagePlus,
};

/** 03.06 Inventory: KPI strip, stock table with steppers + unsaved bar, recent stock changes. */
export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filterParam = Array.isArray(sp.filter) ? sp.filter[0] : sp.filter;
  const filter = filterParam === 'low' || filterParam === 'sold-out' ? filterParam : 'all';
  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = qRaw?.trim().toLowerCase();

  const rows = INVENTORY.filter((r) => {
    if (filter === 'low' && !(r.stock > 0 && r.stock <= r.alertAt)) return false;
    if (filter === 'sold-out' && r.stock !== 0) return false;
    if (q && !`${r.product} ${r.variant} ${r.sku}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <LinkSegments
        active={filter}
        tabs={[
          { key: 'all', label: 'All', count: INVENTORY_COUNTS.all, href: '/inventory' },
          { key: 'low', label: 'Low', count: INVENTORY_COUNTS.low, href: '/inventory?filter=low' },
          {
            key: 'sold-out',
            label: 'Sold out',
            count: INVENTORY_COUNTS.soldOut,
            href: '/inventory?filter=sold-out',
          },
        ]}
      />
      <SearchField
        placeholder="Product or SKU"
        defaultValue={qRaw}
        hidden={{ filter: filter === 'all' ? undefined : filter }}
        className="w-full sm:w-[220px]"
      />
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Inventory"
        className="max-lg:[&_h1]:hidden"
        subtitle="Stock for every product and variant. Paid orders reduce stock automatically."
        actions={
          <Button variant="secondary" className="hidden sm:inline-flex">
            <Download /> Export
          </Button>
        }
      />
      <KpiStripCard
        size="md"
        items={INVENTORY_KPIS.map((k) => ({
          label: k.label,
          value: k.value,
          context: k.context,
          valueTone: k.tone,
        }))}
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        {rows.length ? (
          <InventoryTable
            key={`${filter}-${q ?? ''}`}
            rows={rows}
            note={INVENTORY_DRAFT_NOTE}
            toolbar={toolbar}
          />
        ) : (
          <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
            {toolbar}
            <EmptyState
              icon={Boxes}
              className="rounded-none border-0 border-t"
              title="Nothing here"
              body={q ? `No variants match “${qRaw}”.` : 'Every variant is above its alert level.'}
            />
          </div>
        )}

        <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
          <h2 className="px-[18px] py-4 text-[15px]/[21px] font-semibold">Recent stock changes</h2>
          <ul>
            {STOCK_CHANGES.map((c, i) => {
              const Icon = CHANGE_ICONS[c.kind];
              return (
                <li key={i} className="flex gap-3 border-t border-line px-[18px] py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-fg-muted">
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13px]/[19px] font-semibold">{c.title}</span>
                    <span
                      className={cn(
                        'text-xs',
                        c.detail.startsWith('+') ? 'text-success' : 'text-fg-muted',
                      )}
                    >
                      {c.detail}
                    </span>
                    <span className="text-[11px]/[14px] text-fg-subtle">{c.time}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </PageContainer>
  );
}
