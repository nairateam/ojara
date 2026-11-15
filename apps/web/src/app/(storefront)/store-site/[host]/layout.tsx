import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { StoreClosed, StorefrontFooter, StorefrontHeader } from '@/components/storefront/storefront-chrome';
import { getTenant, tenantThemeStyle } from '@/lib/tenant';

type Props = { children: ReactNode; params: Promise<{ host: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenant(decodeURIComponent((await params).host));
  // Storefronts carry the merchant's name only, never "· Ojara".
  return tenant ? { title: { absolute: tenant.name, template: `%s · ${tenant.name}` } } : {};
}

/**
 * Storefront shell for {slug}.ROOT_DOMAIN and verified custom domains. Server Component only:
 * no client JS beyond what pages opt into. Uses the merchant's brand (--store-*), not Ojara's.
 * DISABLED / SUSPENDED stores show 05.11 "Temporarily closed"; DRAFT stores 404 in the proxy.
 */
export default async function StorefrontLayout({ children, params }: Props) {
  const tenant = await getTenant(decodeURIComponent((await params).host));
  if (!tenant || tenant.status === 'DRAFT') notFound();

  const style = tenantThemeStyle(tenant) as CSSProperties;
  if (tenant.status === 'DISABLED' || tenant.status === 'SUSPENDED') {
    return (
      <div style={style}>
        <StoreClosed storeName={tenant.name} />
      </div>
    );
  }

  return (
    <div style={style} className="flex min-h-dvh flex-col bg-store-page font-sans text-store-ink">
      <StorefrontHeader storeName={tenant.name} />
      <main className="flex-1">{children}</main>
      {/* TODO(billing): hide "Powered by ojara" when the store's plan has removeBranding. */}
      <StorefrontFooter storeName={tenant.name} showPoweredBy />
    </div>
  );
}
