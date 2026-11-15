import { Plus } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Full-height right detail panel (§2: Orders, Customers, Categories): ~404–420 wide, surface,
 * 1px left border. Sections separated by 1px borders, padding 20/24, 11/600 uppercase labels.
 * Hidden below xl; pages show the list only on smaller screens.
 */
export function DetailPanel({ className, children, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        'hidden w-[412px] shrink-0 flex-col self-stretch border-l border-line bg-surface xl:flex',
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

export function PanelSection({
  label,
  action,
  className,
  children,
}: {
  label?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3 border-b border-line px-6 py-5 last:border-b-0',
        className,
      )}
    >
      {label || action ? (
        <div className="flex items-center justify-between gap-2">
          {label ? <SectionLabel>{label}</SectionLabel> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/** Uppercase section label: Inter 11/600, letter-spacing 0.8, #8D9387. */
export function SectionLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn('text-2xs font-semibold tracking-label text-fg-subtle uppercase', className)}
      {...props}
    />
  );
}

/** Key/value row used in panels and summaries. */
export function DetailRow({
  label,
  value,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 text-ui', className)}>
      <span className="text-fg-muted">{label}</span>
      <span className="text-right font-medium text-fg">{value}</span>
    </div>
  );
}

/**
 * FAQ / accordion row (marketing, help, storefront product): 1px dividers and a plus icon.
 * Native <details>, so it works without client JS.
 */
export function AccordionItem({
  question,
  children,
  className,
  defaultOpen,
}: {
  question: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className={cn('group border-b border-line py-4', className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {question}
        <Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" aria-hidden />
      </summary>
      <div className="pt-3 text-sm leading-[21px] text-fg-muted">{children}</div>
    </details>
  );
}
