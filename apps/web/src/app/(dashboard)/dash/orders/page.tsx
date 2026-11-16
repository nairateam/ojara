import { formatKobo, ORDER_TABS, type OrderListItemDto, type OrderTab } from '@ojara/shared';
import { ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/app/empty-state';
import { SplitPage } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { SearchField } from '@/components/dashboard/filters';
import { formatOrderTime, isTodayInLagos } from '@/components/dashboard/format';
import { type LinkTab, LinkTabs, StatusChips } from '@/components/dashboard/link-tabs';
import { OrderPanel } from '@/components/dashboard/order-detail';
import { FulfilmentBadge, PaymentBadge } from '@/components/ui/badge';
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
import { getOrder, listOrders } from '@/lib/api/orders';
import { requireMerchant } from '@/lib/auth/guards';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Orders' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 25;

const TAB_LABELS: Record<OrderTab, string> = {
  ALL: 'All',
  UNPAID: 'Unpaid',
  TO_FULFIL: 'To fulfil',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function param(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function href(params: { tab?: string; order?: string; q?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.tab && params.tab !== 'ALL') sp.set('tab', params.tab.toLowerCase());
  if (params.q) sp.set('q', params.q);
  if (params.page && params.page > 1) sp.set('page', String(params.page));
  if (params.order) sp.set('order', params.order);
  const s = sp.toString();
  return s ? `/orders?${s}` : '/orders';
}

function itemCount(o: OrderListItemDto) {
  return `${o.itemCount} item${o.itemCount === 1 ? '' : 's'}`;
}

/** 04.02 order card: name + meta, total, badges. */
function OrderCard({ order }: { order: OrderListItemDto }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-3.5"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[15px]/[21px] font-semibold">
            {order.customerName ?? 'Customer'}
          </span>
          <span className="text-xs text-fg-muted">
            #{order.number} · {formatOrderTime(order.createdAt)} · {itemCount(order)}
          </span>
        </span>
        <span className="text-[15px]/[21px] font-bold">{formatKobo(order.totalKobo)}</span>
      </span>
      <span className="flex items-center gap-2">
        <PaymentBadge status={order.paymentStatus} />
        <FulfilmentBadge status={order.fulfilmentStatus} />
        <span className="ml-auto truncate text-xs text-fg-subtle">
          {order.isPickup ? 'Pickup' : 'Delivery'}
        </span>
      </span>
    </Link>
  );
}

/** 03.03 Orders (desktop: tabs, search, table + right detail panel) and 04.02 (mobile cards). */
export default async function OrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { membership, summary } = await requireMerchant();
  const sp = await searchParams;
  const tabParam = param(sp.tab)?.toUpperCase();
  const tab = ORDER_TABS.find((t) => t === tabParam) ?? 'ALL';
  const q = param(sp.q)?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(param(sp.page) ?? '1', 10) || 1);
  const orderParam = param(sp.order);

  const [list, selected] = await Promise.all([
    listOrders(membership.id, { tab, q, page, pageSize: PAGE_SIZE }),
    orderParam ? getOrder(membership.id, orderParam) : Promise.resolve(null),
  ]);
  const orders = list.items;
  const keep = { tab, q };

  const tabs: LinkTab[] = ORDER_TABS.map((t) => ({
    key: t,
    label: TAB_LABELS[t],
    count: list.counts[t],
    href: href({ tab: t }),
  }));

  const today = orders.filter((o) => isTodayInLagos(o.createdAt));
  const earlier = orders.filter((o) => !isTodayInLagos(o.createdAt));
  const first = (page - 1) * PAGE_SIZE + 1;
  const last = first + orders.length - 1;

  const empty = (
    <EmptyState
      icon={ShoppingBag}
      title={
        q
          ? `No orders match “${q}”`
          : tab === 'ALL'
            ? 'No orders yet'
            : `No ${TAB_LABELS[tab].toLowerCase()} orders`
      }
      body={
        q
          ? 'Try an order number like 1047, a customer name or a phone number.'
          : 'Orders show up here as soon as a customer checks out on your store.'
      }
      action={
        q || tab !== 'ALL' ? (
          <Button variant="secondary" asChild>
            <Link href="/orders">Show all orders</Link>
          </Button>
        ) : undefined
      }
    />
  );

  return (
    <SplitPage
      panel={selected ? <OrderPanel order={selected} closeHref={href({ ...keep, page })} /> : null}
    >
      {/* Mobile (04.02): status chips + grouped cards. */}
      <div className="-mx-4 -mt-[18px] flex flex-col gap-3 lg:hidden">
        <StatusChips tabs={tabs} active={tab} />
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
                  <OrderCard key={o.id} order={o} />
                ))}
              </section>
            ) : null,
          )}
          {list.total > page * PAGE_SIZE ? (
            <Button variant="secondary" asChild>
              <Link href={href({ ...keep, page: page + 1 })}>Load more</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Desktop (03.03). */}
      <PageHeader
        className="hidden lg:flex"
        title="Orders"
        subtitle={`${list.counts.ALL} order${list.counts.ALL === 1 ? '' : 's'} · ${
          summary.openOrders
        } waiting on you`}
      />
      <LinkTabs tabs={tabs} active={tab} label="Order status" className="hidden lg:flex" />
      <div className="hidden flex-wrap gap-2 lg:flex">
        <SearchField
          placeholder="Order number, customer or phone"
          defaultValue={q}
          hidden={{ tab: tab === 'ALL' ? undefined : tab.toLowerCase() }}
          className="min-w-[220px] flex-1"
        />
      </div>
      <div className="hidden lg:block">
        {orders.length === 0 ? (
          empty
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-[18px]">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfilment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const isSelected = o.id === selected?.id;
                return (
                  <TableRow key={o.id} data-state={isSelected ? 'selected' : undefined}>
                    <TableCell className="pl-[18px]">
                      <span className="flex flex-col gap-0.5">
                        <Link
                          href={href({ ...keep, page, order: o.id })}
                          scroll={false}
                          className="hidden text-sm font-semibold hover:underline xl:inline"
                        >
                          #{o.number}
                        </Link>
                        <Link
                          href={`/orders/${o.id}`}
                          className="text-sm font-semibold hover:underline xl:hidden"
                        >
                          #{o.number}
                        </Link>
                        <span className="text-xs whitespace-nowrap text-fg-subtle">
                          {formatOrderTime(o.createdAt)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium whitespace-nowrap">
                          {o.customerName ?? 'Customer'}
                        </span>
                        <span className="text-xs whitespace-nowrap text-fg-muted">
                          {o.isPickup ? 'Pickup' : 'Delivery'}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">{formatKobo(o.totalKobo)}</span>
                        <span className="text-xs text-fg-subtle">{itemCount(o)}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <PaymentBadge status={o.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <FulfilmentBadge status={o.fulfilmentStatus} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <tfoot>
              <tr>
                <td colSpan={5} className={cn('p-0')}>
                  <TablePagination
                    summary={`Showing ${first}–${last} of ${list.total} orders`}
                    hasPrevious={page > 1}
                    hasNext={list.total > page * PAGE_SIZE}
                    previousHref={page > 1 ? href({ ...keep, page: page - 1 }) : undefined}
                    nextHref={href({ ...keep, page: page + 1 })}
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
