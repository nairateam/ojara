import { z } from 'zod';
import { DEFAULT_COUNTRY, DEFAULT_CURRENCY } from '../constants/currency.js';
import { isReservedSlug, STORE_SLUG_PATTERN } from '../constants/domains.js';
import { MEDIA_KINDS } from '../constants/media.js';
import {
  NIGERIAN_STATES,
  ONBOARDING_STEP_COUNT,
  STORE_CATEGORY_IDS,
} from '../constants/onboarding.js';
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

/**
 * Nigerian mobile number in any common form ("0803 555 0144", "803 555 0144", "+234 803…"),
 * normalised to E.164: "+2348035550144".
 */
export const nigerianPhoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    let digits = value.replace(/[\s()-]/g, '').replace(/^\+/, '');
    if (!/^\d+$/.test(digits)) digits = '';
    if (digits.startsWith('234')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (!/^[789]\d{9}$/.test(digits)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a Nigerian mobile number, e.g. 803 555 0144',
      });
      return z.NEVER;
    }
    return `+234${digits}`;
  });

/** Instagram username without the "@"; blank becomes null. */
export const instagramHandleSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/^@/, ''))
  .pipe(
    z
      .string()
      .regex(/^[A-Za-z0-9._]{0,30}$/, 'Use letters, numbers, dots and underscores (max 30)'),
  )
  .transform((v) => (v === '' ? null : v));

export const brandColourSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a colour like #2A3A7C')
  .transform((v) => v.toUpperCase());

const storeNameSchema = z
  .string()
  .trim()
  .min(2, 'Use at least 2 characters')
  .max(80, 'Use at most 80 characters');

export const createStoreSchema = z.object({
  name: storeNameSchema,
  /** Generated from the name (made unique) when omitted. */
  slug: storeSlugSchema.optional(),
  currency: z.literal(DEFAULT_CURRENCY).default(DEFAULT_CURRENCY),
  country: z.literal(DEFAULT_COUNTRY).default(DEFAULT_COUNTRY),
  category: z.enum(STORE_CATEGORY_IDS).optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
  whatsappNumber: nigerianPhoneSchema.optional(),
  instagramHandle: instagramHandleSchema.optional(),
  contactEmail: z.email().optional(),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{7,20}$/)
    .optional(),
});
export type CreateStoreInput = z.infer<typeof createStoreSchema>;

/** PATCH /v1/stores/:storeId — every field optional; `null` clears an optional value. */
export const updateStoreSchema = z.object({
  name: storeNameSchema.optional(),
  slug: storeSlugSchema.optional(),
  category: z.enum(STORE_CATEGORY_IDS).optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
  whatsappNumber: nigerianPhoneSchema.nullable().optional(),
  instagramHandle: instagramHandleSchema.nullable().optional(),
  primaryColor: brandColourSchema.nullable().optional(),
});
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

/** POST /v1/stores/:storeId/onboarding — records the furthest onboarding step reached. */
export const onboardingProgressSchema = z.object({
  step: z.number().int().min(1).max(ONBOARDING_STEP_COUNT),
});

export const slugAvailabilityQuerySchema = z.object({ slug: z.string().max(100) });
export const slugAvailabilitySchema = z.object({
  slug: z.string(),
  available: z.boolean(),
  /** Why it can't be used (invalid format, reserved word, or taken by another store). */
  reason: z.enum(['invalid', 'reserved', 'taken']).optional(),
  message: z.string().optional(),
});
export type SlugAvailabilityDto = z.infer<typeof slugAvailabilitySchema>;

export const storeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  currency: z.string(),
  country: z.string(),
  status: z.enum(STORE_STATUSES),
  category: z.enum(STORE_CATEGORY_IDS).nullable(),
  state: z.string().nullable(),
  whatsappNumber: z.string().nullable(),
  instagramHandle: z.string().nullable(),
  primaryColor: z.string().nullable(),
  /** Furthest onboarding step reached (1–6). */
  onboardingStep: z.number().int(),
  onboardingCompletedAt: z.string().nullable(),
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
export * from './catalog.js';
