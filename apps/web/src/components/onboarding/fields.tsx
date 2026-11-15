import { ChevronDown, Lock } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/** Onboarding field: 13/600 label, gap 8 to the control. */
export function OnbField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-ui font-semibold text-fg">
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Native select in the Input box: `lg` = 46 high / 14px (step forms), `sm` = 40 high / 13px
 * (quick-add product card). Optional leading adornment (bank logo).
 */
export function NativeSelect({
  className,
  leading,
  children,
  size = 'lg',
  ...props
}: Omit<React.ComponentProps<'select'>, 'size'> & {
  leading?: React.ReactNode;
  size?: 'lg' | 'sm';
}) {
  return (
    <div className={cn('relative', className)}>
      {leading ? (
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
          {leading}
        </span>
      ) : null}
      <select
        className={cn(
          'w-full appearance-none rounded-md border border-line bg-surface text-fg outline-none focus-visible:border-forest focus-visible:shadow-focus',
          size === 'lg' ? 'h-[46px] pr-10 text-sm' : 'h-10 pr-9 text-[13px]',
          leading ? 'pl-12' : size === 'lg' ? 'pl-3.5' : 'pl-3',
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden
      />
    </div>
  );
}

/** Read-only value on paper with a lock icon (Country, Currency in 02.04). */
export function LockedValue({ id, value }: { id: string; value: string }) {
  return (
    <div className="relative">
      <input
        id={id}
        readOnly
        value={value}
        aria-readonly
        className="h-[46px] w-full rounded-md border border-line bg-paper pr-10 pl-3.5 text-sm text-fg-muted outline-none"
      />
      <Lock
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-subtle"
        aria-hidden
      />
    </div>
  );
}

/** Selectable chip / card (§6): selected = 1.5px forest border + #E4E7D6 fill. Wraps a radio. */
export const choiceClass =
  'cursor-pointer rounded-md border border-line bg-surface transition-colors hover:bg-selected has-checked:border-forest has-checked:bg-selected has-checked:shadow-[inset_0_0_0_0.5px_var(--ojara-forest)] has-focus-visible:shadow-focus';

/** Section title + toggle row (02.08). */
export function SectionToggle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-semibold text-fg">{title}</h2>
      {children}
    </div>
  );
}
