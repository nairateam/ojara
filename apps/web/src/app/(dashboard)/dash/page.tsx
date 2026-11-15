import { formatKobo } from '@ojara/shared';
import { Calendar, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { formatCompactKobo } from '@/components/dashboard/format';
import {
  BestSellersCard,
  DailySalesCard,
  NeedsAttentionCard,
  RecentOrdersCard,
  ShareStoreCard,
  ShareStoreStrip,
} from '@/components/dashboard/home-cards';
import { type DashKpi, KpiGridCard, KpiStripCard } from '@/components/dashboard/kpis';
import { Button } from '@/components/ui/button';
import { clientEnv } from '@/env';
import {
  BEST_SELLERS,
  DAILY_SALES,
  HOME_KPIS,
  MOCK_MERCHANT,
  NEEDS_ATTENTION,
  ORDERS,
} from '@/mock/dashboard';

export const metadata: Metadata = { title: 'Home' };

/** 03.01 Dashboard (desktop) and 04.01 Home (mobile). */
export default function DashboardHome() {
  const { firstName } = MOCK_MERCHANT.owner;
  const storeUrl = `http://${MOCK_MERCHANT.slug}.${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}`;
  const k = HOME_KPIS;

  const kpis: DashKpi[] = [
    {
      label: 'Total sales',
      value: formatKobo(k.sales.kobo),
      delta: { value: k.sales.delta, tone: 'up' },
      context: k.sales.context,
    },
    {
      label: 'Orders',
      value: String(k.orders.count),
      delta: { value: k.orders.delta, tone: 'up' },
      context: k.orders.context,
    },
    {
      label: 'Average order',
      value: formatKobo(k.averageOrder.kobo),
      delta: { value: k.averageOrder.delta, tone: 'down' },
      context: k.averageOrder.context,
    },
    {
      label: 'Store visits',
      value: k.visits.count.toLocaleString('en-NG'),
      delta: { value: k.visits.conversion, tone: 'muted' },
      context: 'visit-to-order conversion',
    },
  ];
  const mobileKpis: DashKpi[] = [
    { ...kpis[0]!, label: 'Sales', value: formatCompactKobo(k.sales.kobo) },
    kpis[1]!,
    { ...kpis[2]!, label: 'Avg order' },
    { ...kpis[3]!, label: 'Visits', mobileDelta: `${k.visits.conversion} convert` },
  ];

  return (
    <PageContainer className="gap-[18px] lg:gap-6">
      {/* 04.01 greeting */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-[22px] font-semibold tracking-[-0.4px]">
            Good morning, {firstName}
          </h1>
          <p className="text-[13px]/[19px] text-fg-muted">Last 30 days</p>
        </div>
        <Link
          href="/products/new"
          aria-label="Add product"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-forest text-paper"
        >
          <Plus className="size-5" aria-hidden />
        </Link>
      </div>

      <PageHeader
        className="hidden lg:flex"
        title={`Good morning, ${firstName}`}
        subtitle={`${MOCK_MERCHANT.todayLabel} · Here’s how ${MOCK_MERCHANT.storeName} is doing`}
        actions={
          <>
            <Button variant="secondary">
              <Calendar /> Last 30 days
            </Button>
            <Button asChild>
              <Link href="/products/new">
                <Plus /> Add product
              </Link>
            </Button>
          </>
        }
      />

      <KpiGridCard items={mobileKpis} className="lg:hidden" />
      <KpiStripCard items={kpis} className="hidden lg:grid" />

      <div className="flex flex-col gap-[18px] lg:hidden">
        <NeedsAttentionCard items={NEEDS_ATTENTION} compact />
        <ShareStoreStrip address={MOCK_MERCHANT.address} url={storeUrl} />
      </div>

      <div className="hidden gap-6 lg:grid xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <DailySalesCard days={DAILY_SALES} />
          <RecentOrdersCard orders={ORDERS.slice(0, 6)} />
        </div>
        <div className="grid content-start gap-6 md:grid-cols-2 xl:grid-cols-1">
          <NeedsAttentionCard items={NEEDS_ATTENTION} />
          <BestSellersCard items={BEST_SELLERS} />
          <ShareStoreCard address={MOCK_MERCHANT.address} url={storeUrl} />
        </div>
      </div>
    </PageContainer>
  );
}
