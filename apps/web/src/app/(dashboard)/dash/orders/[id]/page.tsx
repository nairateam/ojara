import { formatKobo } from '@ojara/shared';
import { ChevronLeft, Ellipsis, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import {
  OrderCustomer,
  OrderItems,
  OrderTimeline,
  customerFor,
  firstName,
} from '@/components/dashboard/order-detail';
import { OrderStatusAction } from '@/components/dashboard/order-status-action';
import { PaymentFailedNotice } from '@/components/dashboard/system-states';
import { Thumb } from '@/components/dashboard/thumb';
import { FulfilmentBadge, PaymentBadge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/feedback';
import { SectionLabel } from '@/components/ui/panels';
import { cn } from '@/lib/utils';
import { type MockOrder, findOrder } from '@/mock/dashboard';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = findOrder((await params).id);
  return { title: order ? `Order ${order.number}` : 'Order not found' };
}

const SEGMENTS = [
  { label: 'Processing', status: 'PROCESSING' },
  { label: 'Ready', status: 'READY_FOR_DISPATCH' },
  { label: 'Shipped', status: 'SHIPPED' },
  { label: 'Delivered', status: 'DELIVERED' },
] as const;

function canAdvance(order: MockOrder) {
  return (
    order.payment === 'PAID' && !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.fulfilment)
  );
}

