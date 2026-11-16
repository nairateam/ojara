import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  CHECKOUT_ERROR_CODES,
  type checkoutInputSchema,
  type CartPriceDto,
  type CheckoutResultDto,
  PLANS,
  type StorefrontOrderDto,
  variantLabel,
} from '@ojara/shared';
import type { z } from 'zod';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PaystackClient } from '../payments/paystack.client.js';
import { variantAvailable, variantPrice } from '../storefront/storefront-pricing.js';
import { TenantContext } from '../tenancy/tenant-context.js';
import type { DeliveryAddressSnapshot } from './order-format.js';
import { PaymentConfirmationService } from './payment-confirmation.service.js';

type CheckoutInput = z.output<typeof checkoutInputSchema>;
type Tx = Prisma.TransactionClient;

/** Pending payments older than this are re-checked with Paystack when the shopper looks. */
const RECONCILE_AFTER_MS = 5_000;

function cartChanged(message: string): never {
  throw new ConflictException({ message, code: CHECKOUT_ERROR_CODES.cartChanged });
}

/**
 * Storefront checkout (internal token, called by the web server for a shopper). Prices, stock
 * and delivery are worked out here from the catalogue, never taken from the browser. Payment
 * goes to the merchant's Paystack subaccount; stores without one can't take online payments.
 */
