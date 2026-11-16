import { z } from 'zod';

const MAX_FEE_KOBO = 100_000_000; // ₦1,000,000

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((v) => v || null);

export const deliveryZoneInputSchema = z.object({
  /** Existing zone id; omitted for new zones. */
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, 'Name the zone').max(60),
  /** Areas or towns covered, e.g. ["Lekki", "Ajah"]. */
  areas: z.array(z.string().trim().min(1).max(60)).max(30),
  feeKobo: z.number().int().min(0).max(MAX_FEE_KOBO, 'That charge looks too high'),
  eta: optionalText(40),
  isActive: z.boolean(),
});
export type DeliveryZoneInput = z.infer<typeof deliveryZoneInputSchema>;

/** PUT /v1/stores/:storeId/delivery — the whole delivery & pickup setup in one go. */
export const deliverySettingsInputSchema = z
  .object({
    deliveryEnabled: z.boolean(),
    freeDeliveryOverKobo: z
      .number()
      .int()
      .min(100)
      .max(MAX_FEE_KOBO * 10)
      .nullable(),
    pickupEnabled: z.boolean(),
    pickupAddress: optionalText(200),
    pickupHours: optionalText(80),
    orderReadyIn: optionalText(60),
    sameDayCutoff: optionalText(80),
    orderConfirmationNote: optionalText(500),
    /** The full zone list in display order; zones left out are removed. */
    zones: z.array(deliveryZoneInputSchema).max(30),
  })
  .superRefine((s, ctx) => {
    if (s.pickupEnabled && !s.pickupAddress) {
      ctx.addIssue({
        code: 'custom',
        path: ['pickupAddress'],
        message: 'Add the pickup address customers should come to',
      });
    }
    if (s.deliveryEnabled && !s.zones.some((z) => z.isActive)) {
      ctx.addIssue({
        code: 'custom',
        path: ['zones'],
        message: 'Add at least one delivery zone, or turn delivery off',
      });
    }
    if (!s.deliveryEnabled && !s.pickupEnabled) {
      ctx.addIssue({
        code: 'custom',
        path: ['deliveryEnabled'],
        message: 'Offer delivery, pickup or both so customers can get their orders',
      });
    }
    const names = s.zones.map((z) => z.name.toLowerCase());
    if (new Set(names).size !== names.length) {
      ctx.addIssue({ code: 'custom', path: ['zones'], message: 'Zone names must differ' });
    }
  });
export type DeliverySettingsInput = z.infer<typeof deliverySettingsInputSchema>;

export const deliveryZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  areas: z.array(z.string()),
  feeKobo: z.number().int(),
  eta: z.string().nullable(),
  isActive: z.boolean(),
});
export type DeliveryZoneDto = z.infer<typeof deliveryZoneSchema>;

export const deliverySettingsSchema = z.object({
  deliveryEnabled: z.boolean(),
  freeDeliveryOverKobo: z.number().int().nullable(),
  pickupEnabled: z.boolean(),
  pickupAddress: z.string().nullable(),
  pickupHours: z.string().nullable(),
  orderReadyIn: z.string().nullable(),
  sameDayCutoff: z.string().nullable(),
  orderConfirmationNote: z.string().nullable(),
  zones: z.array(deliveryZoneSchema),
});
export type DeliverySettingsDto = z.infer<typeof deliverySettingsSchema>;

/** What shoppers see: active zones and pickup only. */
export const storefrontDeliverySchema = z.object({
  zones: z.array(deliveryZoneSchema.omit({ isActive: true })),
  freeDeliveryOverKobo: z.number().int().nullable(),
  pickup: z.object({ address: z.string(), hours: z.string().nullable() }).nullable(),
  orderReadyIn: z.string().nullable(),
});
export type StorefrontDeliveryDto = z.infer<typeof storefrontDeliverySchema>;
