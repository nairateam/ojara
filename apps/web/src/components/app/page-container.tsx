import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Standard app page body (§2): padding 28 top / 32 sides / 32 bottom (mobile 18/16), section gap
 * 20. The dashboard and admin layouts render `<main>` without padding so pages with a full-height
 * side panel can use <SplitPage> instead.
 */
export function PageContainer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-1 flex-col gap-5 px-4 pt-[18px] pb-8 md:px-8 md:pt-7', className)}
      {...props}
    />
  );
}

/**
 * List + full-height right panel (Orders, Customers, Categories) or left settings panel + preview
 * (Storefront Editor). Children are the list/content area; `panel` renders at the side.
 */
export function SplitPage({
  panel,
  panelSide = 'right',
  className,
  children,
}: {
  panel: React.ReactNode;
  panelSide?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex min-h-0 flex-1', className)}>
      {panelSide === 'left' ? panel : null}
      <div className="flex min-w-0 flex-1 flex-col gap-5 px-4 pt-[18px] pb-8 md:pt-7 md:pr-7 md:pl-8">
        {children}
      </div>
      {panelSide === 'right' ? panel : null}
    </div>
  );
}
