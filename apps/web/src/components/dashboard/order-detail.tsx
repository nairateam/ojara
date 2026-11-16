import { formatKobo, type OrderDetailDto } from '@ojara/shared';
import { Check, Mail, MapPin, MessageCircle, Phone, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';
import { FulfilmentBadge, PaymentBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/feedback';
import { DetailPanel, SectionLabel } from '@/components/ui/panels';
import { cn } from '@/lib/utils';
import { formatOrderTime } from './format';
import { OrderStatusAction } from './order-status-action';
import { PanelBlock } from './panel-block';
import { PaymentFailedNotice } from './system-states';
import { ProductThumb } from './thumb';

export type OrderStep = { label: string; time?: string; state: 'done' | 'current' | 'todo' };

export function orderTitle(order: { number: number }) {
  return `#${order.number}`;
}

export function customerLabel(order: OrderDetailDto) {
  return order.customerName ?? order.customerPhone ?? 'Customer';
}

export function placedSentence(order: OrderDetailDto) {
  const paid = order.payments.find((p) => p.status === 'PAID');
  return `Placed ${formatOrderTime(order.createdAt)}${
    paid?.paidAt ? ` · Paid ${formatOrderTime(paid.paidAt)}` : ''
  } · ${order.isPickup ? 'Pickup' : 'Delivery'}`;
}

/** Plain-text address line for the order (delivery address or pickup point). */
export function placeText(order: OrderDetailDto) {
  if (order.isPickup) return order.pickupAddress ? `Pickup at ${order.pickupAddress}` : 'Pickup';
  const a = order.deliveryAddress;
  if (!a) return 'No address given';
  return [a.line1, a.city, a.state].filter(Boolean).join(', ');
}

/** wa.me / tel: links from the customer's +234 number. */
export function contactLinks(order: OrderDetailDto) {
  const phone = order.customerPhone;
  if (!phone) return { tel: undefined, whatsapp: undefined };
  return { tel: `tel:${phone}`, whatsapp: `https://wa.me/${phone.replace(/\D/g, '')}` };
}

/** Whether the merchant has a next step to take on this order. */
export function canAct(order: OrderDetailDto) {
  return order.nextStatuses.length > 0;
}

const FLOW = ['PENDING', 'PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED'] as const;

/** Progress rail from the order's state (03.03): placed, paid, then the fulfilment steps. */
export function orderSteps(order: OrderDetailDto): OrderStep[] {
  const paid = order.payments.find((p) => p.status === 'PAID');
  const steps: OrderStep[] = [
    { label: 'Order placed', time: formatOrderTime(order.createdAt), state: 'done' },
  ];
  if (order.fulfilmentStatus === 'CANCELLED' || order.fulfilmentStatus === 'REFUNDED') {
    if (paid)
      steps.push({
        label: 'Paid',
        time: paid.paidAt ? formatOrderTime(paid.paidAt) : undefined,
        state: 'done',
      });
    steps.push({
      label: order.fulfilmentStatus === 'CANCELLED' ? 'Cancelled' : 'Refunded',
      state: 'done',
    });
    return steps;
  }
  steps.push({
    label: order.paymentStatus === 'PAID' ? 'Paid' : 'Waiting for payment',
    time: paid?.paidAt ? formatOrderTime(paid.paidAt) : undefined,
    state: order.paymentStatus === 'PAID' ? 'done' : 'current',
  });
  const flow = FLOW.filter((s) => !(order.isPickup && s === 'SHIPPED'));
  const at = flow.indexOf(order.fulfilmentStatus);
  const labels: Record<(typeof FLOW)[number], string> = {
    PENDING: 'To fulfil',
    PROCESSING: 'Processing',
    READY_FOR_DISPATCH: order.isPickup ? 'Ready for pickup' : 'Ready for dispatch',
    SHIPPED: 'Shipped',
    DELIVERED: order.isPickup ? 'Picked up' : 'Delivered',
  };
  flow.slice(1).forEach((s, i) => {
    const idx = i + 1;
    steps.push({
      label: labels[s],
      state:
        order.paymentStatus !== 'PAID'
          ? 'todo'
          : idx < at || (idx === at && s === 'DELIVERED')
            ? 'done'
            : idx === at
              ? 'current'
              : 'todo',
    });
  });
  return steps;
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
export function OrderItems({ order }: { order: OrderDetailDto }) {
  const paid = order.payments.find((p) => p.status === 'PAID');
  return (
    <div className="flex flex-col gap-3.5">
      <ul className="flex flex-col gap-3.5">
        {order.items.map((item, i) => (
          <li
            key={`${item.name}-${item.variantLabel ?? ''}-${i}`}
            className="flex items-center gap-3"
          >
            <ProductThumb publicId={item.imagePublicId} name={item.name} size={44} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[13px]/[19px] font-semibold">{item.name}</span>
              <span className="text-xs text-fg-muted">
                {item.variantLabel ? `${item.variantLabel} · ` : ''}
                {item.quantity} × {formatKobo(item.unitPriceKobo)}
                {item.sku ? ` · ${item.sku}` : ''}
              </span>
            </span>
            <span className="text-[13px]/[19px] font-medium">{formatKobo(item.lineTotalKobo)}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 border-t border-line pt-3 text-[13px]/[19px]">
        <div className="flex justify-between">
          <span className="text-fg-muted">Subtotal</span>
          <span className="font-medium">{formatKobo(order.subtotalKobo)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-fg-muted">
            {order.isPickup ? 'Pickup' : `Delivery${order.zoneName ? ` · ${order.zoneName}` : ''}`}
          </span>
          <span className="font-medium">
            {order.deliveryFeeKobo ? formatKobo(order.deliveryFeeKobo) : 'Free'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-[15px]/[21px] font-bold">{formatKobo(order.totalKobo)}</span>
        </div>
      </div>
      {paid ? (
        <p className="flex items-start gap-2.5 rounded-md bg-success-soft px-3 py-2.5 text-xs text-success">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          Paid via Paystack · ref {paid.reference}
        </p>
      ) : null}
    </div>
  );
}

/** Customer section: avatar, contact rows, address, note, WhatsApp / Call. */
export function OrderCustomer({ order }: { order: OrderDetailDto }) {
  const name = customerLabel(order);
  const links = contactLinks(order);
  const btn =
    'inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-surface text-[13px]/[19px] font-semibold hover:bg-selected [&_svg]:size-4';
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3">
        <Avatar name={name} size={34} className="size-9 text-xs" />
        <span className="truncate text-sm font-semibold">{name}</span>
      </div>
      <ul className="flex flex-col gap-3 text-[13px]/[19px]">
        {order.customerPhone ? (
          <li className="flex items-center gap-2.5">
            <Phone className="size-[15px] text-fg-subtle" aria-hidden /> {order.customerPhone}
          </li>
        ) : null}
        {order.customerEmail ? (
          <li className="flex items-center gap-2.5">
            <Mail className="size-[15px] text-fg-subtle" aria-hidden /> {order.customerEmail}
          </li>
        ) : null}
        <li className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 size-[15px] shrink-0 text-fg-subtle" aria-hidden />
          <span className="flex flex-col gap-0.5">
            {placeText(order)}
            {order.deliveryAddress?.landmark ? (
              <span className="text-xs text-fg-muted">{order.deliveryAddress.landmark}</span>
            ) : null}
          </span>
        </li>
      </ul>
      {order.note ? (
        <div className="flex flex-col gap-1 rounded-md bg-attention-soft px-3 py-2.5">
          <span className="text-[11px]/[14px] font-semibold text-warning">Note from customer</span>
          <p className="text-[13px]/[19px]">{order.note}</p>
        </div>
      ) : null}
      {links.tel ? (
        <div className="grid grid-cols-2 gap-2">
          <a href={links.whatsapp} target="_blank" rel="noreferrer" className={btn}>
            <MessageCircle aria-hidden /> WhatsApp
          </a>
          <a href={links.tel} className={btn}>
            <Phone aria-hidden /> Call
          </a>
        </div>
      ) : null}
    </div>
  );
}

/** Payment failed / abandoned card. */
export function OrderPaymentFailed({ order }: { order: OrderDetailDto }) {
  const last = order.payments[0];
  return (
    <PaymentFailedNotice
      orderNumber={orderTitle(order)}
      reason="The customer’s payment didn’t go through"
      amountKobo={order.totalKobo}
      attempted={formatOrderTime(order.createdAt)}
      reference={last?.reference ?? '—'}
    />
  );
}

/** 03.03 right panel: header, status pair, next step, progress, items, customer. */
export function OrderPanel({ order, closeHref }: { order: OrderDetailDto; closeHref: string }) {
  const iconBtn =
    'inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-selected [&_svg]:size-4';
  return (
    <DetailPanel aria-label={`Order ${orderTitle(order)}`}>
      <div className="flex flex-col gap-3 border-b border-line px-6 py-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[24px]/[30px] font-semibold tracking-[-0.4px]">
            {orderTitle(order)}
          </h2>
          <Link href={closeHref} scroll={false} aria-label="Close" className={iconBtn}>
            <X aria-hidden />
          </Link>
        </div>
        <p className="text-[13px]/[19px] text-fg-muted">{placedSentence(order)}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col items-start gap-1.5 rounded-md bg-paper px-3 py-2.5">
            <SectionLabel className="text-[11px]/[14px] tracking-[0.6px]">Payment</SectionLabel>
            <PaymentBadge status={order.paymentStatus} />
          </div>
          <div className="flex flex-col items-start gap-1.5 rounded-md bg-paper px-3 py-2.5">
            <SectionLabel className="text-[11px]/[14px] tracking-[0.6px]">Fulfilment</SectionLabel>
            <FulfilmentBadge status={order.fulfilmentStatus} />
          </div>
        </div>
      </div>

      {order.paymentStatus === 'FAILED' ? (
        <PanelBlock>
          <OrderPaymentFailed order={order} />
        </PanelBlock>
      ) : null}
      {canAct(order) ? (
        <PanelBlock className="gap-2.5">
          <OrderStatusAction
            orderId={order.id}
            orderNumber={order.number}
            status={order.fulfilmentStatus}
            pickup={order.isPickup}
            nextStatuses={order.nextStatuses}
          />
        </PanelBlock>
      ) : null}

      <PanelBlock label="Progress" className="gap-3">
        <OrderTimeline steps={orderSteps(order)} />
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
