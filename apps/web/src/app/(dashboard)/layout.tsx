import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MobileTabBar } from '@/components/app/mobile-tab-bar';
import { TopBar } from '@/components/app/top-bar';
import { MerchantSidebar, type ShellStore, StoreSwitcher } from '@/components/dashboard/merchant-sidebar';
import { clientEnv } from '@/env';

export const metadata: Metadata = { title: { default: 'Dashboard', template: '%s · Ojara' } };

/**
 * Merchant dashboard shell (app.ROOT_DOMAIN). Matches 03.xx desktop (sidebar 248 + top bar) and
 * 04.xx mobile (compact header + bottom tab bar).
 *
 * TODO(auth): load the session server-side (forward the cookie to GET /v1/session), redirect to
 * /login when absent, and load the selected store + plan usage from GET /v1/stores. Placeholder
 * data is used until the dashboard feature is built.
 */
const PLACEHOLDER_STORE: ShellStore = {
  name: 'Your store',
  address: `yourstore.${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}`,
  plan: 'FREE',
  productCount: 0,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <MerchantSidebar store={PLACEHOLDER_STORE} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          searchPlaceholder="Search orders, products, customers"
          viewStoreHref={`http://${PLACEHOLDER_STORE.address}`}
          account={{ name: 'Store Owner', role: 'Owner' }}
          leading={<StoreSwitcher store={PLACEHOLDER_STORE} compact />}
        />
        <main className="flex flex-1 flex-col gap-5 px-4 pt-[18px] pb-28 md:px-8 md:pt-7 lg:pb-8">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
