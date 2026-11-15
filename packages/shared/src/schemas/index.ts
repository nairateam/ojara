import { z } from 'zod';
import { DEFAULT_COUNTRY, DEFAULT_CURRENCY } from '../constants/currency.js';
import { isReservedSlug, STORE_SLUG_PATTERN } from '../constants/domains.js';
import { MEDIA_KINDS } from '../constants/media.js';
import { PLAN_KEYS } from '../constants/plans.js';
import { PLATFORM_ROLES, STORE_ROLES, STORE_STATUSES } from '../constants/statuses.js';

/** Consistent error body returned by the API's global exception filter. */
export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  /** Stable machine-readable reason, e.g. TWO_FACTOR_REQUIRED. */
  code: z.string().optional(),
  requestId: z.string().optional(),
  path: z.string(),
  timestamp: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

export const storeSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(STORE_SLUG_PATTERN, 'Use 3-40 lowercase letters, numbers or single hyphens')
  .refine((slug) => !isReservedSlug(slug), { message: 'This store address is reserved' });

export const createStoreSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: storeSlugSchema,
  currency: z.literal(DEFAULT_CURRENCY).default(DEFAULT_CURRENCY),
  country: z.literal(DEFAULT_COUNTRY).default(DEFAULT_COUNTRY),
  contactEmail: z.email().optional(),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,20}$/)
    .optional(),
});
export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const storeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  currency: z.string(),
  country: z.string(),
  status: z.enum(STORE_STATUSES),
  createdAt: z.string(),
});
export type StoreDto = z.infer<typeof storeSchema>;

export const storeMembershipSchema = storeSchema.extend({ role: z.enum(STORE_ROLES) });
export type StoreMembershipDto = z.infer<typeof storeMembershipSchema>;

/** Dashboard shell data for one store: GET /v1/stores/:storeId/summary. */
export const storeSummarySchema = z.object({
  store: storeSchema,
  plan: z.enum(PLAN_KEYS),
  /** Products that count towards the plan limit (not archived). */
  productCount: z.number().int().nonnegative(),
  /** Paid orders still waiting to be fulfilled (sidebar / tab bar count pill). */
  openOrders: z.number().int().nonnegative(),
});
export type StoreSummaryDto = z.infer<typeof storeSummarySchema>;

/** The signed-in user as returned by GET /v1/session. */
export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  emailVerified: z.boolean(),
  role: z.enum(PLATFORM_ROLES),
  twoFactorEnabled: z.boolean(),
});
export type SessionUserDto = z.infer<typeof sessionUserSchema>;
export const sessionResponseSchema = z.object({ user: sessionUserSchema });

export const resolveTenantQuerySchema = z.object({
  host: z.string().trim().min(1).max(253),
});

/** Public, cache-safe view of a tenant returned by GET /v1/internal/tenants/resolve. */
export const resolvedTenantSchema = z.object({
  storeId: z.string(),
  slug: z.string(),
  name: z.string(),
  status: z.enum(STORE_STATUSES),
  currency: z.string(),
  primaryColor: z.string().nullable(),
  logoPublicId: z.string().nullable(),
  hostname: z.string(),
});
export type ResolvedTenant = z.infer<typeof resolvedTenantSchema>;

export const mediaSignRequestSchema = z.object({
  kind: z.enum(MEDIA_KINDS),
  /** Required for product images so the per-product image limit can be enforced. */
  productId: z.string().optional(),
  /** Declared file size in bytes, checked against the plan limit before signing. */
  fileSize: z.number().int().positive(),
});
export type MediaSignRequest = z.infer<typeof mediaSignRequestSchema>;

export const mediaSignResponseSchema = z.object({
  cloudName: z.string(),
  apiKey: z.string(),
  timestamp: z.number().int(),
  signature: z.string(),
  folder: z.string(),
  allowedFormats: z.string(),
  maxFileSize: z.number().int(),
  uploadUrl: z.url(),
});
export type MediaSignResponse = z.infer<typeof mediaSignResponseSchema>;

export const healthSchema = z.object({
  status: z.enum(['ok', 'error']),
  checks: z.object({
    postgres: z.enum(['up', 'down']),
    redis: z.enum(['up', 'down']),
  }),
  uptimeSeconds: z.number(),
});
export type HealthDto = z.infer<typeof healthSchema>;
