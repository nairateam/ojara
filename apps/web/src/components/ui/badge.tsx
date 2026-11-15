import {
  FULFILMENT_LABELS,
  type FulfilmentStatus,
  PAYMENT_LABELS,
  type PaymentStatus,
} from '@ojara/shared';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheck, CircleDashed, CircleX, Hourglass, Lock, RotateCcw } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Status pill (00.03): radius 999, padding 3/9, 6px dot, Inter 12/500 coloured like the dot.
 * Reused for store, product, subscription and domain statuses.
 */
const pillVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-pill px-[9px] py-[3px] text-xs font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-fg-muted',
        strong: 'bg-surface-muted text-fg',
        info: 'bg-info-soft text-info',
        warning: 'bg-attention-soft text-warning',
        success: 'bg-success-soft text-success',
        danger: 'bg-danger-soft text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

type PillTone = NonNullable<VariantProps<typeof pillVariants>['tone']>;

function StatusPill({
  tone,
  dot = true,
  className,
  children,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof pillVariants> & { dot?: boolean }) {
  return (
    <span data-slot="status-pill" className={cn(pillVariants({ tone }), className)} {...props}>
      {dot ? <span aria-hidden className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

const FULFILMENT_TONES: Record<FulfilmentStatus, PillTone> = {
  PENDING: 'neutral',
  PROCESSING: 'info',
  READY_FOR_DISPATCH: 'strong',
  SHIPPED: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'neutral',
};

function FulfilmentBadge({ status, className }: { status: FulfilmentStatus; className?: string }) {
  return (
    <StatusPill tone={FULFILMENT_TONES[status]} className={className}>
      {FULFILMENT_LABELS[status]}
    </StatusPill>
  );
}

/**
 * Payment badge (00.04): outlined, radius 6, coloured 13px icon, label always forest.
 * UNPAID has no design; it uses a muted dashed circle (see docs/DESIGN_NOTES.md).
 */
const PAYMENT_ICONS: Record<PaymentStatus, { icon: typeof CircleCheck; color: string }> = {
  PAID: { icon: CircleCheck, color: 'text-success' },
  PENDING: { icon: Hourglass, color: 'text-warning' },
  FAILED: { icon: CircleX, color: 'text-danger' },
  REFUNDED: { icon: RotateCcw, color: 'text-fg-muted' },
  UNPAID: { icon: CircleDashed, color: 'text-fg-subtle' },
};

function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const { icon: Icon, color } = PAYMENT_ICONS[status];
  return (
    <span
      data-slot="payment-badge"
      className={cn(
        'inline-flex w-fit items-center gap-[5px] rounded-sm border border-line bg-surface py-0.5 pr-2 pl-1.5 text-xs font-medium text-fg',
        className,
      )}
    >
      <Icon className={cn('size-[13px]', color)} aria-hidden />
      {PAYMENT_LABELS[status]}
    </span>
  );
}

/** Small tag (§7): radius 4, padding 1/6, Inter 10/700 — "New", "Low", "Sold out", "Soon". */
const tagVariants = cva('inline-flex items-center gap-1 rounded-xs px-1.5 py-px text-micro font-bold', {
  variants: {
    tone: {
      success: 'bg-success-soft text-success',
      info: 'bg-info-soft text-info',
      warning: 'bg-attention-soft text-warning',
      danger: 'bg-danger-soft text-danger',
      muted: 'bg-surface-muted text-fg-subtle',
    },
  },
  defaultVariants: { tone: 'muted' },
});

function Tag({ tone, className, ...props }: React.ComponentProps<'span'> & VariantProps<typeof tagVariants>) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />;
}

/** Upsell lock tag: amber, lock icon, plan name in 9/700 caps. */
function PlanLockTag({ plan, className }: { plan: 'STARTER' | 'PROFESSIONAL'; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-xs bg-attention-soft px-1.5 py-px text-[9px] font-bold tracking-label text-warning', className)}>
      <Lock className="size-[9px]" aria-hidden />
      {plan}
    </span>
  );
}

export { FulfilmentBadge, PaymentBadge, PlanLockTag, StatusPill, Tag };
export type { PillTone };
