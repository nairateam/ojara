import type { ReactNode } from 'react';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { platformOrigin } from '@/lib/platform-url';

/**
 * Public site shell (ROOT_DOMAIN), matching 01.xx. The header is shared; each nested layout/page
 * renders its own <main> and footer, because Pricing (01.04) swaps the standard footer for a dark
 * CTA band with a one-line footer (01.04).
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-fg">
      <MarketingHeader appOrigin={appOrigin} />
      {children}
    </div>
  );
}
