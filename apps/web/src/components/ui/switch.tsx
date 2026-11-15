'use client';

import { Switch as SwitchPrimitive } from 'radix-ui';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Toggle (§7): track 34x20 radius 10, knob 16 paper. On = forest (`tone="success"` = green, used by
 * the "Store is open" toggle), off = #C4C9B6. `size="sm"` is the 32x18 compact variant.
 */
function Switch({
  className,
  size = 'default',
  tone = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & { size?: 'default' | 'sm'; tone?: 'default' | 'success' }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex shrink-0 items-center rounded-[10px] p-0.5 transition-colors outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-toggle-off',
        tone === 'success' ? 'data-[state=checked]:bg-success' : 'data-[state=checked]:bg-forest',
        size === 'sm' ? 'h-[18px] w-8' : 'h-5 w-[34px]',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full bg-paper transition-transform data-[state=unchecked]:translate-x-0',
          size === 'sm' ? 'size-3.5 data-[state=checked]:translate-x-3.5' : 'size-4 data-[state=checked]:translate-x-3.5',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
