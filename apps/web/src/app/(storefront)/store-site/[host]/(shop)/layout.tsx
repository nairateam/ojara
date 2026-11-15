import type { ReactNode } from 'react';
import { WhatsAppFab } from '@/components/storefront/primitives';
import {
  AnnouncementBar,
  StorefrontFooter,
  StorefrontHeader,
} from '@/components/storefront/storefront-chrome';
import { getStore, type HostParams } from '@/components/storefront/store';

/**
 * Shop chrome: announcement bar, header, footer and (mobile) the WhatsApp button. Pages with their
 * own mobile header (product, cart) render <MobileSubHeader data-mobile-header>; its presence hides
 * the announcement + header and the floating button below md via `group-has-*`.
 */
export default async function ShopLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: HostParams;
}) {
  const store = await getStore(params);
  return (
    <div className="group/shop flex min-h-dvh flex-col max-md:has-[[data-mobile-header]]:pb-[90px]">
      <div className="max-md:group-has-[[data-mobile-header]]/shop:hidden">
        <AnnouncementBar />
        <StorefrontHeader storeName={store.name} />
      </div>
      <main className="flex-1">{children}</main>
      {/* TODO(billing): hide "Powered by ojara" when the store's plan has removeBranding. */}
      <StorefrontFooter storeName={store.name} showPoweredBy />
      <div className="group-has-[[data-mobile-header]]/shop:hidden">
        <WhatsAppFab />
      </div>
    </div>
  );
}
