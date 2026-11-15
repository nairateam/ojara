import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * App input (§7): surface fill, 1px border, radius 8, ~40px high, 13px text.
 * `size="lg"` is the auth input (~46px, 14px text). Focus: 1.5px forest + soft glow.
 * Errors: set aria-invalid.
 */
const base =
  'w-full min-w-0 rounded-md border border-line bg-surface text-fg outline-none transition-[border-color,box-shadow] placeholder:text-fg-subtle focus-visible:border-forest focus-visible:shadow-[inset_0_0_0_0.5px_var(--ojara-forest),var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:shadow-[inset_0_0_0_0.5px_var(--ojara-danger)]';

const sizes = {
  default: 'h-10 px-3 text-ui',
  lg: 'h-[46px] px-3.5 text-sm',
} as const;

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size' | 'prefix'> {
  size?: keyof typeof sizes;
  /** Muted leading text such as "₦", "+234" or "@". */
  prefix?: React.ReactNode;
  /** Trailing adornment such as an eye icon or "kg". */
  suffix?: React.ReactNode;
}

function Input({ className, size = 'default', prefix, suffix, ...props }: InputProps) {
  const input = (
    <input
      data-slot="input"
      className={cn(
        base,
        sizes[size],
        (prefix || suffix) && 'border-0 bg-transparent px-0 shadow-none focus-visible:shadow-none',
        className,
      )}
      {...props}
    />
  );
  if (!prefix && !suffix) return input;
  return (
    <div
      className={cn(
        base,
        sizes[size],
        'flex items-center gap-2 has-[input:focus-visible]:border-forest has-[input:focus-visible]:shadow-focus has-[input[aria-invalid=true]]:border-danger',
      )}
    >
      {prefix ? <span className="text-fg-subtle select-none">{prefix}</span> : null}
      {input}
      {suffix ? <span className="flex items-center text-fg-subtle">{suffix}</span> : null}
    </div>
  );
}

export { Input };
