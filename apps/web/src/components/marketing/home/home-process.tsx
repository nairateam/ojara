import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROCESS_STEPS } from '@/mock/site-home';
import { SiteButton } from '../site-shell';
import { HomeSection, HomeSectionHeading } from './section-heading';

/**
 * 08 Home › Process ("Open before lunch. Sell by dinner."): three numbered step cards, the last
 * one dark, with a link to the full How it works page.
 */
export function HomeProcess() {
  return (
    <HomeSection id="process-heading" className="flex flex-col gap-10 md:gap-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <HomeSectionHeading
          id="process-heading"
          eyebrow="How it works"
          line1="Open before lunch."
          line2="Sell by dinner."
        />
        <SiteButton href="/how-it-works" variant="outline" className="w-fit md:mb-2">
          See every step <ArrowRight aria-hidden />
        </SiteButton>
      </div>

      <ol className="grid gap-5 md:grid-cols-3">
        {PROCESS_STEPS.map((step, i) => {
          const dark = i === PROCESS_STEPS.length - 1;
          return (
            <li
              key={step.title}
              className={cn(
                'flex min-h-[300px] flex-col justify-between gap-10 rounded-[24px] p-6 md:rounded-[28px] md:p-8 lg:h-[380px]',
                dark ? 'bg-forest text-paper' : 'bg-surface-muted text-forest',
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  aria-hidden
                  className="font-accent text-[96px] leading-[0.8] italic md:text-[120px]"
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[13px] font-semibold',
                    dark ? 'bg-paper/12 text-paper' : 'bg-surface text-forest',
                  )}
                >
                  {step.tag}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                <h3 className="font-display text-[22px] font-semibold tracking-[-0.8px] md:text-[26px]">
                  {step.title}
                </h3>
                <p className={cn('text-base/6', dark ? 'text-paper/70' : 'text-fg-muted')}>
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </HomeSection>
  );
}
