'use client';

import type { FulfilmentStatus } from '@ojara/shared';
import {
  ChevronDown,
  ChevronUp,
  type LucideIcon,
  Package,
  PackageCheck,
  Truck,
  CircleCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/feedback';
import { cn } from '@/lib/utils';

type Step = { next: FulfilmentStatus; label: string; icon: LucideIcon; done: string };

function nextStep(status: FulfilmentStatus, pickup: boolean): Step | undefined {
  switch (status) {
    case 'PENDING':
      return {
        next: 'PROCESSING',
        label: 'Start processing',
        icon: Package,
        done: 'is processing',
      };
    case 'PROCESSING':
      return {
        next: 'READY_FOR_DISPATCH',
        label: pickup ? 'Mark ready for pickup' : 'Mark ready for dispatch',
        icon: PackageCheck,
        done: pickup ? 'is ready for pickup' : 'is ready for dispatch',
      };
    case 'READY_FOR_DISPATCH':
      return pickup
        ? {
            next: 'DELIVERED',
            label: 'Mark as picked up',
            icon: CircleCheck,
            done: 'was picked up',
          }
        : { next: 'SHIPPED', label: 'Mark as shipped', icon: Truck, done: 'is on its way' };
    case 'SHIPPED':
      return {
        next: 'DELIVERED',
        label: 'Mark as delivered',
        icon: CircleCheck,
        done: 'was delivered',
      };
    default:
      return undefined;
  }
}

/**
 * Next fulfilment step for an order (03.03 panel / 04.03 sticky bar). Clicking shows the 00.07
 * success toast ("#OJ-1047 is ready for dispatch · Tunde was notified…") with Undo.
 * TODO(orders): call PATCH /v1/orders/:id/fulfilment instead of local state.
 */
export function OrderStatusAction({
  orderNumber,
  customerFirstName,
  status: initial,
  pickup = false,
  variant = 'panel',
}: {
  orderNumber: string;
  customerFirstName: string;
  status: FulfilmentStatus;
  pickup?: boolean;
  variant?: 'panel' | 'mobile';
}) {
  const [status, setStatus] = useState(initial);
  const [toast, setToast] = useState<{ title: string; previous: FulfilmentStatus } | null>(null);
  const step = nextStep(status, pickup);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const advance = () => {
    if (!step) return;
    setToast({ title: `${orderNumber} ${step.done}`, previous: status });
    setStatus(step.next);
  };

  const toastEl = toast ? (
    <div
      className={cn(
        'fixed inset-x-4 z-50 sm:right-auto sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2',
        variant === 'mobile' ? 'bottom-[104px]' : 'bottom-6',
      )}
    >
      <Toast
        title={toast.title}
        body={`${customerFirstName} was notified by SMS and email.`}
        action={
          <button
            type="button"
            onClick={() => {
              setStatus(toast.previous);
              setToast(null);
            }}
          >
            Undo
          </button>
        }
      />
    </div>
  ) : null;

  if (variant === 'mobile') {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-line bg-surface px-4 pt-3 pb-[max(env(safe-area-inset-bottom),30px)] shadow-sticky lg:hidden">
          {step ? (
            <Button size="lg" className="flex-1" onClick={advance}>
              <step.icon className="size-[18px]" /> {step.label}
            </Button>
          ) : (
            <span className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-surface-muted text-[15px]/[21px] font-semibold text-fg-muted">
              No further steps
            </span>
          )}
          <Button
            variant="secondary"
            size="none"
            className="size-12 rounded-[10px] [&_svg]:text-fg"
            aria-label="More status options"
          >
            <ChevronUp className="size-[18px]" />
          </Button>
        </div>
        {toastEl}
      </>
    );
  }

  return (
    <>
      {step ? (
        <div className="flex gap-2">
          <Button className="flex-1" onClick={advance}>
            <step.icon /> {step.label}
          </Button>
          <Button variant="secondary" aria-label="More status options" className="px-[13px]">
            <ChevronDown />
          </Button>
        </div>
      ) : null}
      {toastEl}
    </>
  );
}
