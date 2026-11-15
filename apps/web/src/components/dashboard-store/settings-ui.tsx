import { Lock } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Two-column settings section (03.15): intro on the left (280 wide, title 15/600, caption 12
 * muted), fields card on the right; sections are separated by a 1px bottom border + 22 padding.
 */
export function SettingsSection({
  title,
  description,
  tone = 'default',
  className,
  cardClassName,
  children,
}: {
  title: string;
  description: React.ReactNode;
  tone?: 'default' | 'danger';
  className?: string;
  cardClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 border-b border-line pb-[22px] last:border-b-0 last:pb-0 lg:flex-row lg:gap-10',
        className,
      )}
    >
      <div className="flex flex-col gap-1 lg:w-[280px] lg:shrink-0 lg:pt-2.5">
        <h2
          className={cn('text-title font-semibold', tone === 'danger' ? 'text-danger' : 'text-fg')}
        >
          {title}
        </h2>
        <p className="text-xs leading-[18px] text-fg-muted">{description}</p>
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-3.5 rounded-lg border bg-surface p-5',
          tone === 'danger' ? 'border-danger/25' : 'border-line',
          cardClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Locked (read-only) field box: paper fill, muted value and a trailing lock icon. */
export function LockedInput({ id, value }: { id?: string; value: string }) {
  return (
    <div
      id={id}
      role="textbox"
      aria-readonly="true"
      aria-disabled="true"
      className="flex h-10 items-center gap-2 rounded-md border border-line bg-paper px-3 text-ui text-fg-muted"
    >
      <span className="min-w-0 flex-1 truncate">{value}</span>
      <Lock className="size-3.5 shrink-0 text-fg-subtle" aria-label="Locked" />
    </div>
  );
}
