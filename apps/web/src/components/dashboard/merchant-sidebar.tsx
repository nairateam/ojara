import { PLANS, type PlanKey, formatKobo } from '@ojara/shared';
import { ChevronsUpDown } from 'lucide-react';
import { StoreLogoTile } from '@/components/brand/store-logo-tile';
import { SidebarNav, SidebarNavItems } from '@/components/app/sidebar-nav';
import { Button } from '@/components/ui/button';

export interface ShellStore {
  name: string;
  address: string;
  plan: PlanKey;
  productCount: number;
}

/** Store switcher (00.06): paper @ 8% tile, marigold logo tile, name + address, chevrons. */
export function StoreSwitcher({ store, compact = false }: { store: ShellStore; compact?: boolean }) {
  return (
    <button
      type="button"
      className={
        compact
          ? 'flex items-center gap-2 text-left'
          : 'flex w-full items-center gap-2.5 rounded-[10px] bg-nav-tint p-2 text-left'
      }
    >
      <StoreLogoTile name={store.name} size={compact ? 32 : 34} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={compact ? 'truncate text-base font-semibold text-fg' : 'truncate text-sm font-semibold text-paper'}>
          {store.name}
        </span>
        {compact ? null : <span className="truncate text-xs text-nav-muted">{store.address}</span>}
      </span>
      <ChevronsUpDown className={compact ? 'size-4 text-fg-muted' : 'size-4 text-nav-muted'} aria-hidden />
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
        <span className="text-ui font-semibold text-paper">{plan.name} plan</span>
        <span className="text-xs text-nav-fg">
          {store.productCount} / {plan.limits.maxProducts} products
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-nav-tint">
        <div className="h-full rounded-[3px] bg-paper" style={{ width: `${pct}%` }} />
      </div>
      {store.plan === 'FREE' ? (
        <>
          <p className="text-xs text-nav-fg">
            Starter adds {PLANS.STARTER.limits.maxProducts} products, custom domains and removes Ojara branding.
          </p>
          <Button variant="light" size="sm" className="w-full">
            Upgrade · {formatKobo(PLANS.STARTER.priceKobo)}/mo
          </Button>
        </>
      ) : (
        <Button variant="none" size="sm" className="w-full bg-white/8 text-paper">
          Manage plan
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
      <SidebarNav variant="merchant" />
      <div className="flex-1" />
      <PlanCard store={store} />
      <SidebarNavItems set="merchant-footer" variant="merchant" />
    </aside>
  );
}
