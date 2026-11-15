import { formatKobo } from '@ojara/shared';
import {
  Check,
  Ellipsis,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FulfilmentBadge, PaymentBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/feedback';
import { DetailPanel, SectionLabel } from '@/components/ui/panels';
import { PanelBlock } from './panel-block';
import { cn } from '@/lib/utils';
import { CUSTOMERS, type MockOrder, type OrderStep } from '@/mock/dashboard';
import { OrderStatusAction } from './order-status-action';
import { PaymentFailedNotice } from './system-states';
import { Thumb } from './thumb';

export function customerFor(order: MockOrder) {
  return CUSTOMERS.find((c) => c.id === order.customerId);
}

export function firstName(name: string) {
  return name.split(/\s+/)[0] ?? name;
}

/** Vertical progress rail (03.03): 18px markers, 1.5px lines; done = green check. */
export function OrderTimeline({ steps }: { steps: OrderStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.label} className="flex gap-3">
            <span className="flex w-[18px] shrink-0 flex-col items-center">
              <span
                className={cn(
                  'flex size-[18px] shrink-0 items-center justify-center rounded-full',
                  s.state === 'done' && 'bg-success',
                  s.state === 'current' && 'border-[1.5px] border-forest bg-surface-muted',
                  s.state === 'todo' && 'border-[1.5px] border-line-strong bg-surface',
                )}
              >
                {s.state === 'done' ? (
                  <Check className="size-[11px] text-paper" strokeWidth={3} aria-hidden />
                ) : null}
                {s.state === 'current' ? (
                  <span className="size-1.5 rounded-full bg-forest" aria-hidden />
                ) : null}
              </span>
              {last ? null : (
                <span
                  className={cn('w-[1.5px] flex-1', s.state === 'done' ? 'bg-success' : 'bg-line')}
                />
              )}
            </span>
            <span className={cn('flex flex-col gap-0.5', !last && 'pb-3.5')}>
              <span
                className={cn(
                  'text-[13px]/[19px]',
                  s.state === 'todo' ? 'text-fg-subtle' : 'font-semibold text-fg',
                )}
              >
                {s.label}
              </span>
              {s.time ? <span className="text-xs text-fg-muted">{s.time}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Line items + subtotal/delivery/total + Paystack note (03.03 ITEMS section). */
export function OrderItems({ order }: { order: MockOrder }) {
  const subtotal = order.items.reduce((sum, i) => sum + i.unitKobo * i.quantity, 0);
  return (
    <div className="flex flex-col gap-3.5">
      <ul className="flex flex-col gap-3.5">
        {order.items.map((item) => (
          <li key={`${item.name}-${item.variant}`} className="flex items-center gap-3">
            <Thumb src={item.image} size={44} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[13px]/[19px] font-semibold">{item.name}</span>
              <span className="text-xs text-fg-muted">
                {item.variant} · {item.quantity} × {formatKobo(item.unitKobo)}
              </span>
            </span>
            <span className="text-[13px]/[19px] font-medium">
              {formatKobo(item.unitKobo * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-line pt-3 text-[13px]/[19px]">
        <div className="flex justify-between">
          <span className="text-fg-muted">Subtotal</span>
          <span className="font-medium">{formatKobo(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fg-muted">
            {order.method === 'Pickup'
              ? 'Pickup · Surulere studio'
              : `Delivery · ${order.deliveryZone ?? order.place}`}
          </span>
          <span className="font-medium">
            {order.deliveryKobo ? formatKobo(order.deliveryKobo) : 'Free'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-[15px]/[21px] font-bold">{formatKobo(order.totalKobo)}</span>
        </div>
      </div>
      {order.paymentNote ? (
        <p className="flex items-start gap-2.5 rounded-md bg-success-soft px-3 py-2.5 text-xs text-success">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          {order.paymentNote}
        </p>
      ) : null}
    </div>
  );
}

/** Customer section: avatar, history line, contact rows, note, WhatsApp / Call. */
export function OrderCustomer({ order }: { order: MockOrder }) {
  const c = customerFor(order);
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <Avatar name={order.customer} size={34} className="size-9 text-xs" />
        <span className="flex min-w-0 flex-col gap-0.5">
          <Link
            href={`/customers?customer=${order.customerId}`}
            className="text-sm font-semibold hover:underline"
          >
            {order.customer}
          </Link>
          {c ? (
            <span className="text-xs text-fg-muted">
              {c.orders > 1 ? 'Returning customer' : 'New customer'} · {c.orders} order
              {c.orders === 1 ? '' : 's'} · {formatKobo(c.spentKobo)} spent
            </span>
          ) : null}
        </span>
      </div>
      {c ? (
        <ul className="flex flex-col gap-3 text-[13px]/[19px]">
          <li className="flex items-center gap-2.5">
            <Phone className="size-[15px] text-fg-subtle" aria-hidden /> {c.phone}
          </li>
          <li className="flex items-center gap-2.5">
            <Mail className="size-[15px] text-fg-subtle" aria-hidden /> {c.email}
          </li>
          <li className="flex items-center gap-2.5">
            <MapPin className="size-[15px] text-fg-subtle" aria-hidden />
            {order.method === 'Pickup' ? 'Pickup at Surulere studio' : order.address}
          </li>
        </ul>
      ) : null}
      {order.note ? (
        <div className="flex flex-col gap-1 rounded-md bg-attention-soft px-3 py-2.5">
          <span className="text-[11px]/[14px] font-semibold text-warning">Note from customer</span>
          <p className="text-[13px]/[19px]">{order.note}</p>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary">
          <MessageCircle /> WhatsApp
        </Button>
        <Button variant="secondary">
          <Phone /> Call
        </Button>
      </div>
    </div>
  );
}

/** 03.03 right panel: header, status pair, next step, progress, items, customer. */
export function OrderPanel({ order, closeHref }: { order: MockOrder; closeHref: string }) {
  const iconBtn =
    'inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-selected [&_svg]:size-4';
  return (
    <DetailPanel aria-label={`Order ${order.number}`}>
      <div className="flex flex-col gap-3 border-b border-line px-6 py-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[24px]/[30px] font-semibold tracking-[-0.4px]">
            {order.number}
          </h2>
          <div className="flex gap-1">
            <button type="button" aria-label="Print" className={cn(iconBtn, 'border border-line')}>
              <Printer aria-hidden />
            </button>
            <button
              type="button"
              aria-label="More actions"
              className={cn(iconBtn, 'border border-line')}
            >
              <Ellipsis aria-hidden />
            </button>
            <Link href={closeHref} scroll={false} aria-label="Close" className={iconBtn}>
              <X aria-hidden />
            </Link>
          </div>
        </div>
        <p className="text-[13px]/[19px] text-fg-muted">{order.placedSentence}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col items-start gap-1.5 rounded-md bg-paper px-3 py-2.5">
            <SectionLabel className="text-[11px]/[14px] tracking-[0.6px]">Payment</SectionLabel>
            <PaymentBadge status={order.payment} />
          </div>
          <div className="flex flex-col items-start gap-1.5 rounded-md bg-paper px-3 py-2.5">
            <SectionLabel className="text-[11px]/[14px] tracking-[0.6px]">Fulfilment</SectionLabel>
            <FulfilmentBadge status={order.fulfilment} />
          </div>
        </div>
      </div>

      {order.failure ? (
        <PanelBlock>
          <PaymentFailedNotice
            orderNumber={order.number}
            reason={order.failure.reason}
            amountKobo={order.totalKobo}
            attempted={order.failure.attempted}
            reference={order.failure.reference}
          />
        </PanelBlock>
      ) : order.payment === 'PAID' &&
        !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.fulfilment) ? (
        <PanelBlock className="gap-2.5">
          <OrderStatusAction
            orderNumber={order.number}
            customerFirstName={firstName(order.customer)}
            status={order.fulfilment}
            pickup={order.method === 'Pickup'}
          />
          <p className="text-xs text-fg-muted">
            {firstName(order.customer)} gets an SMS and email each time you update the status.
          </p>
        </PanelBlock>
      ) : null}

      <PanelBlock label="Progress" className="gap-3">
        <OrderTimeline steps={order.steps} />
      </PanelBlock>
      <PanelBlock label="Items">
        <OrderItems order={order} />
      </PanelBlock>
      <PanelBlock label="Customer">
        <OrderCustomer order={order} />
      </PanelBlock>
    </DetailPanel>
  );
}
