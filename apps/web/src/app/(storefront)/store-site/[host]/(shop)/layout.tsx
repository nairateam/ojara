import type { ReactNode } from 'react';
import { WhatsAppFab } from '@/components/storefront/primitives';
import { getShop, type HostParams, whatsappLink } from '@/components/storefront/store';
import { StorefrontFooter, StorefrontHeader } from '@/components/storefront/storefront-chrome';

/**
 * Shop chrome: header, footer and (mobile) the WhatsApp button, from the store's own details and
 * menu categories. Pages with their own mobile header (product, cart) render
 * <MobileSubHeader data-mobile-header>; its presence hides the header and the floating button
 * below md via `group-has-*`. The announcement bar returns once merchants can write one.
 */
export default async function ShopLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: HostParams;
}) {
  const { store } = await getShop(params);
  const whatsapp = whatsappLink(store.whatsappNumber);
  return (
    <div className="group/shop flex min-h-dvh flex-col max-md:has-[[data-mobile-header]]:pb-[90px]">
      <div className="max-md:group-has-[[data-mobile-header]]/shop:hidden">
        <StorefrontHeader store={store} whatsappHref={whatsapp?.href ?? null} />
      </div>
      <main className="flex-1">{children}</main>
      <StorefrontFooter store={store} whatsapp={whatsapp} />
      <div className="group-has-[[data-mobile-header]]/shop:hidden">
        <WhatsAppFab href={whatsapp?.href ?? null} />
      </div>
    </div>
  );
}
