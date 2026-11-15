import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MobileTabBar } from '@/components/app/mobile-tab-bar';
import { TopBar } from '@/components/app/top-bar';
import { type ShellStore, MerchantSidebar } from '@/components/dashboard/merchant-sidebar';
import { MobileAppHeader } from '@/components/dashboard/mobile-app-header';
import { NotificationsPopover } from '@/components/dashboard/notifications-popover';
import { requireMerchant } from '@/lib/auth/guards';
import { NOTIFICATIONS } from '@/mock/dashboard';

export const metadata: Metadata = { title: { default: 'Dashboard', template: '%s · Ojara' } };

/**
 * Merchant dashboard shell (app.ROOT_DOMAIN). Matches 03.xx desktop (sidebar 248 + top bar) and
 * 04.xx mobile (app header + bottom tab bar).
 *
 * Signed-out visitors go to /login and accounts without a store to /onboarding (requireMerchant).
 * The store, plan usage, open orders and account come from the API; notifications are still
 * sample data until that feature is built.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, summary, roleLabel, storeAddress, storeUrl } = await requireMerchant();
  const store: ShellStore = {
    name: summary.store.name,
    address: storeAddress,
    plan: summary.plan,
    productCount: summary.productCount,
    openOrders: summary.openOrders,
  };

  return (
    <div className="flex min-h-dvh bg-paper">
      <MerchantSidebar store={store} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          className="hidden lg:flex"
          searchPlaceholder="Search orders, products, customers"
          viewStoreHref={storeUrl}
          account={{ name: user.name, role: roleLabel, settingsHref: '/settings' }}
          notifications={<NotificationsPopover items={NOTIFICATIONS} />}
        />
        <MobileAppHeader store={store} notifications={NOTIFICATIONS} />
        <main className="flex flex-1 flex-col pb-28 lg:pb-0">{children}</main>
      </div>
      <MobileTabBar counts={store.openOrders ? { '/orders': store.openOrders } : {}} />
    </div>
  );
}
