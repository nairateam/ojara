import { z } from 'zod';
import { PRODUCT_STATUSES } from '../constants/statuses.js';

/** Catalogue limits per product (UI and API). */
export const CATALOG_LIMITS = {
  maxOptions: 3,
  maxOptionValues: 20,
  maxVariants: 100,
  /** ₦10,000,000 in kobo: well above anything an SME lists, low enough to catch typos. */
  maxPriceKobo: 1_000_000_000,
} as const;

const priceKobo = z
  .number()
  .int()
  .min(100, 'Price must be at least ₦1')
  .max(CATALOG_LIMITS.maxPriceKobo, 'That price looks too high');

const costKobo = z.number().int().min(0).max(CATALOG_LIMITS.maxPriceKobo);

const key = (s: string) => s.trim().toLowerCase();

export const productOptionSchema = z
  .object({
    name: z.string().trim().min(1, 'Name the option, e.g. Size').max(20),
    values: z
      .array(z.string().trim().min(1).max(30))
      .min(1, 'Add at least one value')
      .max(CATALOG_LIMITS.maxOptionValues),
  })
  .refine((o) => new Set(o.values.map(key)).size === o.values.length, {
    message: 'Each value can only appear once',
    path: ['values'],
  });
export type ProductOption = z.infer<typeof productOptionSchema>;

/** Optional per-variant SKU; blank becomes null. */
const skuSchema = z
  .string()
  .trim()
  .max(64)
  .regex(/^[A-Za-z0-9._-]*$/, 'Use letters, numbers, dots, dashes or underscores')
  .transform((v) => (v === '' ? null : v));

export const variantInputSchema = z.object({
  /** One value per product option, keyed by option name: { "Size": "M" }. Empty for simple products. */
  options: z.record(z.string(), z.string()),
  sku: skuSchema.nullable(),
  /** Overrides the product price when set. */
  priceKobo: priceKobo.nullable(),
  stockQuantity: z.number().int().min(0).max(1_000_000),
  isActive: z.boolean(),
});
export type VariantInput = z.infer<typeof variantInputSchema>;

/** Stable key for a variant's option combination ("Colour=Indigo|Size=M"). */
export function variantKey(options: Record<string, string>): string {
  return Object.keys(options)
    .sort()
    .map((k) => `${k}=${options[k]}`)
    .join('|');
}

/** "M / Indigo" in the product's option order; "" for simple products. */
export function variantLabel(
  options: Record<string, string>,
  optionDefs: readonly { name: string }[],
): string {
  return optionDefs
    .map((o) => options[o.name])
    .filter(Boolean)
    .join(' / ');
}

/**
 * Create or replace a product (POST / PUT). The variant list is the full set: variants missing
 * from it are removed. Archiving is a separate action, so `status` is DRAFT or PUBLISHED only.
 */
export const productInputSchema = z
  .object({
    name: z.string().trim().min(2, 'Use at least 2 characters').max(120),
    description: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .transform((v) => v || null),
    status: z.enum(['DRAFT', 'PUBLISHED']),
    categoryId: z.string().min(1).nullable(),
    basePriceKobo: priceKobo,
    promoPriceKobo: priceKobo.nullable(),
    costKobo: costKobo.nullable(),
    trackStock: z.boolean(),
    sellWhenSoldOut: z.boolean(),
    lowStockThreshold: z.number().int().min(0).max(10_000),
    options: z.array(productOptionSchema).max(CATALOG_LIMITS.maxOptions),
    variants: z.array(variantInputSchema).min(1).max(CATALOG_LIMITS.maxVariants),
  })
  .superRefine((p, ctx) => {
    if (p.promoPriceKobo !== null && p.promoPriceKobo >= p.basePriceKobo) {
      ctx.addIssue({
        code: 'custom',
        path: ['promoPriceKobo'],
        message: 'The promotional price must be lower than the price',
      });
    }
    if (new Set(p.options.map((o) => key(o.name))).size !== p.options.length) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'Option names must differ' });
    }
    if (p.options.length === 0 && p.variants.length !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['variants'],
        message: 'A product without options has exactly one variant',
      });
    }
    const names = p.options.map((o) => o.name);
    const seen = new Set<string>();
    const skus = new Set<string>();
    p.variants.forEach((v, i) => {
      const keys = Object.keys(v.options);
      const valid =
        keys.length === names.length &&
        names.every((n) => {
          const value = v.options[n];
          return value !== undefined && p.options.find((o) => o.name === n)?.values.includes(value);
        });
      if (!valid) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants', i, 'options'],
          message: 'Each variant needs one value for every option',
        });
      }
      const k = variantKey(v.options);
      if (seen.has(k)) {
        ctx.addIssue({ code: 'custom', path: ['variants', i], message: 'Duplicate variant' });
      }
      seen.add(k);
      if (v.sku) {
        if (skus.has(key(v.sku))) {
          ctx.addIssue({
            code: 'custom',
            path: ['variants', i, 'sku'],
            message: 'SKUs must be unique',
          });
        }
        skus.add(key(v.sku));
      }
    });
  });
