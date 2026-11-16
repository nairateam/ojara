import { z } from 'zod';

/** A bank that can receive payouts (Paystack bank list). */
export const payoutBankSchema = z.object({ code: z.string(), name: z.string() });
export type PayoutBankDto = z.infer<typeof payoutBankSchema>;

/** Nigerian NUBAN account number: exactly 10 digits. */
export const accountNumberSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, 'Enter the 10-digit account number');

export const payoutResolveQuerySchema = z.object({
  bankCode: z.string().min(1).max(20),
  accountNumber: accountNumberSchema,
});

export const payoutResolveSchema = z.object({ accountName: z.string() });

/** PUT /v1/stores/:storeId/payouts/account. The account name is always looked up again. */
export const payoutAccountInputSchema = payoutResolveQuerySchema;
export type PayoutAccountInput = z.infer<typeof payoutAccountInputSchema>;

/** What the merchant sees about their payout account (never the full number). */
export const payoutAccountSchema = z.object({
  connected: z.boolean(),
  bankName: z.string().nullable(),
  accountName: z.string().nullable(),
  accountLast4: z.string().nullable(),
  connectedAt: z.string().nullable(),
  /** Ojara's share of each sale, from the store's plan. */
  platformFeePercent: z.number(),
  /** Payments run against Paystack's test environment. */
  testMode: z.boolean(),
});
export type PayoutAccountDto = z.infer<typeof payoutAccountSchema>;
