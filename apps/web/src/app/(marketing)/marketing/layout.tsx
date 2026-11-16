import type { ReactNode } from 'react';
import { SiteMotion } from '@/components/marketing/site-motion';

/**
 * Public site shell (ROOT_DOMAIN), premium design 08–14: paper page. The nav lives inside each
 * page's hero card (`SiteHero`); the closing CTA + footer card comes from the (site) layout.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-root flex min-h-dvh flex-col bg-paper text-fg">
      <SiteMotion />
      {children}
    </div>
  );
}
