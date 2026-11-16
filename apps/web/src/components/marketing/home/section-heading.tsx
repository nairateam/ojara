import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DisplayHeading, SITE_GUTTER, SiteEyebrow } from '../site-shell';

/**
 * Home (08) section wrapper: 120px top spacing, 64px gutters and a 1440px cap so the paper
 * sections line up with the hero card on wide screens.
 */
export function HomeSection({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn('mx-auto w-full max-w-[1440px] pt-20 md:pt-[120px]', SITE_GUTTER, className)}
    >
      {children}
    </section>
  );
}

/** Home (08) section heading: dot eyebrow, two-line display title and an optional lead. */
export function HomeSectionHeading({
  id,
  eyebrow,
  line1,
  line2,
  lead,
  align = 'left',
  className,
}: {
  id: string;
  eyebrow: string;
  line1: ReactNode;
  line2: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  const center = align === 'center';
  return (
    <div
      className={cn('flex flex-col gap-[18px]', center && 'items-center text-center', className)}
    >
      <SiteEyebrow className="text-[13px] tracking-[1.4px] md:text-sm">{eyebrow}</SiteEyebrow>
      <div id={id}>
        <DisplayHeading line1={line1} line2={line2} className={cn(center && 'items-center')} />
      </div>
      {lead ? <p className="max-w-[560px] text-base text-fg-muted md:text-lg/7">{lead}</p> : null}
    </div>
  );
}
