import { z } from 'zod';
import { FULFILMENT_STATUSES, PAYMENT_STATUSES } from '../constants/statuses.js';
import { nigerianPhoneSchema } from './phone.js';

/* ------------------------------------------------ checkout ------------------------------------- */

export const checkoutLineSchema = z.object({
  variantId: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(99),
});

const addressSchema = z.object({
  line1: z.string().trim().min(3, 'Enter the street address').max(200),
  city: z
    .string()
    .trim()
    .max(80)
    .nullish()
    .transform((v) => v || null),
  state: z
    .string()
    .trim()
    .max(40)
    .nullish()
    .transform((v) => v || null),
  landmark: z
    .string()
    .trim()
    .max(200)
    .nullish()
    .transform((v) => v || null),
});

/**
 * Storefront checkout, sent by the web server (internal token). Prices are never taken from the
 * browser: the API re-prices every line and rejects the order if the total moved
 * (`expectedTotalKobo`), so the shopper always sees what they pay.
 */
export const checkoutInputSchema = z.object({
  lines: z.array(checkoutLineSchema).min(1, 'Your cart is empty').max(50),
  customer: z.object({
    name: z.string().trim().min(2, 'Enter your name').max(80),
    phone: nigerianPhoneSchema,
    /** Required: Paystack sends the payment receipt here, and we send the order confirmation. */
    email: z.email('Enter a valid email address').max(254),
  }),
  fulfilment: z.discriminatedUnion('type', [
    z.object({ type: z.literal('delivery'), zoneId: z.string().min(1), address: addressSchema }),
    z.object({ type: z.literal('pickup') }),
  ]),
  note: z
    .string()
    .trim()
    .max(300)
    .nullish()
    .transform((v) => v || null),
  expectedTotalKobo: z.number().int().min(0),
  /** Where Paystack returns the shopper (the storefront's origin, set by the web server). */
  returnOrigin: z.url(),
});
export type CheckoutInput = z.input<typeof checkoutInputSchema>;

export const checkoutResultSchema = z.object({
  orderNumber: z.number().int(),
  reference: z.string(),
  authorizationUrl: z.url(),
});
export type CheckoutResultDto = z.infer<typeof checkoutResultSchema>;

/** Checkout refusals the shopper can act on. */
export const CHECKOUT_ERROR_CODES = {
  cartChanged: 'CART_CHANGED',
  notAcceptingPayments: 'PAYMENTS_UNAVAILABLE',
} as const;

/* ------------------------------------------------ orders --------------------------------------- */

export const orderItemSchema = z.object({
  name: z.string(),
  variantLabel: z.string().nullable(),
  sku: z.string().nullable(),
  unitPriceKobo: z.number().int(),
  quantity: z.number().int(),
  lineTotalKobo: z.number().int(),
  imagePublicId: z.string().nullable(),
});

const deliveryAddressSchema = z.object({
  line1: z.string(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  landmark: z.string().nullable(),
});

/** What the shopper sees after paying (order confirmed / payment failed pages). */
export const storefrontOrderSchema = z.object({
  number: z.number().int(),
  reference: z.string(),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  fulfilmentStatus: z.enum(FULFILMENT_STATUSES),
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
  items: z.array(orderItemSchema),
  subtotalKobo: z.number().int(),
  deliveryFeeKobo: z.number().int(),
  totalKobo: z.number().int(),
  isPickup: z.boolean(),
  zoneName: z.string().nullable(),
  deliveryAddress: deliveryAddressSchema.nullable(),
  pickupAddress: z.string().nullable(),
  createdAt: z.string(),
});
export type StorefrontOrderDto = z.infer<typeof storefrontOrderSchema>;

/** Merchant order tabs (03.03). */
export const ORDER_TABS = [
  'ALL',
  'UNPAID',
  'TO_FULFIL',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export const orderListQuerySchema = z.object({
  tab: z.enum(ORDER_TABS).default('ALL'),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type OrderListQuery = z.input<typeof orderListQuerySchema>;

export const orderListItemSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  customerName: z.string().nullable(),
  itemCount: z.number().int(),
  totalKobo: z.number().int(),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  fulfilmentStatus: z.enum(FULFILMENT_STATUSES),
  isPickup: z.boolean(),
  createdAt: z.string(),
});
export type OrderListItemDto = z.infer<typeof orderListItemSchema>;

export const orderListSchema = z.object({
  items: z.array(orderListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  counts: z.record(z.enum(ORDER_TABS), z.number().int()),
});
export type OrderListDto = z.infer<typeof orderListSchema>;

export const orderDetailSchema = storefrontOrderSchema.extend({
  id: z.string(),
  customerPhone: z.string().nullable(),
  note: z.string().nullable(),
  payments: z.array(
    z.object({
      reference: z.string(),
      status: z.enum(PAYMENT_STATUSES),
      amountKobo: z.number().int(),
      paidAt: z.string().nullable(),
    }),
  ),
  /** Fulfilment statuses the merchant can move this order to next. */
  nextStatuses: z.array(z.enum(FULFILMENT_STATUSES)),
});
export type OrderDetailDto = z.infer<typeof orderDetailSchema>;

export const fulfilmentUpdateSchema = z.object({ status: z.enum(FULFILMENT_STATUSES) });

/* --------------------------------------------- cart pricing ------------------------------------ */

export const cartPriceInputSchema = z.object({
  lines: z.array(checkoutLineSchema).max(50),
});

/** Current price and availability of each cart line (checkout refreshes the browser's cart). */
export const cartPriceSchema = z.object({
  lines: z.array(
    z.union([
      z.object({ variantId: z.string(), status: z.literal('gone') }),
      z.object({
        variantId: z.string(),
        status: z.enum(['ok', 'sold-out', 'short']),
        slug: z.string(),
        name: z.string(),
        label: z.string(),
        priceKobo: z.number().int(),
        compareAtKobo: z.number().int().nullable(),
        publicId: z.string().nullable(),
        /** Most the shopper can buy now. */
        maxQty: z.number().int(),
      }),
    ]),
  ),
});
export type CartPriceDto = z.infer<typeof cartPriceSchema>;
