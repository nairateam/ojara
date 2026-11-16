import type { Metadata } from 'next';
import {
  CheckoutChapter,
  HowItWorksHeroBody,
  Integrations,
  OrdersChapter,
  PayoutsAndSharing,
  StockChapter,
  StorefrontChapter,
} from '@/components/marketing/how-it-works/hiw-sections';
import { SiteHero } from '@/components/marketing/site-shell';

export const metadata: Metadata = { title: 'How it works' };

/** 10 How it works (premium public site). The closing CTA + footer come from the (site) layout. */
export default function HowItWorksPage() {
  return (
    <>
      <SiteHero>
        <HowItWorksHeroBody />
      </SiteHero>
      <StorefrontChapter />
      <CheckoutChapter />
      <OrdersChapter />
      <StockChapter />
      <PayoutsAndSharing />
      <Integrations />
    </>
  );
}