@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackClient,
    private readonly confirmation: PaymentConfirmationService,
  ) {}

  async checkout(storeId: string, input: CheckoutInput): Promise<CheckoutResultDto> {
    const order = await TenantContext.runForStore(storeId, () =>
      this.prisma.tenantTransaction((tx) => this.createOrder(tx, storeId, input)),
    );

    try {
      const started = await this.paystack.initializeTransaction({
        email: input.customer.email,
        amountKobo: order.totalKobo,
        reference: order.reference,
        callbackUrl: `${input.returnOrigin}/checkout/confirmed?reference=${encodeURIComponent(order.reference)}`,
        subaccount: order.subaccountCode,
        metadata: { storeId, orderId: order.id, orderNumber: order.number },
      });
      return {
        orderNumber: order.number,
        reference: order.reference,
        authorizationUrl: started.authorizationUrl,
      };
    } catch (err) {
      this.logger.error(`Paystack initialize failed for ${order.reference}: ${String(err)}`);
      await TenantContext.runForStore(storeId, () =>
        this.prisma.tenantTransaction(async (tx) => {
          await tx.payment.updateMany({
            where: { storeId, reference: order.reference },
            data: { status: 'FAILED' },
          });
          await tx.order.updateMany({
            where: { storeId, id: order.id },
            data: { paymentStatus: 'FAILED' },
          });
        }),
      );
      throw new ServiceUnavailableException(
        'We couldn’t start the payment. Please try again in a moment.',
      );
    }
  }

  private async createOrder(tx: Tx, storeId: string, input: CheckoutInput) {
    const store = await tx.store.findUnique({
      where: { id: storeId },
      select: {
        status: true,
        paystackSubaccountCode: true,
        deliveryEnabled: true,
        freeDeliveryOverKobo: true,
        pickupEnabled: true,
        pickupAddress: true,
        plan: { select: { key: true } },
      },
    });
    if (!store || store.status !== 'PUBLISHED') throw new NotFoundException('Store not found');
    if (!store.paystackSubaccountCode) {
      throw new ConflictException({
        message: 'This store isn’t taking online payments yet. Please contact the store to order.',
        code: CHECKOUT_ERROR_CODES.notAcceptingPayments,
      });
    }
    const promotions = PLANS[store.plan.key].limits.promotions;

    const { lines, problems } = await this.priceLines(tx, storeId, input.lines, promotions);
    if (problems.length) cartChanged(problems.join(' '));

    const subtotalKobo = lines.reduce((n, l) => n + l.lineTotalKobo, 0);
    let deliveryFeeKobo = 0;
    let deliveryZoneId: string | null = null;
    let deliveryAddress: DeliveryAddressSnapshot | null = null;
    if (input.fulfilment.type === 'delivery') {
      const zone = store.deliveryEnabled
        ? await tx.deliveryZone.findFirst({
            where: {
              id: input.fulfilment.zoneId,
              storeId,
              isActive: true,
              archivedAt: null,
            },
            select: { id: true, feeKobo: true },
          })
        : null;
      if (!zone) cartChanged('That delivery option isn’t available any more. Please choose again.');
      const free =
        store.freeDeliveryOverKobo !== null && subtotalKobo >= store.freeDeliveryOverKobo;
      deliveryFeeKobo = free ? 0 : zone.feeKobo;
      deliveryZoneId = zone.id;
      deliveryAddress = input.fulfilment.address;
    } else if (!store.pickupEnabled || !store.pickupAddress) {
      throw new BadRequestException('This store doesn’t offer pickup.');
    }

    const totalKobo = subtotalKobo + deliveryFeeKobo;
    if (totalKobo !== input.expectedTotalKobo) {
      cartChanged(
        'Prices or delivery charges have changed. Please check your order and try again.',
      );
    }

    const customerId = await this.upsertCustomer(tx, storeId, input.customer);
    const { lastOrderNumber: number } = await tx.store.update({
      where: { id: storeId },
      data: { lastOrderNumber: { increment: 1 } },
      select: { lastOrderNumber: true },
    });
    const reference = `ojr_${randomBytes(10).toString('hex')}`;

    const order = await tx.order.create({
      data: {
        storeId,
        customerId,
        number,
        paymentStatus: 'PENDING',
        subtotalKobo,
        deliveryFeeKobo,
        totalKobo,
        deliveryAddress: deliveryAddress ?? undefined,
        deliveryZoneId,
        isPickup: input.fulfilment.type === 'pickup',
        notes: input.note,
        customerName: input.customer.name,
        customerPhone: input.customer.phone,
        customerEmail: input.customer.email,
      },
      select: { id: true },
    });
    await tx.orderItem.createMany({
      data: lines.map((l) => ({ ...l, storeId, orderId: order.id })),
    });
    await tx.payment.create({
      data: { storeId, orderId: order.id, reference, amountKobo: totalKobo, status: 'PENDING' },
    });
    return {
      id: order.id,
      number,
      reference,
      totalKobo,
      subaccountCode: store.paystackSubaccountCode,
    };
  }

  /**
   * Prices requested lines from the catalogue (published products, active variants), merging
   * repeats of the same variant. `problems` lists anything that can't be bought as asked.
   */
  private async priceLines(
    tx: Tx,
    storeId: string,
    requested: { variantId: string; qty: number }[],
    promotions: boolean,
  ) {
    const wanted = new Map<string, number>();
    for (const l of requested) wanted.set(l.variantId, (wanted.get(l.variantId) ?? 0) + l.qty);

    const variants = await tx.productVariant.findMany({
      where: {
        storeId,
        id: { in: [...wanted.keys()] },
        isActive: true,
        product: { status: 'PUBLISHED' },
      },
      select: {
        id: true,
        sku: true,
        options: true,
        priceKobo: true,
        stockQuantity: true,
        isActive: true,
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            basePriceKobo: true,
            promoPriceKobo: true,
            trackStock: true,
            sellWhenSoldOut: true,
            lowStockThreshold: true,
            options: true,
            images: {
              select: { cloudinaryPublicId: true },
              orderBy: { position: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    const problems: string[] = [];
    const checked = [...wanted.entries()].map(([variantId, qty]) => {
      const v = variants.find((x) => x.id === variantId);
      if (!v) {
        problems.push('An item in your cart is no longer available.');
        return { variantId, qty, v: null, status: 'gone' as const };
      }
      const p = v.product;
      const label = variantLabel(
        v.options as Record<string, string>,
        p.options as { name: string }[],
      );
      const display = label ? `${p.name} (${label})` : p.name;
      const maxQty =
        p.trackStock && !p.sellWhenSoldOut ? Math.max(0, Math.min(99, v.stockQuantity)) : 99;
      const price = variantPrice(p, v, promotions);
      const base = { variantId, qty, v, label, price, maxQty };
      if (!variantAvailable(p, v)) {
        problems.push(`${display} is sold out.`);
        return { ...base, status: 'sold-out' as const };
      }
      if (qty > maxQty) {
        problems.push(`Only ${maxQty} of ${display} left.`);
        return { ...base, status: 'short' as const };
      }
      return { ...base, status: 'ok' as const };
    });

    const lines = checked.flatMap((c) =>
      c.status === 'ok' && c.v
        ? [
            {
              productId: c.v.product.id,
              variantId: c.v.id,
              name: c.v.product.name,
              sku: c.v.sku,
              variantLabel: c.label || null,
              unitPriceKobo: c.price.priceKobo,
              quantity: c.qty,
              lineTotalKobo: c.price.priceKobo * c.qty,
              imagePublicId: c.v.product.images[0]?.cloudinaryPublicId ?? null,
            },
          ]
        : [],
    );
    return { lines, problems, checked };
  }

  /**
   * Current price and availability for the shopper's cart (checkout page), so the cart saved in
   * the browser is refreshed before paying.
   */
  async priceCart(
    storeId: string,
    requested: { variantId: string; qty: number }[],
  ): Promise<CartPriceDto> {
    return TenantContext.runForStore(storeId, () =>
      this.prisma.tenantTransaction(async (tx) => {
        const store = await tx.store.findUnique({
          where: { id: storeId },
          select: { status: true, plan: { select: { key: true } } },
        });
        if (!store || store.status !== 'PUBLISHED') throw new NotFoundException('Store not found');
        const { checked } = await this.priceLines(
          tx,
          storeId,
          requested,
          PLANS[store.plan.key].limits.promotions,
        );
        return {
          lines: checked.map((c) =>
            c.v
              ? {
                  variantId: c.variantId,
                  status: c.status,
                  slug: c.v.product.slug,
                  name: c.v.product.name,
                  label: c.label,
                  priceKobo: c.price.priceKobo,
                  compareAtKobo: c.price.compareAtKobo,
                  publicId: c.v.product.images[0]?.cloudinaryPublicId ?? null,
                  maxQty: c.maxQty,
                }
              : { variantId: c.variantId, status: c.status },
          ),
        };
      }),
    );
  }

  /** Customers are matched by phone (then email) within the store. */
  private async upsertCustomer(
    tx: Tx,
    storeId: string,
    c: CheckoutInput['customer'],
  ): Promise<string> {
    const existing =
      (await tx.customer.findFirst({ where: { storeId, phone: c.phone }, select: { id: true } })) ??
      (await tx.customer.findFirst({ where: { storeId, email: c.email }, select: { id: true } }));
    if (existing) {
      const emailOwner = await tx.customer.findFirst({
        where: { storeId, email: c.email, id: { not: existing.id } },
        select: { id: true },
      });
      await tx.customer.update({
        where: { id: existing.id },
        data: { name: c.name, ...(emailOwner ? {} : { email: c.email }) },
      });
      return existing.id;
    }
    const created = await tx.customer.create({
      data: { storeId, name: c.name, phone: c.phone, email: c.email },
      select: { id: true },
    });
    return created.id;
  }

  /**
   * The order behind a payment reference, for the confirmed / failed pages. A payment still
   * pending a few seconds after checkout is re-checked with Paystack (in case the webhook is late).
   */
  async getOrder(storeId: string, reference: string): Promise<StorefrontOrderDto> {
    const load = () =>
      TenantContext.runForStore(storeId, () =>
        this.prisma.tenantTransaction((tx) =>
          tx.payment.findFirst({
            where: { storeId, reference },
            select: {
              status: true,
              createdAt: true,
              order: {
                include: {
                  items: true,
                  deliveryZone: { select: { name: true } },
                  store: { select: { pickupAddress: true } },
                },
              },
            },
          }),
        ),
      );
    let payment = await load();
    if (!payment) throw new NotFoundException('Order not found');
    if (
      payment.status === 'PENDING' &&
      Date.now() - payment.createdAt.getTime() > RECONCILE_AFTER_MS
    ) {
      await this.confirmation.reconcile(reference);
      payment = (await load()) ?? payment;
    }
    const o = payment.order;
    return {
      number: o.number,
      reference,
      paymentStatus: o.paymentStatus,
      fulfilmentStatus: o.fulfilmentStatus,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
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
    };
  }
}
