'use server';

import { type CartPriceDto, checkoutInputSchema } from '@ojara/shared';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiRequestError } from '@/lib/api/client';
import { priceCart, startCheckout } from '@/lib/api/storefront';
import { getTenant } from '@/lib/tenant';

/**
 * Storefront checkout Server Actions (public: shoppers have no account). The store comes from the
 * request's host, never from the form; prices come from the API, never from the browser.
 */

export interface CheckoutFormState {
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function storeFromHost() {
  const h = await headers();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').split(':')[0] ?? '';
  const tenant = host ? await getTenant(host) : null;
  if (!tenant || tenant.status !== 'PUBLISHED') throw new Error('Store not found');
  const proto = h.get('x-forwarded-proto') ?? (host.endsWith('localhost') ? 'http' : 'https');
  return { tenant, origin: `${proto}://${h.get('x-forwarded-host') ?? h.get('host')}` };
}

/** Current prices and stock for the cart saved in the shopper's browser. */
export async function refreshCart(
  lines: { variantId: string; qty: number }[],
): Promise<CartPriceDto> {
  const { tenant } = await storeFromHost();
  const safe = lines
    .filter((l) => typeof l.variantId === 'string' && Number.isInteger(l.qty) && l.qty > 0)
    .slice(0, 50)
    .map((l) => ({ variantId: l.variantId.slice(0, 64), qty: Math.min(99, l.qty) }));
  if (safe.length === 0) return { lines: [] };
  return priceCart(tenant.storeId, safe);
}

/** Creates the order and sends the shopper to Paystack to pay. */
export async function placeOrder(
  _prev: CheckoutFormState,
  data: FormData,
): Promise<CheckoutFormState> {
  const { tenant, origin } = await storeFromHost();
  let raw: unknown;
  try {
    const payload = data.get('payload');
    raw = { ...JSON.parse(typeof payload === 'string' ? payload : ''), returnOrigin: origin };
  } catch {
    return { message: 'Something went wrong reading the form. Please reload and try again.' };
  }
  const parsed = checkoutInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.') || 'form'] ??= issue.message;
    }
    return { fieldErrors, message: 'Please check the highlighted details.' };
  }

  let url: string;
  try {
    url = (await startCheckout(tenant.storeId, parsed.data)).authorizationUrl;
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 409 || err.status === 400)) {
      return { message: err.message };
    }
    if (err instanceof ApiRequestError && err.status === 503) return { message: err.message };
    if (err instanceof ApiRequestError && err.status === 429) {
      return { message: 'Too many attempts. Please wait a minute and try again.' };
    }
    console.error('[checkout] failed', err);
    return { message: 'We couldn’t start the payment. Please try again.' };
  }
  redirect(url);
}
