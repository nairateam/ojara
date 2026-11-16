import { ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { AppConfigService } from '../config/app-config.service.js';
import type { PrismaService } from '../database/prisma.service.js';
import type { EmailProducer } from '../email/email.producer.js';
import type { PaystackClient } from '../payments/paystack.client.js';
import { CheckoutService } from './checkout.service.js';
import { PaymentConfirmationService } from './payment-confirmation.service.js';

const product = {
  id: 'p1',
  name: 'Adire Shirt',
  basePriceKobo: 2_000_000,
  promoPriceKobo: 1_500_000,
  trackStock: true,
  sellWhenSoldOut: false,
  lowStockThreshold: 3,
  options: [{ name: 'Size', values: ['M'] }],
  images: [{ cloudinaryPublicId: 'ojara/test/s1/product/a' }],
};
const variant = (over: Record<string, unknown> = {}) => ({
  id: 'v1',
  sku: 'SH-M',
  options: { Size: 'M' },
  priceKobo: null,
  stockQuantity: 5,
  isActive: true,
  product,
  ...over,
});

function setupCheckout(
  opts: {
    plan?: string;
    subaccount?: string | null;
    variants?: unknown[];
    zone?: unknown;
    freeOver?: number | null;
    initFails?: boolean;
  } = {},
) {
  const tx = {
    store: {
      findUnique: vi.fn().mockResolvedValue({
        status: 'PUBLISHED',
        paystackSubaccountCode: opts.subaccount === undefined ? 'ACCT_1' : opts.subaccount,
        deliveryEnabled: true,
        freeDeliveryOverKobo: opts.freeOver ?? null,
        pickupEnabled: true,
        pickupAddress: '12 Market Road',
        plan: { key: opts.plan ?? 'FREE' },
      }),
      update: vi.fn().mockResolvedValue({ lastOrderNumber: 1001 }),
    },
    productVariant: { findMany: vi.fn().mockResolvedValue(opts.variants ?? [variant()]) },
    deliveryZone: {
      findFirst: vi
        .fn()
        .mockResolvedValue(opts.zone === undefined ? { id: 'z1', feeKobo: 200_000 } : opts.zone),
    },
    customer: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'c1' }),
      update: vi.fn(),
    },
    order: { create: vi.fn().mockResolvedValue({ id: 'o1' }), updateMany: vi.fn() },
    orderItem: { createMany: vi.fn() },
    payment: { create: vi.fn(), updateMany: vi.fn() },
  };
  const prisma = {
    tenantTransaction: vi.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaService;
  const paystack = {
    initializeTransaction: vi.fn(() =>
      opts.initFails
        ? Promise.reject(new Error('down'))
        : Promise.resolve({
            authorizationUrl: 'https://checkout.paystack.com/x',
            accessCode: 'a',
            reference: 'r',
          }),
    ),
  };
  const service = new CheckoutService(prisma, paystack as unknown as PaystackClient, {} as never);
  return { service, tx, paystack };
}

const input = (over: Record<string, unknown> = {}) => ({
  lines: [{ variantId: 'v1', qty: 2 }],
  customer: { name: 'Tolu', phone: '+2348035550144', email: 'tolu@example.com' },
  fulfilment: {
    type: 'delivery' as const,
    zoneId: 'z1',
    address: { line1: '1 Yaba Road', city: 'Lagos', state: 'Lagos', landmark: null },
  },
  note: null,
  expectedTotalKobo: 4_200_000,
  returnOrigin: 'http://demo.ojara.localhost:3001',
  ...over,
});

