import { Check, ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Form controls from §7 of the design spec. Native elements (no client JS) styled with Terra
 * tokens: same box as Input (surface, 1px border, radius 8, ~40px, 13px), focus = 1.5px forest +
 * soft glow.
 */
const box =
  'w-full rounded-md border border-line bg-surface text-ui text-fg outline-none transition-[border-color,box-shadow] placeholder:text-fg-subtle focus-visible:border-forest focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger';

/** Textarea: same box with a fixed height. */
export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(box, 'min-h-24 resize-none px-3 py-2.5 leading-[19px]', className)}
      {...props}
    />
  );
}

/** Select: input box + trailing chevron-down 14 (#8D9387). */
export function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <div className={cn('relative', className)}>
      <select data-slot="select" className={cn(box, 'h-10 appearance-none pr-9 pl-3')} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-fg-subtle"
        aria-hidden
      />
    </div>
  );
}

/** Checkbox: 16–18px, radius 4, 1.5px #B4B9A8 border; checked = forest with a light check. */
export function Checkbox({
  className,
  size = 16,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type' | 'size'> & { size?: 16 | 18 }) {
  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <input
        type="checkbox"
        className="peer size-full appearance-none rounded-xs border-[1.5px] border-line-strong bg-surface checked:border-forest checked:bg-forest focus-visible:shadow-focus"
        {...props}
      />
      <Check
        className="pointer-events-none absolute inset-0 m-auto size-3 text-paper opacity-0 peer-checked:opacity-100"
        aria-hidden
      />
    </span>
  );
}

/**
 * Radio card / selectable chip (onboarding, admin decisions, plan tiles): surface, 1px border,
 * radius 8; selected = 1.5px forest border + #E4E7D6 fill. Uses a hidden native radio.
 */
export function RadioCard({
  className,
  children,
  indicator = true,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & { indicator?: boolean }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface p-3 has-checked:border-forest has-checked:bg-selected has-checked:shadow-[inset_0_0_0_0.5px_var(--ojara-forest)] has-focus-visible:shadow-focus',
        className,
      )}
    >
      <input type="radio" className="peer sr-only" {...props} />
      {indicator ? (
        <span
          aria-hidden
          className="mt-0.5 size-4 shrink-0 rounded-full border-[1.5px] border-line-strong bg-surface peer-checked:border-[5px] peer-checked:border-forest"
        />
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</span>
    </label>
  );
}

/** Label + control + optional hint, gap 6 (re-usable outside auth). */
export function Field({
  label,
  htmlFor,
  hint,
  aside,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-ui font-semibold text-fg">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hint ? <p className="text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  );
}
