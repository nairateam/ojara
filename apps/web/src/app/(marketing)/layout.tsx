import type { ReactNode } from 'react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { platformOrigin } from '@/lib/platform-url';

/** Public site shell (ROOT_DOMAIN), matching 01.xx. */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <MarketingHeader appOrigin={appOrigin} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