describe('CheckoutService', () => {
  it('prices from the catalogue (no sale price on Free), adds delivery and starts a split payment', async () => {
    const { service, tx, paystack } = setupCheckout();
    const result = await service.checkout('s1', input());
    expect(result).toMatchObject({
      orderNumber: 1001,
      authorizationUrl: 'https://checkout.paystack.com/x',
    });
    expect(tx.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        number: 1001,
        subtotalKobo: 4_000_000,
        deliveryFeeKobo: 200_000,
        totalKobo: 4_200_000,
        paymentStatus: 'PENDING',
        customerEmail: 'tolu@example.com',
      }),
      select: { id: true },
    });
    expect(tx.orderItem.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          variantId: 'v1',
          variantLabel: 'M',
          unitPriceKobo: 2_000_000,
          quantity: 2,
          lineTotalKobo: 4_000_000,
          imagePublicId: 'ojara/test/s1/product/a',
        }),
      ],
    });
    expect(paystack.initializeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amountKobo: 4_200_000,
        subaccount: 'ACCT_1',
        email: 'tolu@example.com',
        callbackUrl: expect.stringContaining(
          'http://demo.ojara.localhost:3001/checkout/confirmed?reference=ojr_',
        ),
      }),
    );
  });

  it('applies the sale price on Starter and free delivery over the threshold', async () => {
    const { service, tx } = setupCheckout({ plan: 'STARTER', freeOver: 3_000_000 });
    await service.checkout('s1', input({ expectedTotalKobo: 3_000_000 }));
    expect(tx.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ subtotalKobo: 3_000_000, deliveryFeeKobo: 0 }),
      }),
    );
  });

  it.each([
    ['no payout account', { subaccount: null }, {}, 'PAYMENTS_UNAVAILABLE'],
    ['a removed product', { variants: [] }, {}, 'CART_CHANGED'],
    ['not enough stock', { variants: [variant({ stockQuantity: 1 })] }, {}, 'CART_CHANGED'],
    ['a sold-out variant', { variants: [variant({ stockQuantity: 0 })] }, {}, 'CART_CHANGED'],
    ['a changed total', {}, { expectedTotalKobo: 100 }, 'CART_CHANGED'],
    ['a closed delivery zone', { zone: null }, {}, 'CART_CHANGED'],
  ])('refuses %s without creating an order', async (_l, opts, over, code) => {
    const { service, tx, paystack } = setupCheckout(opts);
    const err = await service.checkout('s1', input(over)).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ConflictException);
    expect((err as ConflictException).getResponse()).toMatchObject({ code });
    expect(tx.order.create).not.toHaveBeenCalled();
    expect(paystack.initializeTransaction).not.toHaveBeenCalled();
  });

  it('marks the order failed if Paystack can’t start the payment', async () => {
    const { service, tx } = setupCheckout({ initFails: true });
    await expect(service.checkout('s1', input())).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(tx.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'FAILED' } }),
    );
  });
});

function setupConfirm(status = 'PENDING') {
  const tx = {
    payment: {
      findUniqueOrThrow: vi
        .fn()
        .mockResolvedValue({ id: 'pay1', status, amountKobo: 4_200_000, orderId: 'o1' }),
      update: vi.fn(),
    },
    order: { update: vi.fn() },
    orderItem: {
      findMany: vi.fn().mockResolvedValue([{ variantId: 'v1', productId: 'p1', quantity: 2 }]),
    },
    product: { findUnique: vi.fn().mockResolvedValue({ trackStock: true }) },
    productVariant: { updateMany: vi.fn() },
    auditLog: { create: vi.fn() },
  };
  const prisma = {
    db: { payment: { findUnique: vi.fn().mockResolvedValue({ storeId: 's1' }) } },
    tenantTransaction: vi.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaService;
  const service = new PaymentConfirmationService(
    prisma,
    {} as PaystackClient,
    { enqueue: vi.fn() } as unknown as EmailProducer,
    { env: { DASHBOARD_URL: 'http://app' } } as AppConfigService,
  );
  // Email sending is covered elsewhere; keep these tests on payment state.
  vi.spyOn(
    service as unknown as { sendPaidEmails: () => Promise<void> },
    'sendPaidEmails',
  ).mockResolvedValue(undefined);
  return { service, tx };
}

const observed = (over: Record<string, unknown> = {}) => ({
  status: 'success' as const,
  amountKobo: 4_200_000,
  currency: 'NGN',
  paidAt: '2026-11-17T10:00:00Z',
  raw: {},
  ...over,
});

describe('PaymentConfirmationService', () => {
  it('marks the payment and order paid and takes the stock', async () => {
    const { service, tx } = setupConfirm();
    await expect(service.confirm('ref', observed())).resolves.toBe('paid');
    expect(tx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'PAID' }) }),
    );
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { paymentStatus: 'PAID' },
    });
    expect(tx.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: 'v1', storeId: 's1' },
      data: { stockQuantity: { decrement: 2 } },
    });
  });

  it('does nothing the second time (webhook retries, verify after webhook)', async () => {
    const { service, tx } = setupConfirm('PAID');
    await expect(service.confirm('ref', observed())).resolves.toBe('already-paid');
    expect(tx.productVariant.updateMany).not.toHaveBeenCalled();
  });

  it('refuses an amount or currency that doesn’t match', async () => {
    for (const over of [{ amountKobo: 100 }, { currency: 'USD' }]) {
      const { service, tx } = setupConfirm();
      await expect(service.confirm('ref', observed(over))).resolves.toBe('mismatch');
      expect(tx.order.update).not.toHaveBeenCalled();
      expect(tx.productVariant.updateMany).not.toHaveBeenCalled();
    }
  });

  it('records failed payments', async () => {
    const { service, tx } = setupConfirm();
    await expect(service.confirm('ref', observed({ status: 'failed' }))).resolves.toBe('failed');
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'o1' },
      data: { paymentStatus: 'FAILED' },
    });
  });
});
