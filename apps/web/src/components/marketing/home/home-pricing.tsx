import { HomePricingPlans } from './home-pricing-plans';
import { HomeSection, HomeSectionHeading } from './section-heading';

/** 08 Home › Pricing ("Flat monthly plans. No cut of your sales."). */
export function HomePricing({ appOrigin }: { appOrigin: string }) {
  return (
    <HomeSection id="pricing-heading" className="flex flex-col items-center gap-10 md:gap-12">
      <HomeSectionHeading
        id="pricing-heading"
        align="center"
        eyebrow="Pricing"
        line1="Flat monthly plans."
        line2="No cut of your sales."
      />
      <HomePricingPlans appOrigin={appOrigin} />
      <p className="-mt-4 text-center text-sm text-fg-subtle md:-mt-6">
        Paystack’s standard processing fee applies on each payment. Ojara never takes a commission.
      </p>
    </HomeSection>
  );
}
