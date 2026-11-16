import { MessageCircle, Minus, Plus } from 'lucide-react';
import { SUPPORT } from '@/mock/marketing';
import { FAQ_SUPPORT_HOURS, HOME_FAQ } from '@/mock/site-home';
import { siteButton } from '../site-shell';
import { HomeSection, HomeSectionHeading } from './section-heading';

/**
 * 08 Home › FAQ ("Good to know before you open."): heading and WhatsApp CTA on the left, native
 * `<details>` accordion on the right (first two open, as in the design).
 */
export function HomeFaq() {
  return (
    <HomeSection
      id="faq-heading"
      className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20"
    >
      <div className="flex flex-col items-start gap-7 lg:w-[440px] lg:shrink-0">
        <HomeSectionHeading
          id="faq-heading"
          eyebrow="Questions"
          line1="Good to know"
          line2="before you open."
        />
        <p className="max-w-[440px] text-base/[26px] text-fg-muted md:text-[17px]">
          {FAQ_SUPPORT_HOURS}
        </p>
        <a href={SUPPORT.whatsapp} className={siteButton('dark')}>
          <MessageCircle aria-hidden /> Chat with us
        </a>
      </div>

      <div className="flex-1 border-t border-line">
        {HOME_FAQ.map((item) => (
          <details
            key={item.q}
            open={item.open}
            className="group border-b border-line py-5 md:py-7"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest [&::-webkit-details-marker]:hidden">
              <span className="font-display text-[19px] font-medium tracking-[-0.5px] text-forest md:text-2xl">
                {item.q}
              </span>
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-forest group-open:border-forest group-open:bg-forest group-open:text-paper"
              >
                <Plus className="size-4 group-open:hidden" />
                <Minus className="hidden size-4 group-open:block" />
              </span>
            </summary>
            <p className="max-w-[720px] pt-3.5 text-base/[26px] text-fg-muted md:pr-16 md:text-[17px]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </HomeSection>
  );
}
