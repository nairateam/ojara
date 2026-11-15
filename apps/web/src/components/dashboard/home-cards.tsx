import { formatKobo } from '@ojara/shared';
import {
  ArrowRight,
  ChevronRight,
  CreditCard,
  Link2,
  type LucideIcon,
  MessageCircle,
  PackageOpen,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { FulfilmentBadge, PaymentBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/feedback';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { AttentionKind, MockOrder } from '@/mock/dashboard';
import { CopyButton } from './copy-button';
import { formatCompactKobo } from './format';
import { Thumb } from './thumb';

const cardCls = 'flex flex-col rounded-lg border border-line bg-surface';

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-[13px]/[19px] font-medium hover:underline"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden />
    </Link>
  );
}

/* --------------------------------------------- Daily sales chart (03.01) */

type Day = { label: string; kobo: number; orders: number };

function niceMax(max: number, steps: number) {
  const raw = max / steps;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 4, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  return step * steps;
}

function Bars({ days, metric }: { days: Day[]; metric: 'kobo' | 'orders' }) {
  const values = days.map((d) => d[metric]);
  const top = niceMax(Math.max(...values), 3);
  const ticks = [3, 2, 1, 0].map((i) => (top / 3) * i);
  const fmt = (v: number) => (metric === 'kobo' ? formatCompactKobo(v) : String(Math.round(v)));
  return (
    <div className="flex h-[220px] gap-3">
      <div
        className="flex flex-col justify-between pb-6 text-[11px]/[14px] text-fg-subtle"
        aria-hidden
      >
        {ticks.map((t) => (
          <span key={t}>{fmt(t)}</span>
        ))}
      </div>
      <ul className="flex flex-1 gap-1.5 sm:gap-2.5">
        {days.map((d, i) => {
          const today = i === days.length - 1;
          const v = d[metric];
          return (
            <li key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span
                className="group relative flex w-full flex-1 flex-col justify-end rounded-[6px] bg-surface-muted"
                title={`${today ? 'Today' : `${d.label} Nov`}: ${fmt(v)}`}
              >
                <span
                  className={cn('w-full rounded-[6px]', today ? 'bg-forest' : 'bg-chart-muted')}
                  style={{ height: `${(v / top) * 100}%` }}
                />
                <span className="sr-only">
                  {today ? 'Today' : `${d.label} November`}: {fmt(v)}
                </span>
              </span>
              <span
                className={cn(
                  'text-[11px]/[14px]',
                  today ? 'font-semibold text-fg' : 'text-fg-subtle',
                  !today && i % 2 === 1 && 'max-sm:invisible',
                )}
                aria-hidden
              >
                {d.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Daily sales card: 14 bars on #E0E3D1 tracks, today in forest; Sales/Orders segmented. */
export function DailySalesCard({ days }: { days: Day[] }) {
  return (
    <section className={cn(cardCls, 'gap-5 p-[22px]')}>
      <Tabs defaultValue="sales" className="gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[15px]/[21px] font-semibold">Daily sales</h2>
            <p className="text-xs text-fg-muted">Paid orders only · last 14 days</p>
          </div>
          <TabsList variant="segmented">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="sales">
          <Bars days={days} metric="kobo" />
        </TabsContent>
        <TabsContent value="orders">
          <Bars days={days} metric="orders" />
        </TabsContent>
      </Tabs>
    </section>
  );
}

/* --------------------------------------------- Recent orders (03.01) */

export function RecentOrdersCard({ orders }: { orders: MockOrder[] }) {
  return (
    <section className={cardCls}>
      <div className="flex items-center justify-between px-[22px] py-[18px]">
        <h2 className="text-[15px]/[21px] font-semibold">Recent orders</h2>
        <CardLink href="/orders">View all orders</CardLink>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <TableHeader className="border-t border-line">
            <TableRow>
              <TableHead className="pl-[22px]">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="pr-[22px]">Fulfilment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="pl-[22px]">
                  <Link
                    href={`/orders?order=${o.id}`}
                    className="flex flex-col gap-0.5 whitespace-nowrap"
                  >
                    <span className="font-semibold">{o.number}</span>
                    <span className="text-xs text-fg-subtle">
                      {o.group === 'today' ? o.placed : o.placed.split(',')[0]}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2.5 whitespace-nowrap">
                    <Avatar name={o.customer} className="text-fg-muted" />
                    <span className="font-medium">{o.customer}</span>
                  </span>
                </TableCell>
                <TableCell className="font-semibold">{formatKobo(o.totalKobo)}</TableCell>
                <TableCell>
                  <PaymentBadge status={o.payment} />
                </TableCell>
                <TableCell className="pr-[22px]">
                  <FulfilmentBadge status={o.fulfilment} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </section>
  );
}

/* --------------------------------------------- Needs attention (03.01 / 04.01) */

const ATTENTION: Record<AttentionKind, { icon: LucideIcon; cls: string }> = {
  fulfil: { icon: PackageOpen, cls: 'bg-warning-soft text-warning' },
  payment: { icon: CreditCard, cls: 'bg-danger-soft text-danger' },
  stock: { icon: TriangleAlert, cls: 'bg-attention-soft text-warning' },
};

export function NeedsAttentionCard({
  items,
  compact = false,
  className,
}: {
  items: {
    kind: AttentionKind;
    title: string;
    detail: string;
    mobileDetail: string;
    href: string;
  }[];
  /** 04.01 mobile: radius 14, padding 14/16 header and 12/16 rows. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <section className={cn(cardCls, compact && 'rounded-[14px]', className)}>
      <div
        className={cn(
          'flex items-center justify-between',
          compact ? 'px-4 py-3.5' : 'px-[22px] py-[18px]',
        )}
      >
        <h2 className="text-[15px]/[21px] font-semibold">Needs attention</h2>
        <span className="rounded-pill bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
          {items.length}
        </span>
      </div>
      <ul>
        {items.map((item) => {
          const a = ATTENTION[item.kind];
          return (
            <li key={item.title} className="border-t border-line">
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 hover:bg-selected/60',
                  compact ? 'px-4 py-3' : 'px-[22px] py-3.5',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-[9px]',
                    a.cls,
                  )}
                >
                  <a.icon className="size-[18px]" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold">{item.title}</span>
                  <span className="truncate text-xs text-fg-muted">
                    {compact ? item.mobileDetail : item.detail}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* --------------------------------------------- Best sellers (03.01) */

export function BestSellersCard({
  items,
}: {
  items: { name: string; sold: number; kobo: number; image: string; slug: string }[];
}) {
  return (
    <section className={cardCls}>
      <div className="flex items-center justify-between px-[22px] py-[18px]">
        <h2 className="text-[15px]/[21px] font-semibold">Best sellers</h2>
        <CardLink href="/products">Products</CardLink>
      </div>
      <ol>
        {items.map((p, i) => (
          <li key={p.slug} className="border-t border-line">
            <Link
              href={`/products/${p.slug}`}
              className="flex items-center gap-3 px-[22px] py-[11px] hover:bg-selected/60"
            >
              <span className="w-2 text-xs font-semibold text-fg-subtle">{i + 1}</span>
              <Thumb src={p.image} size={40} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{p.name}</span>
                <span className="text-xs text-fg-muted">{p.sold} sold</span>
              </span>
              <span className="text-[13px]/[19px] font-semibold">{formatKobo(p.kobo)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* --------------------------------------------- Share your store (03.01 / 04.01) */

export function ShareStoreCard({ address, url }: { address: string; url: string }) {
  const text = encodeURIComponent(`Shop my store: ${url}`);
  return (
    <section className="flex flex-col gap-3.5 rounded-lg bg-forest p-5 text-paper">
      <h2 className="font-display text-lg font-semibold">Share your store</h2>
      <p className="text-[13px]/[19px] leading-[19px] text-fg-on-dark">
        Stores shared in WhatsApp status get 3× more visits in their first week.
      </p>
      <div className="flex items-center gap-2 rounded-md bg-nav-tint px-3 py-[9px]">
        <Link2 className="size-[15px] text-fg-on-dark" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-[13px]/[19px] font-medium">{address}</span>
        <CopyButton value={url} className="text-paper" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`https://wa.me/?text=${text}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md bg-paper px-2.5 py-2 text-[13px]/[19px] font-semibold text-forest"
        >
          <MessageCircle className="size-[15px]" aria-hidden /> WhatsApp
        </a>
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md bg-nav-tint px-2.5 py-2 text-[13px]/[19px] font-semibold text-paper"
        >
          <InstagramGlyph /> Instagram
        </a>
      </div>
    </section>
  );
}

/** 04.01 compact share strip: radius 14, text left, WhatsApp pill right. */
export function ShareStoreStrip({ address, url }: { address: string; url: string }) {
  return (
    <section className="flex items-center gap-3 rounded-[14px] bg-forest px-3.5 py-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-paper">Share your store</span>
        <span className="truncate text-xs text-fg-on-dark">{address}</span>
      </span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`Shop my store: ${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1.5 rounded-md bg-paper px-3 py-2 text-xs font-semibold text-forest"
      >
        <MessageCircle className="size-3.5" aria-hidden /> WhatsApp
      </a>
    </section>
  );
}

/** Instagram glyph (lucide 1.x dropped brand icons); same 2px stroke style as lucide. */
function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[15px]"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}
