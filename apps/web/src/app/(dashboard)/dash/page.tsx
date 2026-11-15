import { Calendar, Plus, Share2, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/app/empty-state';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, KpiStrip } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Home' };

/** 03.01 Dashboard — SHELL ONLY. Live KPIs, chart and lists arrive with the dashboard feature. */
export default function DashboardHome() {
  return (
    <>
      <PageHeader
        title="Good morning"
        subtitle="Here's what's happening in your store."
        actions={
          <>
            <Button variant="secondary" className="hidden sm:inline-flex">
              <Calendar /> Last 30 days
            </Button>
            <Button>
              <Plus /> Add product
            </Button>
          </>
        }
      />
      <KpiStrip
        items={[
          { label: 'Sales', value: '₦0', context: 'last 30 days' },
          { label: 'Orders', value: '0', context: 'last 30 days' },
          { label: 'Visitors', value: '—', context: 'coming soon' },
          { label: 'Conversion', value: '—', context: 'coming soon' },
        ]}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          body="When customers buy from your store, their orders show up here. Share your store link to get your first sale."
          action={
            <Button>
              <Share2 /> Share store link
            </Button>
          }
        />
        <Card tone="dark" className="justify-between">
          <CardHeader className="flex-col gap-2">
            <CardTitle className="font-display text-xl font-semibold tracking-display">
              Share your store
            </CardTitle>
            <CardDescription className="text-sm text-fg-on-dark">
              Post your link on WhatsApp status and Instagram bio so customers can order any time.
            </CardDescription>
          </CardHeader>
          <Button variant="light" className="w-fit">
            <Share2 /> Copy link
          </Button>
        </Card>
      </div>
    </>
  );
}
