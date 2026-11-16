import { HomeCategories } from '@/components/marketing/home/home-categories';
import { HomeCompare } from '@/components/marketing/home/home-compare';
import { HomeFaq } from '@/components/marketing/home/home-faq';
import { HomeFeatures } from '@/components/marketing/home/home-features';
import { HomeHero } from '@/components/marketing/home/home-hero';
import { HomeMarquee } from '@/components/marketing/home/home-marquee';
import { HomePayments } from '@/components/marketing/home/home-payments';
import { HomePricing } from '@/components/marketing/home/home-pricing';
import { HomeProcess } from '@/components/marketing/home/home-process';
import { HomeTestimonials } from '@/components/marketing/home/home-testimonials';
import { platformOrigin } from '@/lib/platform-url';

/** 08 Home (premium public site). The closing CTA and footer come from the (site) layout. */
export default async function MarketingHome() {
  const appOrigin = await platformOrigin('dashboard');

  return (
    <>
      <HomeHero appOrigin={appOrigin} />
      <HomeMarquee appOrigin={appOrigin} />
      <HomeFeatures />
      <HomePayments />
      <HomeCompare />
      <HomeProcess />
      <HomeCategories />
      <HomeTestimonials />
      <HomePricing appOrigin={appOrigin} />
      <HomeFaq />
    </>
  );
}
