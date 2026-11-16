import type { Metadata } from 'next';
import { BillingProvider } from '@/components/marketing/pricing/billing';
import {
  BillingFaq,
  CompareTable,
  PlanCards,
  PricingHeroBody,
  SavingsSection,
} from '@/components/marketing/pricing/pricing-sections';
import { SiteHero } from '@/components/marketing/site-shell';
import { platformOrigin } from '@/lib/platform-url';

export const metadata: Metadata = { title: 'Pricing' };

/** 09 Pricing (premium public site). The closing CTA + footer come from the (site) layout. */
export default async function PricingPage() {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <BillingProvider>
      <SiteHero>
        <PricingHeroBody />
      </SiteHero>
      <PlanCards appOrigin={appOrigin} />
      <CompareTable />
      <SavingsSection />
      <BillingFaq />
    </BillingProvider>
  );
}
