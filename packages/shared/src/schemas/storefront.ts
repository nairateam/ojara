import { z } from 'zod';
import { storefrontDeliverySchema } from './delivery.js';

/**
 * Public storefront data (what shoppers see). Served by GET /v1/internal/storefront/:storeId/*
 * to the web server only; never includes costs, SKUs, exact stock or drafts.
 */

export const storefrontCategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  /** Published products in the category. */
  productCount: z.number().int(),
  /** Cover photo of the newest product in the category, for category tiles. */
  coverPublicId: z.string().nullable(),
});
export type StorefrontCategoryDto = z.infer<typeof storefrontCategorySchema>;

export const storefrontStoreSchema = z.object({
  name: z.string(),
  slug: z.string(),
  whatsappNumber: z.string().nullable(),
  instagramHandle: z.string().nullable(),
  contactEmail: z.string().nullable(),
  state: z.string().nullable(),
  /** Starter and above hide "Powered by Ojara". */
  removeBranding: z.boolean(),
  /** Categories shown in the store menu, in menu order. */
  categories: z.array(storefrontCategorySchema),
  productCount: z.number().int(),
  /** The store has a payout account, so shoppers can pay online at checkout. */
  acceptsPayments: z.boolean(),
  /** Delivery zones and pickup offered at checkout. */
  delivery: storefrontDeliverySchema,
});
export type StorefrontStoreDto = z.infer<typeof storefrontStoreSchema>;

export const storefrontProductCardSchema = z.object({
  slug: z.string(),
  name: z.string(),
  /** What the customer pays now (sale price when on sale), lowest across variants. */
  priceKobo: z.number().int(),
  /** The pre-sale price when on sale. */
  compareAtKobo: z.number().int().nullable(),
  /** True when variants have different prices ("from ₦…"). */
  priceVaries: z.boolean(),
  coverPublicId: z.string().nullable(),
  /** First option's values, e.g. "S · M · L"; null for simple products. */
  optionSummary: z.string().nullable(),
  soldOut: z.boolean(),
  isNew: z.boolean(),
});
export type StorefrontProductCardDto = z.infer<typeof storefrontProductCardSchema>;

export const STOREFRONT_SORTS = ['newest', 'price-asc', 'price-desc'] as const;

export const storefrontListQuerySchema = z.object({
  category: z.string().max(80).optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(STOREFRONT_SORTS).default('newest'),
  /** Price range in kobo. */
  min: z.coerce.number().int().min(0).optional(),
  max: z.coerce.number().int().min(0).optional(),
  inStock: z
    .enum(['1', 'true'])
    .transform(() => true)
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(24),
});
export type StorefrontListQuery = z.input<typeof storefrontListQuerySchema>;

export const storefrontListSchema = z.object({
  items: z.array(storefrontProductCardSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  category: storefrontCategorySchema.nullable(),
});
export type StorefrontListDto = z.infer<typeof storefrontListSchema>;

export const storefrontVariantSchema = z.object({
  id: z.string(),
  options: z.record(z.string(), z.string()),
  priceKobo: z.number().int(),
  compareAtKobo: z.number().int().nullable(),
  available: z.boolean(),
  /** In stock but at or below the merchant's low-stock level (stock is tracked). */
  lowStock: z.boolean(),
});
export type StorefrontVariantDto = z.infer<typeof storefrontVariantSchema>;

export const storefrontProductSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.object({ slug: z.string(), name: z.string() }).nullable(),
  images: z.array(
    z.object({
      publicId: z.string(),
      width: z.number().int(),
      height: z.number().int(),
      alt: z.string().nullable(),
    }),
  ),
  options: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
  /** Active variants only. */
  variants: z.array(storefrontVariantSchema),
  soldOut: z.boolean(),
  /** Up to 4 other published products from the same category (or the store). */
  related: z.array(storefrontProductCardSchema),
});
export type StorefrontProductDto = z.infer<typeof storefrontProductSchema>;
