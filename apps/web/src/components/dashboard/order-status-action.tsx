'use client';

import { FULFILMENT_LABELS, type FulfilmentStatus } from '@ojara/shared';
import {
  ChevronDown,
  ChevronUp,
  CircleCheck,
  type LucideIcon,
  Package,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { updateOrderStatus } from '@/app/(dashboard)/dash/orders/actions';
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

const OTHER_LABEL: Partial<Record<FulfilmentStatus, string>> = {
  CANCELLED: 'Cancel order',
};

/**
 * Next fulfilment step for an order (03.03 panel / 04.03 sticky bar), plus the other moves the API
 * allows (e.g. cancel) behind the chevron. Saves through PATCH /orders/:id/fulfilment.
 */
export function OrderStatusAction({
  orderId,
  orderNumber,
  status,
  pickup,
  nextStatuses,
  variant = 'panel',
}: {
  orderId: string;
  orderNumber: number;
  status: FulfilmentStatus;
  pickup: boolean;
  /** Statuses the API allows from here. */
  nextStatuses: FulfilmentStatus[];
  variant?: 'panel' | 'mobile';
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; error?: boolean } | null>(null);

  const suggested = nextStep(status, pickup);
  const step = suggested && nextStatuses.includes(suggested.next) ? suggested : undefined;
  const others = nextStatuses.filter((s) => s !== step?.next);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const move = (next: FulfilmentStatus, done: string) => {
    if (next === 'CANCELLED' && !window.confirm(`Cancel order #${orderNumber}?`)) return;
    setMenuOpen(false);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result.ok) {
        setToast({ title: `#${orderNumber} ${done}` });
        router.refresh();
      } else {
        setToast({ title: result.message, error: true });
      }
    });
  };

  const menu =
    menuOpen && others.length ? (
      <ul
        role="menu"
        className={cn(
          'absolute right-0 z-40 min-w-[200px] rounded-md border border-line bg-surface p-1 shadow-sticky',
          variant === 'mobile' ? 'bottom-full mb-2' : 'top-full mt-1',
        )}
      >
        {others.map((s) => (
          <li key={s}>
            <button
              type="button"
              role="menuitem"
              onClick={() => move(s, `is ${FULFILMENT_LABELS[s].toLowerCase()}`)}
              className={cn(
                'w-full rounded px-3 py-2 text-left text-[13px]/[19px] hover:bg-selected',
                s === 'CANCELLED' && 'text-danger',
              )}
            >
              {OTHER_LABEL[s] ?? `Mark as ${FULFILMENT_LABELS[s].toLowerCase()}`}
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  const moreButton = others.length ? (
    <span className="relative">
      <Button
        variant="secondary"
        size={variant === 'mobile' ? 'none' : undefined}
        aria-label="More status options"
        aria-expanded={menuOpen}
        disabled={pending}
        onClick={() => setMenuOpen((o) => !o)}
        className={variant === 'mobile' ? 'size-12 rounded-[10px] [&_svg]:text-fg' : 'px-[13px]'}
      >
        {variant === 'mobile' ? <ChevronUp className="size-[18px]" /> : <ChevronDown />}
      </Button>
      {menu}
    </span>
  ) : null;

  const toastEl = toast ? (
    <div
      role="status"
      className={cn(
        'fixed inset-x-4 z-50 sm:right-auto sm:left-1/2 sm:w-[420px] sm:-translate-x-1/2',
        variant === 'mobile' ? 'bottom-[104px]' : 'bottom-6',
      )}
    >
      <Toast title={toast.title} tone={toast.error ? 'danger' : 'success'} />
    </div>
  ) : null;

  if (variant === 'mobile') {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-line bg-surface px-4 pt-3 pb-[max(env(safe-area-inset-bottom),30px)] shadow-sticky lg:hidden">
          {step ? (
            <Button
              size="lg"
              className="flex-1"
              disabled={pending}
              onClick={() => move(step.next, step.done)}
            >
              <step.icon className="size-[18px]" /> {step.label}
            </Button>
          ) : (
            <span className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-surface-muted text-[15px]/[21px] font-semibold text-fg-muted">
              No further steps
            </span>
          )}
          {moreButton}
        </div>
        {toastEl}
      </>
    );
  }

  if (!step && !others.length) return null;
  return (
    <>
      <div className="flex gap-2">
        {step ? (
          <Button className="flex-1" disabled={pending} onClick={() => move(step.next, step.done)}>
            <step.icon /> {step.label}
          </Button>
        ) : (
          <span className="flex flex-1 items-center text-[13px]/[19px] text-fg-muted">
            Waiting for payment
          </span>
        )}
        {moreButton}
      </div>
      {toastEl}
    </>
  );
}
