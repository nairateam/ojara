import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LinkTab {
  key: string;
  label: string;
  count?: number;
  href: string;
}

/**
 * Underline tabs as links (§7): gap 22, 1px bottom border, active 2px forest underline + 13/600,
 * count pill #E0E3D1 11/600. Links keep tab state in the URL (?status=), so no client JS.
 */
export function LinkTabs({
  tabs,
  active,
  className,
  label = 'Filter',
}: {
  tabs: LinkTab[];
  active: string;
  className?: string;
  label?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'flex items-end gap-[22px] overflow-x-auto border-b border-line [scrollbar-width:none]',
        className,
      )}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            scroll={false}
            aria-current={on ? 'page' : undefined}
            className={cn(
              '-mb-px flex shrink-0 items-center gap-1.5 border-b-2 pb-[11px] text-[13px]/[19px] whitespace-nowrap',
              on
                ? 'border-forest font-semibold text-fg'
                : 'border-transparent font-medium text-fg-muted hover:text-fg',
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <span
                className={cn(
                  'rounded-pill bg-surface-muted px-1.5 py-px text-[11px]/[14px] font-semibold',
                  on ? 'text-fg' : 'text-fg-muted',
                )}
              >
                {t.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/** Segmented control as links (03.06 inventory filter): #E0E3D1 track, active on surface. */
export function LinkSegments({
  tabs,
  active,
  className,
}: {
  tabs: LinkTab[];
  active: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Filter"
      className={cn('flex w-fit gap-0.5 rounded-md bg-surface-muted p-[3px]', className)}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            scroll={false}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-[5px] text-xs font-medium',
              on ? 'bg-surface text-fg shadow-segment' : 'text-fg-muted hover:text-fg',
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <span className="text-[11px]/[14px] text-fg-subtle">{t.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * 04.02 status chips: surface strip with a 1px bottom border, horizontally scrolling pills
 * (padding 7/12). Active chip forest with paper label; inactive outlined.
 */
export function StatusChips({
  tabs,
  active,
  className,
}: {
  tabs: LinkTab[];
  active: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Order status"
      className={cn(
        'flex gap-2 overflow-x-auto border-b border-line bg-surface px-4 pt-1 pb-2.5 [scrollbar-width:none]',
        className,
      )}
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            scroll={false}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-[7px] text-[13px]/[19px] font-semibold whitespace-nowrap',
              on ? 'bg-forest text-surface' : 'border border-line bg-surface text-fg',
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <span className={cn('text-xs font-normal', on ? 'text-paper/65' : 'text-fg-subtle')}>
                {t.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
