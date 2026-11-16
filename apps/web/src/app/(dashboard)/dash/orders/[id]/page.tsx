import { formatKobo, type OrderDetailDto } from '@ojara/shared';
import { ChevronLeft, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { formatOrderTime } from '@/components/dashboard/format';
import {
  OrderCustomer,
  OrderItems,
  OrderPaymentFailed,
  OrderTimeline,
  canAct,
  contactLinks,
  customerLabel,
  orderSteps,
  orderTitle,
  placeText,
  placedSentence,
} from '@/components/dashboard/order-detail';
import { OrderStatusAction } from '@/components/dashboard/order-status-action';
import { ProductThumb } from '@/components/dashboard/thumb';
import { FulfilmentBadge, PaymentBadge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/feedback';
import { SectionLabel } from '@/components/ui/panels';
import { getOrder } from '@/lib/api/orders';
import { requireMerchant } from '@/lib/auth/guards';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ id: string }> };

async function load(params: Props['params']) {
  const { membership } = await requireMerchant();
  return getOrder(membership.id, (await params).id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const order = await load(params);
  return { title: order ? `Order ${orderTitle(order)}` : 'Order not found' };
}

const SEGMENTS = [
  { label: 'Processing', status: 'PROCESSING' },
  { label: 'Ready', status: 'READY_FOR_DISPATCH' },
  { label: 'Shipped', status: 'SHIPPED' },
  { label: 'Delivered', status: 'DELIVERED' },
] as const;

/** 04.03 segment progress (5px bars, radius 3) with labels; current label 11/700. */
function SegmentProgress({ order }: { order: OrderDetailDto }) {
  const segments = SEGMENTS.filter((s) => !(order.isPickup && s.status === 'SHIPPED'));
  const current = segments.findIndex((s) => s.status === order.fulfilmentStatus);
  const cols = segments.length === 4 ? 'grid-cols-4' : 'grid-cols-3';
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-3.5">
      <div className={cn('grid gap-1', cols)}>
        {segments.map((s, i) => (
          <span
            key={s.status}
            className={cn('h-[5px] rounded-[3px]', i <= current ? 'bg-forest' : 'bg-line')}
          />
        ))}
      </div>
      <div className={cn('grid text-center text-[11px]/[14px]', cols)}>
        {segments.map((s, i) => (
          <span
            key={s.status}
            className={cn(
              i === 0 && 'text-left',
              i === segments.length - 1 && 'text-right',
              i === current ? 'font-bold text-fg' : 'font-medium text-fg-subtle',
            )}
          >
            {order.isPickup && s.status === 'DELIVERED' ? 'Picked up' : s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function paymentLine(order: OrderDetailDto) {
  switch (order.paymentStatus) {
    case 'PAID':
      return `${formatKobo(order.totalKobo)} via Paystack`;
    case 'PENDING':
      return 'Waiting for Paystack';
    case 'FAILED':
      return 'Payment didn’t go through';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return 'Not paid';
  }
}

/** 04.03 mobile order detail. */
function MobileOrderDetail({ order }: { order: OrderDetailDto }) {
  const name = customerLabel(order);
  const links = contactLinks(order);
  const cardCls = 'rounded-lg border border-line bg-surface p-3.5';
  return (
    <div className="flex flex-col pb-24 lg:hidden">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-3 pt-1.5 pb-3">
        <Link
          href="/orders"
          aria-label="Back to orders"
          className="inline-flex size-[38px] items-center justify-center"
        >
          <ChevronLeft className="size-[22px]" aria-hidden />
        </Link>
        <span className="flex flex-col items-center">
          <h1 className="text-base font-bold">{orderTitle(order)}</h1>
          <span className="text-xs text-fg-muted">{formatOrderTime(order.createdAt)}</span>
        </span>
        <span className="size-[38px]" aria-hidden />
      </header>

      <div className="flex flex-col gap-3.5 p-4">
        <div className="grid grid-cols-2 gap-2.5">
          <div className={cn(cardCls, 'flex flex-col items-start gap-[7px] rounded-lg p-3')}>
            <SectionLabel className="text-[10px]/[14px] font-bold">Payment</SectionLabel>
            <PaymentBadge status={order.paymentStatus} />
            <span className="text-xs text-fg-muted">{paymentLine(order)}</span>
          </div>
          <div className={cn(cardCls, 'flex flex-col items-start gap-[7px] rounded-lg p-3')}>
            <SectionLabel className="text-[10px]/[14px] font-bold">Fulfilment</SectionLabel>
            <FulfilmentBadge status={order.fulfilmentStatus} />
          </div>
        </div>

        {order.paymentStatus === 'FAILED' ? (
          <div className={cardCls}>
            <OrderPaymentFailed order={order} />
          </div>
        ) : SEGMENTS.some((s) => s.status === order.fulfilmentStatus) ? (
          <SegmentProgress order={order} />
        ) : null}

        <div className={cn(cardCls, 'flex flex-col gap-3')}>
          <div className="flex items-center gap-3">
            <Avatar name={name} size={40} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[15px]/[21px] font-semibold">{name}</span>
              {order.customerPhone ? (
                <span className="text-xs text-fg-muted">{order.customerPhone}</span>
              ) : null}
            </span>
            {links.tel ? (
              <>
                <a
                  href={links.tel}
                  aria-label={`Call ${name}`}
                  className="inline-flex size-[38px] items-center justify-center rounded-full bg-surface-muted"
                >
                  <Phone className="size-[17px]" aria-hidden />
                </a>
                <a
                  href={links.whatsapp}
                  aria-label={`WhatsApp ${name}`}
                  className="inline-flex size-[38px] items-center justify-center rounded-full bg-success-soft text-success"
                >
                  <MessageCircle className="size-[17px]" aria-hidden />
                </a>
              </>
            ) : null}
          </div>
          <div className="flex gap-2.5 border-t border-line pt-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px]/[19px]">{placeText(order)}</span>
              <span className="text-xs text-fg-muted">
                {order.isPickup
                  ? 'Pickup · Free'
                  : `Delivery${order.zoneName ? ` · ${order.zoneName}` : ''} · ${
                      order.deliveryFeeKobo ? formatKobo(order.deliveryFeeKobo) : 'Free'
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
          {order.items.map((item, i) => (
            <div
              key={`${item.name}-${item.variantLabel ?? ''}-${i}`}
              className="flex items-center gap-3"
            >
              <ProductThumb publicId={item.imagePublicId} name={item.name} size={44} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[13px]/[19px] font-semibold">{item.name}</span>
                <span className="text-xs text-fg-muted">
                  {item.variantLabel ? `${item.variantLabel} · ` : ''}×{item.quantity}
                </span>
              </span>
              <span className="text-[13px]/[19px] font-semibold">
                {formatKobo(item.lineTotalKobo)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-line pt-2.5">
            <span className="text-[13px]/[19px] text-fg-muted">Total incl. delivery</span>
            <span className="text-[15px]/[21px] font-bold">{formatKobo(order.totalKobo)}</span>
          </div>
        </div>
      </div>

      <OrderStatusAction
        variant="mobile"
        orderId={order.id}
        orderNumber={order.number}
        status={order.fulfilmentStatus}
        pickup={order.isPickup}
        nextStatuses={order.nextStatuses}
      />
    </div>
  );
}

/** Order detail: 04.03 on phones; on desktop the same content as a full page (03.03 panel). */
export default async function OrderDetailPage({ params }: Props) {
  const order = await load(params);
  if (!order) notFound();

  return (
    <>
      <MobileOrderDetail order={order} />
      <PageContainer className="hidden lg:flex">
        <PageHeader
          back={{ href: '/orders', label: 'Orders' }}
          title={orderTitle(order)}
          badge={
            <span className="flex items-center gap-2">
              <PaymentBadge status={order.paymentStatus} />
              <FulfilmentBadge status={order.fulfilmentStatus} />
            </span>
          }
          subtitle={placedSentence(order)}
        />
        <div className="grid items-start gap-5 xl:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-5">
            {order.paymentStatus === 'FAILED' ? (
              <Card>
                <OrderPaymentFailed order={order} />
              </Card>
            ) : null}
            <Card>
              <CardTitle className="text-[15px]/[21px] text-fg">Items</CardTitle>
              <OrderItems order={order} />
            </Card>
          </div>
          <div className="flex flex-col gap-5">
            {canAct(order) ? (
              <Card className="gap-2.5">
                <CardTitle className="text-[15px]/[21px] text-fg">Next step</CardTitle>
                <OrderStatusAction
                  orderId={order.id}
                  orderNumber={order.number}
                  status={order.fulfilmentStatus}
                  pickup={order.isPickup}
                  nextStatuses={order.nextStatuses}
                />
              </Card>
            ) : null}
            <Card>
              <CardTitle className="text-[15px]/[21px] text-fg">Progress</CardTitle>
              <OrderTimeline steps={orderSteps(order)} />
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
