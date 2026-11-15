import type { ReactNode } from 'react';
import { SectionLabel } from '@/components/ui/panels';
import { cn } from '@/lib/utils';

/**
 * Detail-panel section (§2: padding 20/24, 1px bottom border, 11/600 uppercase label). Same as
 * PanelSection from ui/panels, but with an explicit label size: the shared `cn` drops the
 * `text-2xs` token next to a text colour.
 */
export function PanelBlock({
  label,
  action,
  className,
  children,
}: {
  label?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
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
          {label ? <SectionLabel className="text-[11px]/[14px]">{label}</SectionLabel> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
