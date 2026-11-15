'use client';

import { Label as LabelPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/** Form label: Inter 13/600, forest. */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-ui font-semibold text-fg select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
