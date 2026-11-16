import { Injectable, Logger } from '@nestjs/common';
import { formatKobo } from '@ojara/shared';
import { AppConfigService } from '../config/app-config.service.js';
import { PrismaService } from '../database/prisma.service.js';
import { EmailProducer } from '../email/email.producer.js';
import { PaystackClient } from '../payments/paystack.client.js';
import { TenantContext } from '../tenancy/tenant-context.js';
import { fulfilmentText, orderEmailLines } from './order-format.js';

/** What a payment provider says happened (webhook payload or verify call). */
export interface ObservedPayment {
  status: 'success' | 'failed' | 'abandoned' | 'ongoing' | 'pending' | 'reversed';
  amountKobo: number;
  currency: string;
  paidAt: string | null;
  raw: unknown;
}

export type ConfirmOutcome =
  'paid' | 'already-paid' | 'failed' | 'pending' | 'mismatch' | 'unknown';

/**
 * Turns a provider observation into order state. Used by the Paystack webhook (the source of
 * truth) and by reconciliation (verify calls for payments whose webhook hasn't arrived).
 * Idempotent: a payment is only marked paid once, so stock and emails happen once.
 */
@Injectable()
export class PaymentConfirmationService {
  private readonly logger = new Logger(PaymentConfirmationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackClient,
    private readonly email: EmailProducer,
    private readonly config: AppConfigService,
  ) {}

  async confirm(reference: string, observed: ObservedPayment): Promise<ConfirmOutcome> {
    // The store isn't known until the payment is found, so this lookup runs as the system.
    const payment = await TenantContext.runAsSystem('payment-confirm-lookup', () =>
      this.prisma.db.payment.findUnique({
        where: { reference },
        select: { storeId: true },
      }),
    );
    if (!payment) {
      this.logger.warn(`Payment ${reference} not found; ignoring ${observed.status}`);
      return 'unknown';
    }

    const outcome = await TenantContext.runForStore(payment.storeId, () =>
      this.prisma.tenantTransaction(async (tx) => {
        const p = await tx.payment.findUniqueOrThrow({
          where: { reference },
          select: { id: true, status: true, amountKobo: true, orderId: true },
        });
        if (p.status === 'PAID') return 'already-paid' as const;

        if (observed.status === 'success') {
          // Never trust the amount alone: it must match what we asked for, in naira.
          if (observed.amountKobo !== p.amountKobo || observed.currency !== 'NGN') {
            this.logger.error(
              `Payment ${reference} amount/currency mismatch: expected ${p.amountKobo} NGN, got ${observed.amountKobo} ${observed.currency}`,
            );
            await tx.payment.update({
              where: { id: p.id },
              data: { rawPayload: observed.raw as object },
            });
            return 'mismatch' as const;
          }
          await tx.payment.update({
            where: { id: p.id },
            data: {
              status: 'PAID',
              paidAt: observed.paidAt ? new Date(observed.paidAt) : new Date(),
              rawPayload: observed.raw as object,
            },
          });
          await tx.order.update({ where: { id: p.orderId }, data: { paymentStatus: 'PAID' } });

          // Take the stock now that the sale is real (only for products that track stock).
          const items = await tx.orderItem.findMany({
            where: { orderId: p.orderId, storeId: payment.storeId },
            select: { variantId: true, productId: true, quantity: true },
          });
          for (const item of items) {
            if (!item.variantId || !item.productId) continue;
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { trackStock: true },
            });
            if (!product?.trackStock) continue;
            await tx.productVariant.updateMany({
              where: { id: item.variantId, storeId: payment.storeId },
              data: { stockQuantity: { decrement: item.quantity } },
            });
          }
          await tx.auditLog.create({
            data: {
              storeId: payment.storeId,
              action: 'order.paid',
              entity: 'Order',
              entityId: p.orderId,
              metadata: { reference },
            },
          });
          return 'paid' as const;
        }

        if (['failed', 'abandoned', 'reversed'].includes(observed.status)) {
          await tx.payment.update({
            where: { id: p.id },
            data: { status: 'FAILED', rawPayload: observed.raw as object },
          });
          await tx.order.update({ where: { id: p.orderId }, data: { paymentStatus: 'FAILED' } });
          return 'failed' as const;
        }
        return 'pending' as const;
      }),
    );

    if (outcome === 'paid') await this.sendPaidEmails(payment.storeId, reference);
    return outcome;
  }

  /** Asks Paystack about a payment still marked pending (webhook late or lost). */
  async reconcile(reference: string): Promise<ConfirmOutcome> {
    try {
      const v = await this.paystack.verifyTransaction(reference);
      return await this.confirm(reference, v);
    } catch (err) {
      this.logger.warn(`Could not verify ${reference}: ${String(err)}`);
      return 'pending';
    }
  }

  /** Order confirmation to the shopper and "new order" to the store owner (queued, idempotent). */
  private async sendPaidEmails(storeId: string, reference: string): Promise<void> {
    const data = await TenantContext.runForStore(storeId, () =>
      this.prisma.tenantTransaction(async (tx) => {
        const order = await tx.order.findFirstOrThrow({
          where: { storeId, payments: { some: { reference } } },
          include: {
            items: true,
            deliveryZone: { select: { name: true, eta: true } },
            store: {
              select: {
                name: true,
                whatsappNumber: true,
                contactEmail: true,
                pickupAddress: true,
                orderConfirmationNote: true,
              },
            },
          },
        });
        const owner = await tx.storeMember.findFirst({
          where: { storeId, role: 'OWNER' },
          select: { userId: true },
        });
        return { order, ownerId: owner?.userId ?? null };
      }),
    );
    const { order } = data;
    const ownerEmail = data.ownerId
      ? (
          await this.prisma.db.user.findUnique({
            where: { id: data.ownerId },
            select: { email: true },
          })
        )?.email
      : undefined;

    const number = `#${order.number}`;
    const lines = orderEmailLines(order.items);
    const totals = {
      subtotalFormatted: formatKobo(order.subtotalKobo),
      deliveryFormatted: order.isPickup
        ? 'Pickup (free)'
        : order.deliveryFeeKobo === 0
          ? 'Free'
          : formatKobo(order.deliveryFeeKobo),
      totalFormatted: formatKobo(order.totalKobo),
    };
    const fulfilment = fulfilmentText(order);

    if (order.customerEmail) {
      await this.email.enqueue({
        template: 'order-confirmation',
        to: order.customerEmail,
        subject: `Your ${order.store.name} order ${number} is confirmed`,
        idempotencyKey: `order-confirmation:${order.id}`,
        props: {
          storeName: order.store.name,
          customerName: order.customerName?.split(' ')[0] ?? 'there',
          orderNumber: number,
          lines,
          ...totals,
          fulfilment,
          storeNote: order.store.orderConfirmationNote,
          storeContact: order.store.whatsappNumber
            ? `WhatsApp ${order.store.whatsappNumber}`
            : order.store.contactEmail,
        },
      });
    }
    if (ownerEmail) {
      await this.email.enqueue({
        template: 'new-order',
        to: ownerEmail,
        subject: `New order ${number}: ${totals.totalFormatted}`,
        idempotencyKey: `new-order:${order.id}`,
        props: {
          storeName: order.store.name,
          orderNumber: number,
          customerName: order.customerName ?? 'A customer',
          customerPhone: order.customerPhone,
          lines,
          ...totals,
          fulfilment,
          orderUrl: `${this.config.env.DASHBOARD_URL}/orders/${order.id}`,
        },
      });
    }
  }
}
