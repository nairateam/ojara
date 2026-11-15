import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { StoreClosed } from '@/components/storefront/storefront-chrome';
import { getTenant, tenantThemeStyle } from '@/lib/tenant';

type Props = { children: ReactNode; params: Promise<{ host: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenant(decodeURIComponent((await params).host));
  // Storefronts carry the merchant's name only, never "· Ojara".
  return tenant ? { title: { absolute: tenant.name, template: `%s · ${tenant.name}` } } : {};
}

/**
 * Storefront root for {slug}.ROOT_DOMAIN and verified custom domains: tenant resolution, the
 * merchant's brand (--store-*, not Ojara's) and the closed state. Chrome lives in the route
 * groups: (shop) = announcement + header + footer, (checkout) = minimal checkout headers.
 * DISABLED / SUSPENDED stores show 05.11 "Temporarily closed" (preview: /closed-preview);
 * DRAFT stores 404 in the proxy.
 */
export default async function StorefrontLayout({ children, params }: Props) {
  const tenant = await getTenant(decodeURIComponent((await params).host));
  if (!tenant || tenant.status === 'DRAFT') notFound();

  const style = tenantThemeStyle(tenant) as CSSProperties;
  const closed = tenant.status === 'DISABLED' || tenant.status === 'SUSPENDED';
  return (
    <div style={style} className="bg-store-page font-sans text-store-ink">
      {closed ? <StoreClosed storeName={tenant.name} /> : children}
    </div>
  );
}
