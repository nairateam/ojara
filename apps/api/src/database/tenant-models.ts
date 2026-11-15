/**
 * Prisma models that carry a `storeId` column. The tenant extension injects `storeId` into
 * their where/data clauses. Keep in sync with prisma/schema.prisma and the RLS migration.
 */
export const TENANT_MODELS = new Set<string>([
  'StoreMember',
  'Domain',
  'Subscription',
  'Category',
  'Product',
  'ProductVariant',
  'ProductImage',
  'Customer',
  'Order',
  'OrderItem',
  'Payment',
  'DeliveryZone',
  'AuditLog',
]);

/** Protected by RLS (on `id`) but not storeId-scoped by the extension. */
export const TENANT_ROOT_MODELS = new Set<string>(['Store']);

/** Platform-global models: no tenant context needed. */
export const GLOBAL_MODELS = new Set<string>([
  'User',
  'Session',
  'Account',
  'Verification',
  'TwoFactor',
  'RateLimit',
  'Plan',
  'WebhookEvent',
]);
