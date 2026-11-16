import { PackageSearch } from 'lucide-react';
import type { ReactNode } from 'react';
import { StoreLinkButton } from '@/components/storefront/primitives';

/**
 * Order tracking needs real orders, which arrive with online checkout. The designed page (05.08,
 * in ./page.tsx) still shows a sample order, so this layout shows a short notice instead of it.
 */
export default function TrackLayout(_props: { children: ReactNode }) {
  return (
    <section className="flex flex-col items-center gap-4 px-4 py-24 text-center">
      <PackageSearch className="size-8 text-store-muted" aria-hidden />
      <h1 className="font-serif text-3xl font-medium text-store-ink">
        Order tracking is coming soon
      </h1>
      <p className="max-w-[420px] text-sm text-store-body">
        You’ll be able to follow your order here once online checkout opens. For now, message the
        store about an order.
      </p>
      <StoreLinkButton href="/about">Contact the store</StoreLinkButton>
    </section>
  );
}
