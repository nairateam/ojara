import {
  HomeHero,
  HomeSteps,
  MerchantStory,
  PricingTeaser,
  ProductShowcase,
  SellersStrip,
  WhySellersSwitch,
} from '@/components/marketing/home-sections';
import { PhoneCtaBand } from '@/components/marketing/primitives';
import { platformOrigin } from '@/lib/platform-url';

/** 01.01 Home (desktop) and 01.07 Home – Mobile. */
export default async function MarketingHome() {
  const [appOrigin, siteOrigin] = await Promise.all([
    platformOrigin('dashboard'),
    platformOrigin('marketing'),
  ]);
  // The seeded demo storefront lives on a subdomain of the root domain.
  const demoStoreUrl = siteOrigin.replace('://', '://demo.');

  return (
    <>
      <HomeHero appOrigin={appOrigin} demoStoreUrl={demoStoreUrl} />
      <SellersStrip />
      <WhySellersSwitch />
      <ProductShowcase />
      <HomeSteps />
      <MerchantStory />
      <PricingTeaser />
      <PhoneCtaBand
        appOrigin={appOrigin}
        title="Your market is online. Take your stall there."
        mobileTitle="Take your stall online."
      />
    </>
  );
}
