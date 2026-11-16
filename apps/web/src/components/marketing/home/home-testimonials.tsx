import { Quote, Star } from 'lucide-react';
import { FEATURED_TESTIMONIAL, HOME_RATING, SIDE_TESTIMONIALS } from '@/mock/site-home';
import { HomeSection, HomeSectionHeading } from './section-heading';

/**
 * 08 Home › Testimonials ("Loved from Kano to Calabar."): rating, a large dark featured quote with
 * a headline metric, and two smaller quote cards beside it.
 */
export function HomeTestimonials() {
  const f = FEATURED_TESTIMONIAL;
  return (
    <HomeSection id="testimonials-heading" className="flex flex-col gap-10 md:gap-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <HomeSectionHeading
          id="testimonials-heading"
          eyebrow="From the stalls"
          line1="Loved from Kano"
          line2="to Calabar."
        />
        <div className="flex flex-col gap-2 md:mb-2 md:items-end">
          <span
            role="img"
            aria-label={`${HOME_RATING.stars} out of 5 stars`}
            className="flex gap-1 text-forest"
          >
            {Array.from({ length: HOME_RATING.stars }, (_, i) => (
              <Star key={i} aria-hidden className="size-4" />
            ))}
          </span>
          <p className="text-[15px] text-fg-muted">{HOME_RATING.label}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        <figure className="relative isolate flex flex-1 flex-col justify-between gap-12 overflow-hidden rounded-[28px] bg-forest p-7 text-paper md:rounded-[32px] md:p-12 lg:h-[560px]">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            {[520, 320].map((d) => (
              <span
                key={d}
                style={{ width: d, height: d }}
                className="absolute top-[120px] right-[30px] translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/8"
              />
            ))}
          </div>
          <div className="flex flex-col gap-8 md:gap-14">
            <Quote aria-hidden className="size-8 fill-paper text-paper md:size-9" />
            <blockquote className="max-w-[560px] font-accent text-[30px]/[34px] tracking-[-0.4px] italic md:text-[44px]/[49px]">
              {f.quote}
            </blockquote>
          </div>
          <figcaption className="flex flex-wrap items-end justify-between gap-6">
            <span className="flex items-center gap-3.5">
              <span
                aria-hidden
                className="flex size-12 items-center justify-center rounded-full bg-paper font-display text-[17px] font-semibold text-forest"
              >
                {f.initials}
              </span>
              <span className="flex flex-col gap-[3px]">
                <span className="text-base font-semibold">{f.name}</span>
                <span className="text-sm text-[#B9BEAD]">{f.store}</span>
              </span>
            </span>
            <span className="flex flex-col gap-0.5 sm:items-end">
              <span className="font-display text-[44px] leading-none font-semibold tracking-[-2px] md:text-[56px]">
                {f.metric}
              </span>
              <span className="text-sm text-[#B9BEAD]">{f.metricLabel}</span>
            </span>
          </figcaption>
        </figure>

        <div className="flex flex-col gap-5 lg:w-[480px] lg:shrink-0">
          {SIDE_TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-1 flex-col justify-between gap-8 rounded-[24px] bg-surface-muted p-6 md:rounded-[28px] md:p-8"
            >
              <div className="flex flex-col items-start gap-3.5">
                <span className="rounded-full bg-surface px-3 py-1.5 text-[13px] font-semibold text-fg-muted">
                  {t.tag}
                </span>
                <blockquote className="font-accent text-[24px]/[28px] text-forest italic md:text-[28px]/[32px]">
                  {t.quote}
                </blockquote>
              </div>
              <figcaption className="flex items-center gap-3.5">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full bg-forest font-display text-[17px] font-semibold text-paper"
                >
                  {t.initials}
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-base font-semibold text-forest">{t.name}</span>
                  <span className="text-sm text-fg-muted">{t.store}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
