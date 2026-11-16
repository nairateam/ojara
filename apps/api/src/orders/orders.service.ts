import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  FulfilmentStatus,
  OrderDetailDto,
  OrderListDto,
  OrderTab,
  PaymentStatus,
  orderListQuerySchema,
} from '@ojara/shared';
import type { z } from 'zod';
import type { DeliveryAddressSnapshot } from '../checkout/order-format.js';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';

type ListQuery = z.output<typeof orderListQuerySchema>;

const OPEN: FulfilmentStatus[] = ['PENDING', 'PROCESSING', 'READY_FOR_DISPATCH'];
const NOT_PAID: PaymentStatus[] = ['UNPAID', 'PENDING', 'FAILED'];

/** Which orders each 03.03 tab shows. */
const TAB_WHERE: Record<OrderTab, Prisma.OrderWhereInput> = {
  ALL: {},
  UNPAID: { paymentStatus: { in: NOT_PAID }, fulfilmentStatus: { not: 'CANCELLED' } },
  TO_FULFIL: { paymentStatus: 'PAID', fulfilmentStatus: { in: OPEN } },
  SHIPPED: { fulfilmentStatus: 'SHIPPED' },
  COMPLETED: { fulfilmentStatus: 'DELIVERED' },
  CANCELLED: { fulfilmentStatus: { in: ['CANCELLED', 'REFUNDED'] } },
};

/**
 * Where an order can go next. Fulfilment only moves forward; cancelling is possible until it's
 * shipped. Unpaid orders can only be cancelled (refunds come with the refunds feature).
 */
export function nextStatuses(
  payment: PaymentStatus,
  fulfilment: FulfilmentStatus,
): FulfilmentStatus[] {
  if (payment !== 'PAID') return fulfilment === 'CANCELLED' ? [] : ['CANCELLED'];
  switch (fulfilment) {
    case 'PENDING':
      return ['PROCESSING', 'READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    case 'PROCESSING':
      return ['READY_FOR_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    case 'READY_FOR_DISPATCH':
      return ['SHIPPED', 'DELIVERED', 'CANCELLED'];
    case 'SHIPPED':
      return ['DELIVERED'];
    default:
      return [];
  }
}

/** Merchant orders (03.03 / 04.02 list, 04.03 detail). Runs in the store's tenant context. */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(storeId: string, query: ListQuery): Promise<OrderListDto> {
    const q = query.q?.trim();
    const search: Prisma.OrderWhereInput = q
      ? {
          OR: [
            ...(/^#?\d+$/.test(q) ? [{ number: Number(q.replace('#', '')) }] : []),
            { customerName: { contains: q, mode: 'insensitive' } },
            { customerPhone: { contains: q.replace(/\s/g, '') } },
          ],
        }
      : {};
    const where: Prisma.OrderWhereInput = { storeId, ...TAB_WHERE[query.tab], ...search };

    return this.prisma.tenantTransaction(async (tx) => {
      const total = await tx.order.count({ where });
      const rows = await tx.order.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { number: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          number: true,
          customerName: true,
          totalKobo: true,
          paymentStatus: true,
          fulfilmentStatus: true,
          isPickup: true,
          createdAt: true,
          items: { select: { quantity: true } },
        },
      });
      const counts = {} as Record<OrderTab, number>;
      for (const tab of Object.keys(TAB_WHERE) as OrderTab[]) {
        counts[tab] = await tx.order.count({ where: { storeId, ...TAB_WHERE[tab] } });
      }
      return {
        items: rows.map(({ items, createdAt, ...o }) => ({
          ...o,
          itemCount: items.reduce((n, i) => n + i.quantity, 0),
          createdAt: createdAt.toISOString(),
        })),
        total,
        page: query.page,
        pageSize: query.pageSize,
        counts,
      };
    });
  }

  async get(storeId: string, orderId: string): Promise<OrderDetailDto> {
    const o = await this.prisma.tenantTransaction((tx) =>
      tx.order.findFirst({
        where: { id: orderId, storeId },
        include: {
          items: true,
          deliveryZone: { select: { name: true } },
          store: { select: { pickupAddress: true } },
          payments: { orderBy: { createdAt: 'asc' } },
        },
      }),
    );
    if (!o) throw new NotFoundException('Order not found');
    const latestRef = o.payments.at(-1)?.reference ?? '';
    return {
      id: o.id,
      number: o.number,
      reference: latestRef,
      paymentStatus: o.paymentStatus,
      fulfilmentStatus: o.fulfilmentStatus,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      note: o.notes,
      items: o.items.map((i) => ({
        name: i.name,
        variantLabel: i.variantLabel,
        sku: i.sku,
        unitPriceKobo: i.unitPriceKobo,
        quantity: i.quantity,
        lineTotalKobo: i.lineTotalKobo,
        imagePublicId: i.imagePublicId,
      })),
      subtotalKobo: o.subtotalKobo,
      deliveryFeeKobo: o.deliveryFeeKobo,
      totalKobo: o.totalKobo,
      isPickup: o.isPickup,
      zoneName: o.deliveryZone?.name ?? null,
      deliveryAddress: (o.deliveryAddress as DeliveryAddressSnapshot | null) ?? null,
      pickupAddress: o.isPickup ? o.store.pickupAddress : null,
      createdAt: o.createdAt.toISOString(),
      payments: o.payments.map((p) => ({
        reference: p.reference,
        status: p.status,
        amountKobo: p.amountKobo,
        paidAt: p.paidAt?.toISOString() ?? null,
      })),
      nextStatuses: nextStatuses(o.paymentStatus, o.fulfilmentStatus),
    };
  }

  async updateFulfilment(
    storeId: string,
    actorId: string,
    orderId: string,
    status: FulfilmentStatus,
  ): Promise<OrderDetailDto> {
    await this.prisma.tenantTransaction(async (tx) => {
      const o = await tx.order.findFirst({
        where: { id: orderId, storeId },
        select: { paymentStatus: true, fulfilmentStatus: true },
      });
      if (!o) throw new NotFoundException('Order not found');
      if (!nextStatuses(o.paymentStatus, o.fulfilmentStatus).includes(status)) {
        throw new BadRequestException('That status change isn’t possible for this order.');
      }
      await tx.order.update({ where: { id: orderId }, data: { fulfilmentStatus: status } });
      await tx.auditLog.create({
        data: {
          storeId,
          actorId,
          action: 'order.fulfilment',
          entity: 'Order',
          entityId: orderId,
          metadata: { from: o.fulfilmentStatus, to: status },
        },
      });
    });
    return this.get(storeId, orderId);
  }
}
