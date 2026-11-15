import { formatKobo } from '@ojara/shared';
import { Download, Mail, MapPin, MessageCircle, Phone, Store, Users, X } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/app/empty-state';
import { SplitPage } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { SearchField } from '@/components/dashboard/filters';
import { LinkTabs } from '@/components/dashboard/link-tabs';
import { FulfilmentBadge, PlanLockTag, Tag } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/feedback';
import { PanelBlock } from '@/components/dashboard/panel-block';
import { DetailPanel } from '@/components/ui/panels';
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
import { CUSTOMER_TABS, CUSTOMERS, type MockCustomer } from '@/mock/dashboard';

export const metadata: Metadata = { title: 'Customers' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const DEFAULT_SELECTED = 'chiamaka-obi';

function param(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function link(params: { segment?: string; customer?: string; q?: string }) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/customers?${s}` : '/customers';
}

function inSegment(c: MockCustomer, segment: string) {
  if (segment === 'repeat') return c.tag === 'Repeat';
  if (segment === 'new') return c.tag === 'New';
  if (segment === 'quiet') return !c.tag;
  return true;
}

/** Customer detail: header, stats, contact, order history, Professional-only notes. */
function CustomerDetail({ c, closeHref }: { c: MockCustomer; closeHref: string }) {
  const avg = c.orders ? Math.round(c.spentKobo / c.orders / 100) * 100 : 0;
  return (
    <>
      <div className="flex flex-col gap-4 border-b border-line px-6 py-5">
        <div className="flex items-start gap-3.5">
          <Avatar name={c.name} size={48} className="text-[15px]/[21px]" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 className="truncate font-display text-[22px] font-semibold tracking-[-0.4px]">
              {c.name}
            </h2>
            <span className="text-xs text-fg-muted">Customer since {c.since}</span>
          </span>
          <Link
            href={closeHref}
            scroll={false}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-selected"
          >
            <X className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid grid-cols-3 overflow-hidden rounded-md bg-paper">
          {[
            { v: String(c.orders), l: 'Orders' },
            { v: formatKobo(c.spentKobo), l: 'Total spent' },
            { v: formatKobo(avg), l: 'Avg order' },
          ].map((s, i) => (
            <span
              key={s.l}
              className={cn(
                'flex min-w-0 flex-col gap-0.5 px-4 py-2.5',
                i && 'border-l border-line',
              )}
            >
              <span className="truncate text-[15px]/[21px] font-semibold">{s.v}</span>
              <span className="text-[11px]/[14px] text-fg-muted">{s.l}</span>
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary">
            <MessageCircle /> WhatsApp
          </Button>
          <Button variant="secondary">
            <Phone /> Call
          </Button>
        </div>
      </div>
      <PanelBlock label="Contact & delivery">
        <ul className="flex flex-col gap-3 text-[13px]/[19px]">
          <li className="flex items-center gap-2.5">
            <Phone className="size-[15px] shrink-0 text-fg-subtle" aria-hidden /> {c.phone}
          </li>
          <li className="flex items-center gap-2.5">
            <Mail className="size-[15px] shrink-0 text-fg-subtle" aria-hidden /> {c.email}
          </li>
          {c.addressUses ? (
            <li className="flex items-center gap-2.5">
              <MapPin className="size-[15px] shrink-0 text-fg-subtle" aria-hidden />
              {c.address} · used {c.addressUses}×
            </li>
          ) : null}
          {c.pickups ? (
            <li className="flex items-center gap-2.5">
              <Store className="size-[15px] shrink-0 text-fg-subtle" aria-hidden />
              Picked up at Surulere studio · {c.pickups}×
            </li>
          ) : null}
        </ul>
      </PanelBlock>
      <PanelBlock label="Order history">
        <ul className="flex flex-col gap-3">
          {c.history.map((h) => (
            <li key={h.number} className="flex items-center justify-between gap-3">
              <Link href={`/orders?order=${h.number.slice(1)}`} className="flex flex-col">
                <span className="text-[13px]/[19px] font-semibold hover:underline">{h.number}</span>
                <span className="text-xs text-fg-muted">
                  {h.date} · {formatKobo(h.totalKobo)}
                </span>
              </Link>
              <FulfilmentBadge status={h.status} />
            </li>
          ))}
        </ul>
        {c.orders > c.history.length || c.orders > 1 ? (
          <Link
            href={`/orders?q=${encodeURIComponent(c.name)}`}
            className="text-[13px]/[19px] font-semibold"
          >
            View all {c.orders} orders
          </Link>
        ) : null}
      </PanelBlock>
      <PanelBlock label="Private notes & tags" action={<PlanLockTag plan="PROFESSIONAL" />}>
        <p className="text-xs leading-[18px] text-fg-muted">
          Remember sizes, preferences and VIP tags for your best customers. Available on the
          Professional plan.
        </p>
      </PanelBlock>
    </>
  );
}

/** 03.07 Customers: tabs, search, table + customer detail panel. */
export default async function CustomersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const segment = CUSTOMER_TABS.find((t) => t.key === param(sp.segment))?.key ?? 'all';
  const qRaw = param(sp.q);
  const q = qRaw?.trim().toLowerCase();
  const customerParam = param(sp.customer);
  const selectedId = customerParam === 'none' ? undefined : (customerParam ?? DEFAULT_SELECTED);
  const selected = CUSTOMERS.find((c) => c.id === selectedId);
  const keep = { segment: segment === 'all' ? undefined : segment, q: qRaw };
  const closeHref = link({ ...keep, customer: 'none' });
  const tab = CUSTOMER_TABS.find((t) => t.key === segment) ?? CUSTOMER_TABS[0];

  const customers = CUSTOMERS.filter(
    (c) =>
      inSegment(c, segment) && (!q || `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q)),
  );

  return (
    <SplitPage
      panel={
        selected ? (
          <DetailPanel aria-label={selected.name} className="w-[404px]">
            <CustomerDetail c={selected} closeHref={closeHref} />
          </DetailPanel>
        ) : null
      }
    >
      <PageHeader
        title="Customers"
        className="max-lg:[&_h1]:hidden"
        subtitle="214 people have bought from you · 38% came back for more"
        actions={
          <Button variant="secondary" className="hidden sm:inline-flex">
            <Download /> Export
          </Button>
        }
      />
      <LinkTabs
        label="Customer segment"
        active={segment}
        tabs={CUSTOMER_TABS.map((t) => ({
          key: t.key,
          label: t.label,
          count: t.count,
          href: link({ segment: t.key === 'all' ? undefined : t.key, customer: customerParam }),
        }))}
      />
      <SearchField
        placeholder="Name, phone number or email"
        defaultValue={qRaw}
        hidden={{ segment: keep.segment }}
      />

      {customerParam && selected ? (
        <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface xl:hidden">
          <CustomerDetail c={selected} closeHref={closeHref} />
        </section>
      ) : null}

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers here yet"
          body={
            q
              ? `Nobody matches “${qRaw}”. Try a phone number or email.`
              : 'Customers appear here after their first paid order.'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-[18px]">Customer</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Orders</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="hidden sm:table-cell">Last order</TableHead>
              <TableHead className="hidden md:table-cell">Area</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => {
              const on = c.id === selected?.id;
              return (
                <TableRow key={c.id} data-state={on ? 'selected' : undefined}>
                  <TableCell className="h-[54px] py-2.5 pl-[18px]">
                    <Link
                      href={link({ ...keep, customer: c.id })}
                      scroll={false}
                      className="flex items-center gap-3"
                    >
                      <Avatar name={c.name} className="text-fg-muted" />
                      <span className="flex min-w-0 flex-col">
                        <span className="flex items-center gap-2">
                          <span className="text-[13px]/[19px] font-semibold whitespace-nowrap hover:underline">
                            {c.name}
                          </span>
                          {c.tag ? (
                            <Tag
                              className="text-[10px]/[14px]"
                              tone={c.tag === 'Repeat' ? 'success' : 'info'}
                            >
                              {c.tag}
                            </Tag>
                          ) : null}
                        </span>
                        <span className="text-xs whitespace-nowrap text-fg-muted">{c.phone}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-right text-[13px]/[19px] sm:table-cell">
                    {c.orders}
                  </TableCell>
                  <TableCell className="text-right text-[13px]/[19px] font-semibold">
                    {formatKobo(c.spentKobo)}
                  </TableCell>
                  <TableCell className="hidden text-[13px]/[19px] whitespace-nowrap sm:table-cell">
                    {c.lastOrder}
                  </TableCell>
                  <TableCell className="hidden text-[13px]/[19px] whitespace-nowrap md:table-cell">
                    {c.area}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <tfoot>
            <tr>
              <td colSpan={5} className="p-0">
                <TablePagination
                  summary={`Showing 1–${customers.length} of ${tab.count} · sorted by total spent`}
                  hasPrevious={false}
                  hasNext={customers.length < tab.count}
                />
              </td>
            </tr>
          </tfoot>
        </Table>
      )}
    </SplitPage>
  );
}
