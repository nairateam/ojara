import 'server-only';
import {
  cartPriceSchema,
  type CheckoutInput,
  checkoutResultSchema,
  storefrontOrderSchema,
  type StorefrontListQuery,
  storefrontListSchema,
  storefrontProductSchema,
  storefrontStoreSchema,
} from '@ojara/shared';
import { cache } from 'react';
import { ApiRequestError } from './client';
import { apiPublicGet, apiPublicPost } from './session';

/** Shopper-facing catalogue reads for storefront pages (published data only). */

const base = (storeId: string) => `/internal/storefront/${encodeURIComponent(storeId)}` as const;

const notFoundAsNull = async <T>(p: Promise<T>): Promise<T | null> => {
  try {
    return await p;
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) return null;
    throw err;
  }
};

/** Store identity, contacts and menu categories (memoised per request: layout + page share it). */
export const getStorefront = cache((storeId: string) =>
  apiPublicGet(base(storeId), storefrontStoreSchema),
);

/** A page of products; null when the category doesn't exist (→ 404). */
export function listStorefrontProducts(storeId: string, query: StorefrontListQuery) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query) as [string, string | number | undefined][]) {
    if (v !== undefined && v !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  return notFoundAsNull(
    apiPublicGet(`${base(storeId)}/products${qs ? `?${qs}` : ''}`, storefrontListSchema),
  );
}

export const getStorefrontProduct = cache((storeId: string, slug: string) =>
  notFoundAsNull(
    apiPublicGet(`${base(storeId)}/products/${encodeURIComponent(slug)}`, storefrontProductSchema),
  ),
);

export function priceCart(storeId: string, lines: { variantId: string; qty: number }[]) {
  return apiPublicPost(`${base(storeId)}/cart/price`, cartPriceSchema, { lines });
}

export function startCheckout(storeId: string, input: CheckoutInput) {
  return apiPublicPost(`${base(storeId)}/checkout`, checkoutResultSchema, input);
}

/** The order behind a Paystack reference; null if there's no such order in this store. */
export function getStorefrontOrder(storeId: string, reference: string) {
  return notFoundAsNull(
    apiPublicGet(`${base(storeId)}/orders/${encodeURIComponent(reference)}`, storefrontOrderSchema),
  );
}
