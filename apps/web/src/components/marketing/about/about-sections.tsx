import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ABOUT_HERO,
  ABOUT_PRINCIPLES,
  ABOUT_STATS,
  ABOUT_STORY,
  ABOUT_TEAM,
  ABOUT_TEAM_INTRO,
} from '@/mock/site-about';
import { DisplayHeading, SITE_GUTTER, SiteEyebrow, SiteHero } from '../site-shell';

/**
 * 11 About · Hero: tall forest card with the bottom scrim and the title pinned to the bottom-left.
 * The design's photo slot is empty, so its "Balogun Market" caption is left out too.
 */
export function AboutHero() {
  return (
    <SiteHero
      className="min-h-[520px] md:min-h-[min(640px,calc(100svh-14px))] xl:min-h-[min(780px,calc(100svh-14px))]"
      style={{
        backgroundColor: '#4A5245',
        backgroundImage:
          'linear-gradient(180deg, rgba(38,43,35,0) 25%, rgba(38,43,35,0.94) 100%), linear-gradient(rgba(38,43,35,0.4), rgba(38,43,35,0.4))',
      }}
    >
      <div className="mt-auto flex flex-col gap-5 px-5 pt-24 pb-10 md:gap-[26px] md:px-10 md:pb-14 xl:pl-16">
        <SiteEyebrow tone="light">{ABOUT_HERO.eyebrow}</SiteEyebrow>
        <DisplayHeading
          as="h1"
          size="xl"
          tone="light"
          line1={ABOUT_HERO.line1}
          line2={ABOUT_HERO.line2}
          accentClassName="text-paper"
        />
      </div>
    </SiteHero>
  );
}

/** 11 About · Our story: eyebrow + "Since 2024" left, statement and two columns right. */
export function AboutStory() {
  return (
    <section
      aria-label="Our story"
      className={cn('flex flex-col gap-8 pt-20 md:pt-[130px] lg:flex-row lg:gap-20', SITE_GUTTER)}
    >
      <div className="flex flex-col gap-3.5 lg:w-[300px] lg:shrink-0 lg:pt-3.5">
        <SiteEyebrow>Our story</SiteEyebrow>
        <p className="font-accent text-[22px] text-fg-subtle italic md:text-[26px]">
          {ABOUT_STORY.since}
        </p>
      </div>
      <div className="flex flex-col gap-8 md:gap-11">
        <p className="font-display text-[26px]/[34px] font-medium tracking-[-0.03em] text-forest md:text-[36px]/[44px] xl:text-[44px]/[52px]">
          {ABOUT_STORY.statement}
        </p>
        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          {ABOUT_STORY.paragraphs.map((p) => (
            <p key={p} className="text-base/[26px] text-fg-muted md:text-[17px]/[27px]">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 11 About · Stats row: four figures, each value with its label beside it. */
export function AboutStats() {
  return (
    <section aria-label="Ojara in numbers" className="pt-16 md:pt-[100px]">
      <ul
        className={cn(
          'grid grid-cols-2 gap-x-6 gap-y-8 py-7 lg:flex lg:justify-between xl:px-[78px]',
          SITE_GUTTER,
        )}
      >
        {ABOUT_STATS.map((s) => (
          <li key={s.label} className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3.5">
            <strong className="font-display text-[32px] font-semibold tracking-[-0.04em] text-forest md:text-[40px]">
              {s.value}
            </strong>
            <span className="text-sm/5 text-fg-muted md:w-[130px] md:text-[15px]/5">{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 11 About · What we believe: four numbered promises as ruled rows. */
export function AboutPrinciples() {
  return (
    <section
      aria-label="What we believe"
      className={cn('flex flex-col gap-10 pt-20 md:gap-14 md:pt-[130px]', SITE_GUTTER)}
    >
      <div className="flex flex-col gap-[18px]">
        <SiteEyebrow>What we believe</SiteEyebrow>
        <DisplayHeading line1="Four promises" line2="we build around." />
      </div>
      <ol className="border-b border-line">
        {ABOUT_PRINCIPLES.map((p, i) => (
          <li
            key={p.title}
            className="grid gap-3 border-t border-line py-7 md:grid-cols-[120px_minmax(0,1fr)] md:gap-x-10 md:py-9 lg:grid-cols-[120px_minmax(0,520px)_minmax(0,1fr)] lg:items-center"
          >
            <span className="font-accent text-[40px]/none text-fg-subtle italic md:text-[56px]/[56px]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-[26px]/[32px] font-semibold tracking-[-0.035em] text-forest md:text-[36px]/[40px]">
              {p.title}
            </h3>
            <p className="text-base/[26px] text-fg-muted md:col-start-2 md:text-[17px]/[26px] lg:col-start-auto">
              {p.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 11 About · The team: heading row, then four person cards (the first one dark). */
export function AboutTeam() {
  return (
    <section
      aria-label="The team"
      className={cn('flex flex-col gap-10 pt-20 md:gap-12 md:pt-[130px]', SITE_GUTTER)}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-[18px]">
          <SiteEyebrow>The team</SiteEyebrow>
          <DisplayHeading line1={ABOUT_TEAM_INTRO.line1} line2={ABOUT_TEAM_INTRO.line2} />
        </div>
        <p className="max-w-[340px] text-base/6 text-fg-muted">{ABOUT_TEAM_INTRO.body}</p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ABOUT_TEAM.map((person, i) => {
          const dark = i === 0;
          return (
            <li
              key={person.name}
              className={cn(
                'flex h-[280px] flex-col justify-between rounded-[28px] p-7 md:h-[340px]',
                dark ? 'bg-forest' : 'bg-surface-muted',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'flex size-[84px] items-center justify-center rounded-full font-accent text-[34px] italic',
                    dark ? 'bg-paper text-forest' : 'bg-forest text-paper',
                  )}
                >
                  {person.initials}
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium',
                    dark ? 'bg-paper/12 text-paper' : 'bg-paper text-forest',
                  )}
                >
                  <MapPin aria-hidden className="size-3.5" />
                  {person.location}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h3
                  className={cn(
                    'font-display text-2xl font-semibold tracking-[-0.025em]',
                    dark ? 'text-paper' : 'text-forest',
                  )}
                >
                  {person.name}
                </h3>
                <p className={cn('text-[15px]', dark ? 'text-[#B9BEAD]' : 'text-fg-muted')}>
                  {person.role}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