export type ProductInput = z.infer<typeof productInputSchema>;

export const productVariantSchema = z.object({
  id: z.string(),
  options: z.record(z.string(), z.string()),
  sku: z.string().nullable(),
  priceKobo: z.number().int().nullable(),
  stockQuantity: z.number().int(),
  isActive: z.boolean(),
  position: z.number().int(),
});
export type ProductVariantDto = z.infer<typeof productVariantSchema>;

export const productDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  status: z.enum(PRODUCT_STATUSES),
  categoryId: z.string().nullable(),
  basePriceKobo: z.number().int(),
  promoPriceKobo: z.number().int().nullable(),
  costKobo: z.number().int().nullable(),
  trackStock: z.boolean(),
  sellWhenSoldOut: z.boolean(),
  lowStockThreshold: z.number().int(),
  options: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
  variants: z.array(productVariantSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});
export type ProductDetailDto = z.infer<typeof productDetailSchema>;

export const productListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(PRODUCT_STATUSES),
  categoryName: z.string().nullable(),
  basePriceKobo: z.number().int(),
  promoPriceKobo: z.number().int().nullable(),
  /** Active variants only. */
  variantCount: z.number().int(),
  stockTotal: z.number().int(),
  /** Active variants at or below the low-stock threshold (but not sold out). */
  lowStockCount: z.number().int(),
  outOfStockCount: z.number().int(),
  trackStock: z.boolean(),
  updatedAt: z.string(),
});
export type ProductListItemDto = z.infer<typeof productListItemSchema>;

export const PRODUCT_LIST_TABS = ['ALL', ...PRODUCT_STATUSES] as const;

export const productListQuerySchema = z.object({
  status: z.enum(PRODUCT_STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  /** A category id, or "none" for products without a category. */
  categoryId: z.string().min(1).max(64).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productListSchema = z.object({
  items: z.array(productListItemSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
  /** Per-tab counts, ignoring the search. */
  counts: z.record(z.enum(PRODUCT_LIST_TABS), z.number().int()),
});
export type ProductListDto = z.infer<typeof productListSchema>;

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  showInMenu: z.boolean(),
  position: z.number().int(),
  /** Products in the category that aren't archived. */
  productCount: z.number().int(),
  archivedAt: z.string().nullable(),
});
export type CategoryDto = z.infer<typeof categorySchema>;

export const categoryListSchema = z.object({
  /** Active categories in menu order. */
  categories: z.array(categorySchema),
  archived: z.array(categorySchema),
  /** Products (not archived) without a category. */
  uncategorisedCount: z.number().int(),
});
export type CategoryListDto = z.infer<typeof categoryListSchema>;

const categoryName = z.string().trim().min(1, 'Name the category').max(60);
const categoryDescription = z
  .string()
  .trim()
  .max(300)
  .nullable()
  .transform((v) => v || null);

export const categoryCreateSchema = z.object({
  name: categoryName,
  description: categoryDescription.optional(),
  showInMenu: z.boolean().optional(),
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  name: categoryName.optional(),
  description: categoryDescription.optional(),
  showInMenu: z.boolean().optional(),
});
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

/** PUT …/categories/order: every active category id, in the new menu order. */
export const categoryOrderSchema = z.object({ ids: z.array(z.string().min(1)).min(1).max(500) });
