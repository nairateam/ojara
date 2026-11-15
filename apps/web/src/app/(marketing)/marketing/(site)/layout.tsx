import type { ReactNode } from 'react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { platformOrigin } from '@/lib/platform-url';

/** Standard marketing pages: content + full forest footer. */
export default async function MarketingSiteLayout({ children }: { children: ReactNode }) {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <>
      <main className="flex-1">{children}</main>
      <MarketingFooter appOrigin={appOrigin} />
    </>
  );
}
