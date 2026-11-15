import type * as React from 'react';
import { cn } from '@/lib/utils';

/** Loading bar (00.07): #E0E3D1, radius 4. */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-xs bg-surface-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
