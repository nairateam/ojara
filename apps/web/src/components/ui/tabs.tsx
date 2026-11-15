'use client';

import { Tabs as TabsPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Tabs (§7).
 * - `underline` (default): 1px bottom border, active tab 2px forest underline + 13/600.
 * - `segmented`: #E0E3D1 track, active segment on surface with a 1px shadow.
 */
type Variant = 'underline' | 'segmented';

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  variant = 'underline',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: Variant }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        'group/tabs-list flex items-center',
        variant === 'underline'
          ? 'gap-[22px] border-b border-line'
          : 'w-fit gap-0.5 rounded-md bg-surface-muted p-[3px]',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50',
        // underline
        'group-data-[variant=underline]/tabs-list:-mb-px group-data-[variant=underline]/tabs-list:border-b-2 group-data-[variant=underline]/tabs-list:border-transparent group-data-[variant=underline]/tabs-list:pb-[11px] group-data-[variant=underline]/tabs-list:text-ui group-data-[variant=underline]/tabs-list:font-medium group-data-[variant=underline]/tabs-list:text-fg-muted',
        'group-data-[variant=underline]/tabs-list:data-[state=active]:border-forest group-data-[variant=underline]/tabs-list:data-[state=active]:font-semibold group-data-[variant=underline]/tabs-list:data-[state=active]:text-fg',
        // segmented
        'group-data-[variant=segmented]/tabs-list:rounded-sm group-data-[variant=segmented]/tabs-list:px-3 group-data-[variant=segmented]/tabs-list:py-[5px] group-data-[variant=segmented]/tabs-list:text-xs group-data-[variant=segmented]/tabs-list:font-medium group-data-[variant=segmented]/tabs-list:text-fg-muted',
        'group-data-[variant=segmented]/tabs-list:data-[state=active]:bg-surface group-data-[variant=segmented]/tabs-list:data-[state=active]:text-fg group-data-[variant=segmented]/tabs-list:data-[state=active]:shadow-segment',
        className,
      )}
      {...props}
    />
  );
}

/** Count pill used inside tabs: #E0E3D1, 11/600. */
function TabCount({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'rounded-pill bg-surface-muted px-1.5 text-2xs font-semibold text-fg',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('outline-none', className)}
      {...props}
    />
  );
}

export { TabCount, Tabs, TabsContent, TabsList, TabsTrigger };
