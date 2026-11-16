import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Building blocks of the premium public site (08–14): paper page with rounded forest "cards"
 * (hero at the top, closing CTA + footer at the bottom), Bricolage headings whose second line is
 * Instrument Serif italic, and pill buttons.
 */

/** Horizontal padding inside cards and between sections (64px desktop). */
export const SITE_GUTTER = 'px-5 md:px-10 xl:px-16';

/* ------------------------------------------------------------------ type */

/**
 * Two-line display heading: Bricolage 600 line, then an Instrument Serif italic line.
 * Sizes follow the designs: `xl` hero (92/104), `lg` closing (84/96), `md` section (60/68),
 * `sm` card (40/46).
 */
const HEADING = {
  xl: {
    a: 'text-[44px]/[1] tracking-[-0.045em] md:text-[72px] xl:text-[92px]/[90px]',
    b: 'text-[50px]/[1] tracking-[-0.02em] md:text-[82px] xl:text-[104px]/[99px]',
  },
  lg: {
    a: 'text-[40px]/[1] tracking-[-0.04em] md:text-[64px] xl:text-[84px]/[84px]',
    b: 'text-[46px]/[1] tracking-[-0.016em] md:text-[74px] xl:text-[96px]/[96px]',
  },
  md: {
    a: 'text-[34px]/[1.05] tracking-[-0.043em] md:text-[48px] xl:text-[60px]/[60px]',
    b: 'text-[38px]/[1.05] tracking-[-0.015em] md:text-[54px] xl:text-[68px]/[68px]',
  },
  sm: {
    a: 'text-[28px]/[1.1] tracking-[-0.035em] md:text-[40px]/[44px]',
    b: 'text-[32px]/[1.1] tracking-[-0.01em] md:text-[46px]/[48px]',
  },
} as const;

export function DisplayHeading({
  line1,
  line2,
  size = 'md',
  tone = 'dark',
  as: Tag = 'h2',
  id,
  className,
  accentClassName,
}: {
  line1: ReactNode;
  line2?: ReactNode;
  size?: keyof typeof HEADING;
  /** `dark` = forest on paper; `light` = paper on forest (italic line muted). */
  tone?: 'dark' | 'light';
  as?: 'h1' | 'h2' | 'h3';
  /** For `aria-labelledby` on the section. */
  id?: string;
  className?: string;
  /** Override the italic line's colour (e.g. paper instead of muted). */
  accentClassName?: string;
}) {
  const s = HEADING[size];
  return (
    <Tag id={id} className={cn('flex flex-col', className)}>
      <span
        className={cn(
          'font-display font-semibold',
          s.a,
          tone === 'light' ? 'text-paper' : 'text-forest',
        )}
      >
        {line1}
      </span>
      {line2 ? (
        <span
          className={cn(
            'font-accent font-normal italic',
            s.b,
            tone === 'light' ? 'text-[#B9BEAD]' : 'text-fg-muted',
            accentClassName,
          )}
        >
          {line2}
        </span>
      ) : null}
    </Tag>
  );
}

/** Section eyebrow: 6px dot + Inter 14/600 uppercase, tracking 1.4. */
export function SiteEyebrow({
  children,
  tone = 'dark',
  className,
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <p
      className={cn(
        'flex items-center gap-2.5 text-sm font-semibold tracking-[1.4px] uppercase',
        tone === 'light' ? 'text-[#C9CCBC]' : 'text-fg-muted',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 rounded-full', tone === 'light' ? 'bg-paper' : 'bg-forest')}
      />
      {children}
    </p>
  );
}

/** Small rounded label pill ("Free forever on the Free plan", "2 months free"). */
export function SitePill({
  children,
  tone = 'dark',
  className,
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm',
        tone === 'light'
          ? 'border border-paper/14 text-[#C9CCBC]'
          : 'border border-line bg-surface text-fg-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- buttons */

const BUTTON = {
  /** Paper pill on forest. */
  light: 'bg-paper text-forest hover:opacity-90',
  /** Translucent pill on forest. */
  ghost: 'bg-paper/12 text-paper hover:bg-paper/18',
  /** Outlined pill on forest. */
  outlineLight: 'border border-paper/25 text-paper hover:bg-paper/8',
  /** Forest pill on paper. */
  dark: 'bg-forest text-paper hover:opacity-90',
  /** Outlined pill on paper. */
  outline: 'border border-forest/25 text-forest hover:bg-forest/5',
} as const;

export type SiteButtonVariant = keyof typeof BUTTON;

export function siteButton(variant: SiteButtonVariant = 'dark', size: 'md' | 'lg' = 'md') {
  return cn(
    'site-btn inline-flex items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current [&_svg]:size-4',
    size === 'lg' ? 'px-6 py-4 text-base md:px-7' : 'px-5 py-3 text-[15px]',
    BUTTON[variant],
  );
}

/** Internal link or external URL styled as a pill button. */
export function SiteButton({
  href,
  variant = 'dark',
  size = 'md',
  className,
  children,
  ...rest
}: Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  variant?: SiteButtonVariant;
  size?: 'md' | 'lg';
}) {
  const cls = cn(siteButton(variant, size), className);
  return href.startsWith('/') ? (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  ) : (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  );
}

/** Decorative concentric rings behind closing/hero copy. */
export function SiteRings({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10', className)}>
      {[1400, 1060, 720].map((d) => (
        <span
          key={d}
          style={{ width: d, height: d }}
          className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/6"
        />
      ))}
    </div>
  );
}

/** Arrow-in-circle used on list rows and cards. */
export function ArrowBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'arrow-badge inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-forest',
        className,
      )}
    >
      <ArrowUpRight className="size-4" />
    </span>
  );
}
