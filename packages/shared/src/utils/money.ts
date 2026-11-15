import { KOBO_PER_NAIRA } from '../constants/currency.js';

/** Converts a naira amount (possibly fractional, e.g. user input) to integer kobo. */
export function nairaToKobo(naira: number): number {
  if (!Number.isFinite(naira)) throw new RangeError('Amount must be finite');
  return Math.round(naira * KOBO_PER_NAIRA);
}

/**
 * Formats integer kobo for display, e.g. 128450000 -> "₦1,284,500".
 * Kobo are shown only when non-zero. Negative values use a true minus sign, as in the designs.
 */
export function formatKobo(kobo: number, currency = 'NGN', locale = 'en-NG'): string {
  if (!Number.isInteger(kobo)) throw new TypeError('Money must be integer kobo');
  const abs = Math.abs(kobo);
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: abs % KOBO_PER_NAIRA === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(abs / KOBO_PER_NAIRA);
  return kobo < 0 ? `− ${formatted}` : formatted;
}
