'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const SIZES = {
  lg: {
    box: 'rounded-md bg-store-card',
    cell: 'h-[50px] w-[42px]',
    icon: 'size-3.5',
    text: 'text-sm',
  },
  md: { box: 'rounded-md bg-store-card', cell: 'size-9', icon: 'size-[13px]', text: 'text-sm' },
  sm: { box: 'rounded-sm', cell: 'h-7 w-[30px]', icon: 'size-3', text: 'text-ui' },
  xs: { box: 'rounded-sm', cell: 'h-[26px] w-7', icon: 'size-3', text: 'text-xs' },
} as const;

/** Quantity stepper (− n +). Uncontrolled by default; pass `value` + `onChange` to control it. */
export function QuantityStepper({
  initial = 1,
  max = 10,
  size = 'md',
  label = 'Quantity',
  name,
  className,
  value,
  onChange,
}: {
  initial?: number;
  max?: number;
  size?: keyof typeof SIZES;
  label?: string;
  name?: string;
  className?: string;
  value?: number;
  onChange?: (qty: number) => void;
}) {
  const [own, setOwn] = useState(initial);
  const qty = value ?? own;
  const setQty = (next: (q: number) => number) => {
    const n = next(qty);
    if (onChange) onChange(n);
    else setOwn(n);
  };
  const s = SIZES[size];
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex items-center border border-store-border', s.box, className)}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={qty <= 1}
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className={cn(
          'flex items-center justify-center text-store-body disabled:opacity-40',
          s.cell,
        )}
      >
        <Minus className={s.icon} aria-hidden />
      </button>
      <output
        aria-live="polite"
        className={cn(
          'flex items-center justify-center font-semibold text-store-ink',
          s.cell,
          s.text,
        )}
      >
        {qty}
      </output>
      {name ? <input type="hidden" name={name} value={qty} /> : null}
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={qty >= max}
        onClick={() => setQty((q) => Math.min(max, q + 1))}
        className={cn(
          'flex items-center justify-center text-store-body disabled:opacity-40',
          s.cell,
        )}
      >
        <Plus className={s.icon} aria-hidden />
      </button>
    </div>
  );
}
