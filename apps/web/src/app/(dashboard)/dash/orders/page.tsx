import { FULFILMENT_STATUSES, type FulfilmentStatus, formatKobo } from '@ojara/shared';
import { Download, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/app/empty-state';
import { SplitPage } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { FilterButton, SearchField } from '@/components/dashboard/filters';
import { LinkTabs, StatusChips, type LinkTab } from '@/components/dashboard/link-tabs';
import { OrderPanel } from '@/components/dashboard/order-detail';
import { FulfilmentBadge, PaymentBadge } from '@/components/ui/badge';
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
import { requireMerchant } from '@/lib/auth/guards';
import { cn } from '@/lib/utils';
import { type MockOrder, ORDER_STATUS_COUNTS, ORDERS, findOrder } from '@/mock/dashboard';

export const metadata: Metadata = { title: 'Orders' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const DEFAULT_SELECTED = 'OJ-1047';

function param(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function href(params: { status?: string; order?: string; q?: string }) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/orders?${s}` : '/orders';
}

function filterOrders(status: FulfilmentStatus | undefined, q: string | undefined) {
  const query = q?.trim().toLowerCase();
  return ORDERS.filter((o) => {
    if (status && o.fulfilment !== status) return false;
    if (!query) return true;
    return (
      o.number.toLowerCase().includes(query) ||
      o.customer.toLowerCase().includes(query) ||
      o.place.toLowerCase().includes(query)
    );
  });
}

/** 04.02 order card: name + meta, total, badges, place. Selected card has a 1.5px forest ring. */
function OrderCard({ order, selected }: { order: MockOrder; selected: boolean }) {
  const items = order.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <Link
      href={`/orders/${order.id}`}
      className={cn(
        'flex flex-col gap-2.5 rounded-lg bg-surface p-3.5',
        selected ? 'border-[1.5px] border-forest' : 'border border-line',
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[15px]/[21px] font-semibold">{order.customer}</span>
          <span className="text-xs text-fg-muted">
            {order.number} · {order.placedShort} · {items} item{items === 1 ? '' : 's'}
          </span>
        </span>
        <span className="text-[15px]/[21px] font-bold">{formatKobo(order.totalKobo)}</span>
      </span>
      <span className="flex items-center gap-2">
        <PaymentBadge status={order.payment} />
        <FulfilmentBadge status={order.fulfilment} />
        <span className="ml-auto truncate text-xs text-fg-subtle">{order.placeShort}</span>
      </span>
    </Link>
  );
}

/** 03.03 Orders (desktop: tabs, filters, table + right detail panel) and 04.02 (mobile cards). */
export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { summary } = await requireMerchant();
  const sp = await searchParams;
  const statusParam = param(sp.status)?.toUpperCase();
  const status = FULFILMENT_STATUSES.find((s) => s === statusParam);
  const q = param(sp.q);
  const orderParam = param(sp.order);

  const orders = filterOrders(status, q);
  const selectedId = orderParam === 'none' ? undefined : (orderParam ?? DEFAULT_SELECTED);
  const selected = selectedId ? findOrder(selectedId) : undefined;
  const statusKey = status ?? 'ALL';
  const total = ORDER_STATUS_COUNTS.find((t) => t.key === statusKey)?.count ?? orders.length;
  const statusLabel = ORDER_STATUS_COUNTS.find((t) => t.key === statusKey)?.label ?? 'All';

  const tabs: LinkTab[] = ORDER_STATUS_COUNTS.map((t) => ({
    key: t.key,
    label: t.label,
    count: t.count,
    href: href({ status: t.key === 'ALL' ? undefined : t.key.toLowerCase(), order: orderParam }),
  }));
  const keep = { status: status?.toLowerCase(), q };

  const today = orders.filter((o) => o.group === 'today');
  const earlier = orders.filter((o) => o.group === 'earlier');

  const empty = (
    <EmptyState
      icon={ShoppingBag}
      title={q ? `No orders match “${q}”` : `No ${statusLabel.toLowerCase()} orders`}
      body={
        q
          ? 'Try an order number like OJ-1047, a customer name or a phone number.'
          : 'Orders show up here as soon as a customer checks out on your store.'
      }
      action={
        <Button variant="secondary" asChild>
          <Link href="/orders">Show all orders</Link>
        </Button>
      }
    />
  );

  return (
    <SplitPage
      panel={
        selected ? (
          <OrderPanel order={selected} closeHref={href({ ...keep, order: 'none' })} />
        ) : null
      }
    >
      {/* Mobile (04.02): status chips + grouped cards. */}
      <div className="-mx-4 -mt-[18px] flex flex-col gap-3 lg:hidden">
        <StatusChips tabs={tabs} active={statusKey} />
        <div className="flex flex-col gap-2.5 px-4">
          {orders.length === 0 ? empty : null}
          {[
            { label: 'Today', list: today },
            { label: 'Earlier', list: earlier },
          ].map((g) =>
            g.list.length ? (
              <section key={g.label} className="flex flex-col gap-2.5">
                <h2 className="text-[11px]/[14px] font-semibold tracking-label text-fg-subtle uppercase">
                  {g.label}
                </h2>
                {g.list.map((o) => (
                  <OrderCard key={o.id} order={o} selected={o.id === selected?.id} />
                ))}
              </section>
            ) : null,
          )}
        </div>
      </div>

      {/* Desktop (03.03). */}
      <PageHeader
        className="hidden lg:flex"
        title="Orders"
        subtitle={`86 orders in the last 30 days · ${summary.openOrders} waiting on you`}
        actions={
          <Button variant="secondary">
            <Download /> Export
          </Button>
        }
      />
      <LinkTabs tabs={tabs} active={statusKey} label="Order status" className="hidden lg:flex" />
      <div className="hidden flex-wrap gap-2 lg:flex">
        <SearchField
          placeholder="Order number, customer or phone"
          defaultValue={q}
          hidden={{ status: keep.status }}
          className="min-w-[220px] flex-1"
        />
        <FilterButton label="Payment: Any" />
        <FilterButton label="Delivery: Any" />
        <FilterButton label="Last 30 days" />
      </div>
      <div className="hidden lg:block">
        {orders.length === 0 ? (
          empty
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[38px] pr-0 pl-[18px]">
                  <Checkbox aria-label="Select all orders" />
                </TableHead>
                <TableHead className="pl-2.5">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfilment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const isSelected = o.id === selected?.id;
                const items = o.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <TableRow key={o.id} data-state={isSelected ? 'selected' : undefined}>
                    <TableCell className="pr-0 pl-[18px]">
                      <Checkbox aria-label={`Select ${o.number}`} defaultChecked={isSelected} />
                    </TableCell>
                    <TableCell className="pl-2.5">
                      <span className="flex flex-col gap-0.5">
                        <Link
                          href={href({ ...keep, order: o.id })}
                          scroll={false}
                          className="hidden text-sm font-semibold hover:underline xl:inline"
                        >
                          {o.number}
                        </Link>
                        <Link
                          href={`/orders/${o.id}`}
                          className="text-sm font-semibold hover:underline xl:hidden"
                        >
                          {o.number}
                        </Link>
                        <span className="text-xs whitespace-nowrap text-fg-subtle">{o.placed}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium whitespace-nowrap">{o.customer}</span>
                        <span className="text-xs whitespace-nowrap text-fg-muted">
                          {o.method} · {o.place}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">{formatKobo(o.totalKobo)}</span>
                        <span className="text-xs text-fg-subtle">
                          {items} item{items === 1 ? '' : 's'}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <PaymentBadge status={o.payment} />
                    </TableCell>
                    <TableCell>
                      <FulfilmentBadge status={o.fulfilment} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <tfoot>
              <tr>
                <td colSpan={6} className="p-0">
                  <TablePagination
                    summary={`Showing 1–${orders.length} of ${total} orders`}
                    hasPrevious={false}
                    hasNext={orders.length < total}
                  />
                </td>
              </tr>
            </tfoot>
          </Table>
        )}
      </div>
    </SplitPage>
  );
}
