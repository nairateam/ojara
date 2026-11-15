import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Buttons from 00.01/00.02 and §7 of the design spec: Inter, radius 8, 16px icons, gap 8.
 * The designs specify no hover states; hovers here are subtle tints of the same tokens.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md whitespace-nowrap transition-colors outline-none select-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /** Forest fill, paper text, 14/600. */
        primary: 'bg-forest text-paper font-semibold hover:bg-forest/90',
        /** Surface fill, 1px border, 14/500, muted icon. */
        secondary:
          'border border-line bg-surface text-fg font-medium hover:bg-selected [&_svg]:text-fg-muted',
        /** Red outline: "Delete store", "Suspend". */
        destructive:
          'border border-danger bg-transparent text-danger font-medium hover:bg-danger-soft',
        /** Paper on dark surfaces (sidebar upgrade, dark promo cards). */
        light: 'bg-paper text-forest font-semibold hover:bg-paper/90',
        /** Text-only link button, 13/600. */
        ghost: 'text-fg text-ui font-semibold hover:text-fg-muted',
        link: 'text-fg text-ui font-semibold underline-offset-4 hover:underline',
        /** No colours: for icon buttons styled by size (e.g. the top-bar bell). */
        none: 'hover:bg-selected',
      },
      size: {
        /** ~36px high (padding 9/14). */
        default: 'h-9 px-3.5 text-sm',
        sm: 'h-8 px-3 text-ui',
        /** Auth submit: 48 high, radius 10, 15/600. */
        lg: 'h-12 rounded-[10px] px-5 text-title',
        /** Marketing CTA: radius 12, padding 16/26, 16/600. */
        cta: 'h-14 rounded-lg px-[26px] text-base',
        /** 32x32 bordered icon button (panel headers). */
        icon: 'size-8 border border-line bg-surface text-fg-muted',
        /** 36x36 borderless icon button (top-bar bell). */
        'icon-ghost': 'size-9 text-fg-muted [&_svg:not([class*=size-])]:size-5',
        none: '',
      },
    },
    compoundVariants: [{ variant: 'ghost', size: 'default', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
