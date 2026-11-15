export const STORE_STATUSES = ['DRAFT', 'PUBLISHED', 'DISABLED', 'SUSPENDED'] as const;
export type StoreStatus = (typeof STORE_STATUSES)[number];

export const STORE_ROLES = ['OWNER', 'MANAGER', 'STAFF'] as const;
export type StoreRole = (typeof STORE_ROLES)[number];

export const PLATFORM_ROLES = ['USER', 'PLATFORM_ADMIN'] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const FULFILMENT_STATUSES = [
  'PENDING',
  'PROCESSING',
  'READY_FOR_DISPATCH',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;
export type FulfilmentStatus = (typeof FULFILMENT_STATUSES)[number];

export const PAYMENT_STATUSES = ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PRODUCT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const DOMAIN_STATUSES = ['PENDING', 'VERIFIED', 'ACTIVE', 'FAILED'] as const;
export type DomainStatus = (typeof DOMAIN_STATUSES)[number];

export const SUBSCRIPTION_STATUSES = ['ACTIVE', 'PAST_DUE', 'CANCELLING', 'CANCELLED'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/** Merchant-facing labels (dashboard 03.03 Orders). */
export const FULFILMENT_LABELS: Record<FulfilmentStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  READY_FOR_DISPATCH: 'Ready for dispatch',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

/** Customer-facing labels (storefront 05.08 Track Order). */
export const CUSTOMER_FULFILMENT_LABELS: Record<FulfilmentStatus, string> = {
  PENDING: 'Order placed',
  PROCESSING: 'Being prepared',
  READY_FOR_DISPATCH: 'Being prepared',
  SHIPPED: 'On its way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Unpaid',
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

/** Admin console wording (06.02) differs from the enum; see docs/DECISIONS.md. */
export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  DRAFT: 'Onboarding',
  PUBLISHED: 'Live',
  DISABLED: 'Closed',
  SUSPENDED: 'Suspended',
};
