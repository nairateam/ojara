import type { ReactNode } from 'react';
import { SiteClosing } from '@/components/marketing/site-shell';

/** Public site pages: content, then the closing CTA + footer card. */
export default function MarketingSiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <SiteClosing />
    </>
  );
}
