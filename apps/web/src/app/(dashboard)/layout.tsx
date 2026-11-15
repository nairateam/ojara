import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MobileTabBar } from '@/components/app/mobile-tab-bar';
import { TopBar } from '@/components/app/top-bar';
import { type ShellStore, MerchantSidebar } from '@/components/dashboard/merchant-sidebar';
import { MobileAppHeader } from '@/components/dashboard/mobile-app-header';
import { NotificationsPopover } from '@/components/dashboard/notifications-popover';
import { clientEnv } from '@/env';
import { MOCK_MERCHANT, NOTIFICATIONS } from '@/mock/dashboard';

export const metadata: Metadata = { title: { default: 'Dashboard', template: '%s · Ojara' } };

/**
 * Merchant dashboard shell (app.ROOT_DOMAIN). Matches 03.xx desktop (sidebar 248 + top bar) and
 * 04.xx mobile (app header + bottom tab bar).
 *
 * TODO(auth): load the session server-side (forward the cookie to GET /v1/session), redirect to
 * /login when absent, and load the selected store + plan usage from GET /v1/stores. The sample
 * merchant from the designs (src/mock/dashboard.ts) is used until the dashboard feature is built.
 */
const STORE: ShellStore = {
  name: MOCK_MERCHANT.storeName,
  address: MOCK_MERCHANT.address,
  plan: MOCK_MERCHANT.plan,
  productCount: MOCK_MERCHANT.productCount,
  openOrders: MOCK_MERCHANT.openOrders,
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <MerchantSidebar store={STORE} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          className="hidden lg:flex"
          searchPlaceholder="Search orders, products, customers"
          viewStoreHref={`http://${MOCK_MERCHANT.slug}.${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}`}
          account={{ name: MOCK_MERCHANT.owner.name, role: MOCK_MERCHANT.owner.role }}
          notifications={<NotificationsPopover items={NOTIFICATIONS} />}
        />
        <MobileAppHeader store={STORE} notifications={NOTIFICATIONS} />
        <main className="flex flex-1 flex-col pb-28 lg:pb-0">{children}</main>
      </div>
      <MobileTabBar counts={{ '/orders': MOCK_MERCHANT.openOrders }} />
    </div>
  );
}
