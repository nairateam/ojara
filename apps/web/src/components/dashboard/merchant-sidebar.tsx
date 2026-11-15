import { PLANS, type PlanKey, formatKobo } from '@ojara/shared';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { StoreLogoTile } from '@/components/brand/store-logo-tile';
import { SidebarNavItems } from '@/components/app/sidebar-nav';
import { Button } from '@/components/ui/button';
import { MerchantNav } from './merchant-nav';

export interface ShellStore {
  name: string;
  address: string;
  plan: PlanKey;
  productCount: number;
  /** Orders waiting on the merchant: count pill on Orders (sidebar + mobile tab bar). */
  openOrders?: number;
}

/**
 * Store switcher (00.06): paper @ 8% tile, marigold logo tile, name + address, chevrons.
 * `compact` is the 04.01 mobile header version (32 tile, 16/600 name, chevron-down).
 */
export function StoreSwitcher({
  store,
  compact = false,
}: {
  store: ShellStore;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button type="button" className="flex min-w-0 items-center gap-2.5 text-left">
        <StoreLogoTile name={store.name} size={32} />
        <span className="truncate text-base font-semibold text-fg">{store.name}</span>
        <ChevronDown className="size-4 shrink-0 text-fg-muted" aria-hidden />
      </button>
    );
  }
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2.5 rounded-[10px] bg-nav-tint p-2 text-left"
    >
      <StoreLogoTile name={store.name} size={34} />
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-sm font-semibold text-paper">{store.name}</span>
        <span className="truncate text-xs text-nav-muted">{store.address}</span>
      </span>
      <ChevronsUpDown className="size-4 text-nav-muted" aria-hidden />
    </button>
  );
}

/** Plan card (00.06): usage bar + upsell. Free variant upsells Starter. */
function PlanCard({ store }: { store: ShellStore }) {
  const plan = PLANS[store.plan];
  const pct = Math.min(100, Math.round((store.productCount / plan.limits.maxProducts) * 100));
  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-nav-tint p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px]/[19px] font-semibold text-paper">{plan.name} plan</span>
        <span className="text-xs text-nav-fg">
          {store.productCount} / {plan.limits.maxProducts} products
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-nav-tint">
        <div className="h-full rounded-[3px] bg-paper" style={{ width: `${pct}%` }} />
      </div>
      {store.plan === 'FREE' ? (
        <>
          <p className="text-xs leading-[17px] text-nav-fg">
            Starter adds {PLANS.STARTER.limits.maxProducts} products, custom domains and removes
            Ojara branding.
          </p>
          <Button variant="light" size="sm" className="w-full text-[13px]" asChild>
            <Link href="/settings/billing">Upgrade · {formatKobo(PLANS.STARTER.priceKobo)}/mo</Link>
          </Button>
        </>
      ) : (
        <Button
          variant="none"
          size="sm"
          className="w-full bg-white/8 text-[13px] text-paper"
          asChild
        >
          <Link href="/settings/billing">Manage plan</Link>
        </Button>
      )}
    </div>
  );
}

/** Merchant sidebar: 248 wide, forest, padding 18/14, gap 22. */
export function MerchantSidebar({ store }: { store: ShellStore }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col gap-[22px] overflow-y-auto bg-nav px-3.5 py-[18px] lg:flex">
      <StoreSwitcher store={store} />
      <MerchantNav counts={store.openOrders ? { '/orders': store.openOrders } : undefined} />
      <div className="flex-1" />
      <PlanCard store={store} />
      <SidebarNavItems set="merchant-footer" variant="merchant" />
    </aside>
  );
}