/** 04.03 4-segment progress (5px bars, radius 3) with labels; current label 11/700. */
function SegmentProgress({ order }: { order: MockOrder }) {
  const current = SEGMENTS.findIndex((s) => s.status === order.fulfilment);
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-3.5">
      <div className="grid grid-cols-4 gap-1">
        {SEGMENTS.map((s, i) => (
          <span
            key={s.status}
            className={cn('h-[5px] rounded-[3px]', i <= current ? 'bg-forest' : 'bg-line')}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 text-center text-[11px]/[14px]">
        {SEGMENTS.map((s, i) => (
          <span
            key={s.status}
            className={cn(
              i === 0 && 'text-left',
              i === SEGMENTS.length - 1 && 'text-right',
              i === current ? 'font-bold text-fg' : 'font-medium text-fg-subtle',
            )}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 04.03 mobile order detail. */
function MobileOrderDetail({ order }: { order: MockOrder }) {
  const c = customerFor(order);
  const paidLine =
    order.payment === 'PAID'
      ? `${formatKobo(order.totalKobo)} via Paystack`
      : order.payment === 'PENDING'
        ? 'Waiting for Paystack'
        : order.payment === 'FAILED'
          ? 'Card declined'
          : 'Refunded via Paystack';
  const cardCls = 'rounded-lg border border-line bg-surface p-3.5';
  return (
    <div className={cn('flex flex-col lg:hidden', canAdvance(order) && 'pb-24')}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-3 pt-1.5 pb-3">
        <Link
          href="/orders"
          aria-label="Back to orders"
          className="inline-flex size-[38px] items-center justify-center"
        >
          <ChevronLeft className="size-[22px]" aria-hidden />
        </Link>
        <span className="flex flex-col items-center">
          <h1 className="text-base font-bold">{order.number}</h1>
          <span className="text-xs text-fg-muted">{order.placed}</span>
        </span>
        <button
          type="button"
          aria-label="More actions"
          className="inline-flex size-[38px] items-center justify-center"
        >
          <Ellipsis className="size-[22px]" aria-hidden />
        </button>
      </header>

      <div className="flex flex-col gap-3.5 p-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className={cn(cardCls, 'flex flex-col items-start gap-[7px] rounded-lg p-3')}>
            <SectionLabel className="text-[10px]/[14px] font-bold">Payment</SectionLabel>
            <PaymentBadge status={order.payment} />
            <span className="text-xs text-fg-muted">{paidLine}</span>
          </div>
          <div className={cn(cardCls, 'flex flex-col items-start gap-[7px] rounded-lg p-3')}>
            <SectionLabel className="text-[10px]/[14px] font-bold">Fulfilment</SectionLabel>
            <FulfilmentBadge status={order.fulfilment} />
            {order.statusContext ? (
              <span className="text-xs text-fg-muted">{order.statusContext}</span>
            ) : null}
          </div>
        </div>

        {order.failure ? (
          <div className={cardCls}>
            <PaymentFailedNotice
              orderNumber={order.number}
              reason={order.failure.reason}
              amountKobo={order.totalKobo}
              attempted={order.failure.attempted}
              reference={order.failure.reference}
            />
          </div>
        ) : SEGMENTS.some((s) => s.status === order.fulfilment) ? (
          <SegmentProgress order={order} />
        ) : null}

        <div className={cn(cardCls, 'flex flex-col gap-3')}>
          <div className="flex items-center gap-3">
            <Avatar name={order.customer} size={40} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[15px]/[21px] font-semibold">{order.customer}</span>
              {c ? (
                <span className="text-xs text-fg-muted">
                  {c.orders > 1 ? 'Returning' : 'New'} · {c.orders} order{c.orders === 1 ? '' : 's'}
                </span>
              ) : null}
            </span>
            <a
              href={c ? `tel:${c.phone.replace(/\s/g, '')}` : undefined}
              aria-label={`Call ${order.customer}`}
              className="inline-flex size-[38px] items-center justify-center rounded-full bg-surface-muted"
            >
              <Phone className="size-[17px]" aria-hidden />
            </a>
            <a
              href={c ? `https://wa.me/${c.phone.replace(/\D/g, '')}` : undefined}
              aria-label={`WhatsApp ${order.customer}`}
              className="inline-flex size-[38px] items-center justify-center rounded-full bg-success-soft text-success"
            >
              <MessageCircle className="size-[17px]" aria-hidden />
            </a>
          </div>
          <div className="flex gap-2.5 border-t border-line pt-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px]/[19px]">
                {order.method === 'Pickup' ? 'Pickup at Surulere studio' : order.address}
              </span>
              <span className="text-xs text-fg-muted">
                {order.method === 'Pickup'
                  ? 'Pickup · Free'
                  : `Delivery · ${order.deliveryZone ?? order.place} · ${
                      order.deliveryKobo ? formatKobo(order.deliveryKobo) : 'Free'
                    }`}
              </span>
            </span>
          </div>
          {order.note ? (
            <p className="rounded-md bg-attention-soft px-[11px] py-[9px] text-xs text-[#6E4A0E]">
              “{order.note}”
            </p>
          ) : null}
        </div>

        <div className={cn(cardCls, 'flex flex-col gap-3')}>
          {order.items.map((item) => (
            <div key={`${item.name}-${item.variant}`} className="flex items-center gap-3">
              <Thumb src={item.image} size={44} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[13px]/[19px] font-semibold">{item.name}</span>
                <span className="text-xs text-fg-muted">
                  {item.shortVariant} · ×{item.quantity}
                </span>
              </span>
              <span className="text-[13px]/[19px] font-semibold">
                {formatKobo(item.unitKobo * item.quantity)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-line pt-2.5">
            <span className="text-[13px]/[19px] text-fg-muted">Total incl. delivery</span>
            <span className="text-[15px]/[21px] font-bold">{formatKobo(order.totalKobo)}</span>
          </div>
        </div>
      </div>

      {canAdvance(order) ? (
        <OrderStatusAction
          variant="mobile"
          orderNumber={order.number}
          customerFirstName={firstName(order.customer)}
          status={order.fulfilment}
          pickup={order.method === 'Pickup'}
        />
      ) : null}
    </div>
  );
}

/** Order detail: 04.03 on phones; on desktop the same content as a full page (03.03 panel). */
export default async function OrderDetailPage({ params }: Props) {
  const order = findOrder((await params).id);
  if (!order) notFound();

  return (
    <>
      <MobileOrderDetail order={order} />
      <PageContainer className="hidden lg:flex">
        <PageHeader
          back={{ href: '/orders', label: 'Orders' }}
          title={order.number}
          badge={
            <span className="flex items-center gap-2">
              <PaymentBadge status={order.payment} />
              <FulfilmentBadge status={order.fulfilment} />
            </span>
          }
          subtitle={order.placedSentence}
        />
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-5">
            {order.failure ? (
              <Card>
                <PaymentFailedNotice
                  orderNumber={order.number}
                  reason={order.failure.reason}
                  amountKobo={order.totalKobo}
                  attempted={order.failure.attempted}
                  reference={order.failure.reference}
                />
              </Card>
            ) : null}
            <Card>
              <CardTitle className="text-[15px]/[21px] text-fg">Items</CardTitle>
              <OrderItems order={order} />
            </Card>
          </div>
          <div className="flex flex-col gap-5">
            {canAdvance(order) ? (
              <Card className="gap-2.5">
                <CardTitle className="text-[15px]/[21px] text-fg">Next step</CardTitle>
                <OrderStatusAction
                  orderNumber={order.number}
                  customerFirstName={firstName(order.customer)}
                  status={order.fulfilment}
                  pickup={order.method === 'Pickup'}
                />
                <p className="text-xs text-fg-muted">
                  {firstName(order.customer)} gets an SMS and email each time you update the status.
                </p>
              </Card>
            ) : null}
            <Card>
              <CardTitle className="text-[15px]/[21px] text-fg">Progress</CardTitle>
              <OrderTimeline steps={order.steps} />
            </Card>
            <Card>
              <CardTitle className="text-[15px]/[21px] text-fg">Customer</CardTitle>
              <OrderCustomer order={order} />
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
