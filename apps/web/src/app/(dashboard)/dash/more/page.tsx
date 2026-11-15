import { PLANS } from '@ojara/shared';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MERCHANT_NAV, MERCHANT_NAV_FOOTER, type NavItem } from '@/components/app/nav-config';
import { PageContainer } from '@/components/app/page-container';
import { SignOutButton } from '@/components/auth/sign-out';
import { StoreLogoTile } from '@/components/brand/store-logo-tile';
import { ProgressBar } from '@/components/ui/feedback';
import { requireMerchant } from '@/lib/auth/guards';

export const metadata: Metadata = { title: 'More' };

/** Already in the bottom tab bar. */
const IN_TABS = new Set(['/', '/orders', '/products', '/storefront']);

function LinkGroup({ heading, items }: { heading?: string; items: NavItem[] }) {
  return (
    <section className="flex flex-col gap-2">
      {heading ? (
        <h2 className="px-1 text-[11px]/[14px] font-semibold tracking-label text-fg-subtle uppercase">
          {heading}
        </h2>
      ) : null}
      <ul className="overflow-hidden rounded-[14px] border border-line bg-surface">
        {items.map((item) => (
          <li key={item.href} className="border-t border-line first:border-t-0">
            <Link href={item.href} className="flex items-center gap-3 px-4 py-3.5">
              <item.icon className="size-5 text-fg-muted" aria-hidden />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="size-4 text-fg-subtle" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Mobile "More" tab (04.xx): the sidebar destinations that aren't in the tab bar. */
export default async function MorePage() {
  const { summary, storeAddress, storeUrl } = await requireMerchant();
  const plan = PLANS[summary.plan];
  const groups = MERCHANT_NAV.map((g) => ({
    heading: g.heading,
    items: g.items.filter((i) => !IN_TABS.has(i.href)),
  })).filter((g) => g.items.length);

  return (
    <PageContainer className="max-w-[640px] gap-[18px]">
      <section className="flex flex-col gap-3 rounded-[14px] border border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <StoreLogoTile name={summary.store.name} size={44} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[15px]/[21px] font-semibold">{summary.store.name}</span>
            <span className="truncate text-xs text-fg-muted">{storeAddress}</span>
          </span>
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="View store"
            className="inline-flex size-[38px] items-center justify-center rounded-full bg-surface-muted"
          >
            <ExternalLink className="size-[18px]" aria-hidden />
          </a>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="flex justify-between text-xs">
            <span className="font-semibold">{plan.name} plan</span>
            <span className="text-fg-muted">
              {summary.productCount} / {plan.limits.maxProducts} products
            </span>
          </span>
          <ProgressBar value={summary.productCount} max={plan.limits.maxProducts} />
        </div>
      </section>
      {groups.map((g, i) => (
        <LinkGroup key={g.heading ?? i} heading={g.heading} items={g.items} />
      ))}
      <LinkGroup heading="Account" items={MERCHANT_NAV_FOOTER} />
      <SignOutButton className="flex items-center justify-center gap-2 rounded-[14px] border border-line bg-surface px-4 py-3.5 text-sm font-semibold text-danger disabled:opacity-60" />
    </PageContainer>
  );
}
