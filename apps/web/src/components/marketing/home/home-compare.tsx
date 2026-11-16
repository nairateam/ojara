import { Hourglass, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { FLOW_TOTALS, OJARA_WAY, OLD_WAY } from '@/mock/site-home';
import { HomeSection, HomeSectionHeading } from './section-heading';

/** One side of the comparison: header, timeline (children) and "time to a paid order" total. */
function FlowCard({
  dark,
  kicker,
  title,
  count,
  total,
  note,
  noteIcon,
  children,
}: {
  dark?: boolean;
  kicker: string;
  title: string;
  count: string;
  total: string;
  note: string;
  noteIcon: ReactNode;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        'flex flex-1 flex-col justify-between gap-10 rounded-[24px] px-6 py-8 md:rounded-[28px] md:px-11 md:py-10',
        dark ? 'bg-forest text-paper' : 'border border-line bg-surface text-forest',
      )}
    >
      <div className="flex flex-col gap-9">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <p
              className={cn(
                'text-xs font-semibold tracking-[1.6px] uppercase',
                dark ? 'text-[#B9BEAD]' : 'text-fg-subtle',
              )}
            >
              {kicker}
            </p>
            <h3
              className={cn(
                'font-accent text-[34px] tracking-[-0.8px] md:text-[40px]',
                dark && 'italic',
              )}
            >
              {title}
            </h3>
          </div>
          <span
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap',
              dark ? 'border-paper/20 text-paper/70' : 'border-line text-fg-muted',
            )}
          >
            {count}
          </span>
        </div>
        {children}
      </div>

      <div
        className={cn(
          'flex flex-wrap items-end justify-between gap-4 border-t pt-6',
          dark ? 'border-paper/15' : 'border-line',
        )}
      >
        <div className="flex flex-col gap-1.5">
          <p
            className={cn(
              'text-[11px] font-semibold tracking-[1.6px] uppercase',
              dark ? 'text-[#B9BEAD]' : 'text-fg-subtle',
            )}
          >
            Time to a paid order
          </p>
          <p
            className={cn(
              'font-display text-[44px] leading-none font-semibold tracking-[-2.2px] md:text-[52px]',
              dark ? 'text-paper' : 'text-fg-subtle',
            )}
          >
            {total}
          </p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-[7px] text-[13px] font-medium text-forest [&_svg]:size-3.5',
            dark ? 'bg-paper' : 'border border-line',
          )}
        >
          {noteIcon}
          {note}
        </span>
      </div>
    </article>
  );
}

/**
 * 08 Home › Flow Comparison ("Selling in DMs takes six steps. Ojara takes three."): the old DM
 * timeline next to the Ojara one, with a "vs" badge between them.
 */
export function HomeCompare() {
  return (
    <HomeSection id="compare-heading" className="flex flex-col gap-10 md:gap-12">
      <HomeSectionHeading
        id="compare-heading"
        eyebrow="The difference"
        line1="Selling in DMs takes six steps."
        line2="Ojara takes three."
      />

      <div className="relative flex flex-col gap-5 lg:min-h-[660px] lg:flex-row">
        <FlowCard
          kicker="In your DMs"
          title="The old way"
          count={`${OLD_WAY.length} steps`}
          total={FLOW_TOTALS.old.value}
          note={FLOW_TOTALS.old.note}
          noteIcon={<Hourglass aria-hidden />}
        >
          <ol className="relative flex flex-col gap-4 py-1 pl-7">
            <span aria-hidden className="absolute top-3 bottom-3 left-1 w-px bg-line" />
            {OLD_WAY.map(({ time, text, icon: Icon }) => (
              <li key={time} className="relative flex items-center gap-3 sm:gap-4">
                <span
                  aria-hidden
                  className="absolute top-1/2 -left-7 size-[9px] -translate-y-1/2 rounded-full border border-line-strong bg-surface"
                />
                <span className="w-16 shrink-0 text-[13px] tracking-[0.2px] text-fg-subtle">
                  {time}
                </span>
                <span className="flex-1 text-[15px]">{text}</span>
                <Icon aria-hidden className="size-4 shrink-0 text-fg-subtle" />
              </li>
            ))}
          </ol>
        </FlowCard>

        <span
          aria-hidden
          className="z-10 -my-9 flex size-[60px] items-center justify-center self-center rounded-full border border-line bg-paper font-accent text-[26px] text-forest italic lg:absolute lg:top-1/2 lg:left-1/2 lg:my-0 lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          vs
        </span>

        <FlowCard
          dark
          kicker="With Ojara"
          title="The Ojara way"
          count={`${OJARA_WAY.length} steps`}
          total={FLOW_TOTALS.ojara.value}
          note={FLOW_TOTALS.ojara.note}
          noteIcon={<Zap aria-hidden />}
        >
          <ol className="relative flex flex-col gap-[30px] py-1 pl-7">
            <span aria-hidden className="absolute top-3 bottom-3 left-1 w-px bg-paper/20" />
            {OJARA_WAY.map(({ time, title, body, icon: Icon }) => (
              <li key={time} className="relative flex items-start gap-3 sm:gap-4">
                <span
                  aria-hidden
                  className="absolute top-[7px] -left-7 size-[9px] rounded-full bg-paper"
                />
                <span className="w-16 shrink-0 pt-0.5 text-[13px] tracking-[0.2px] text-[#B9BEAD]">
                  {time}
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  <span className="font-display text-[19px] font-medium tracking-[-0.4px] md:text-[22px]">
                    {title}
                  </span>
                  <span className="text-sm/5 text-paper/70">{body}</span>
                </span>
                <Icon aria-hidden className="size-4 shrink-0 text-paper/60" />
              </li>
            ))}
          </ol>
        </FlowCard>
      </div>
    </HomeSection>
  );
}
