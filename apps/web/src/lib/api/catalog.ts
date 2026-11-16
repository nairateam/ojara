import 'server-only';
import {
  categoryListSchema,
  type ProductListQuery,
  productDetailSchema,
  productListSchema,
} from '@ojara/shared';
import { cache } from 'react';
import { ApiRequestError } from './client';
import { apiGet } from './session';

/** Server Component reads for the merchant catalogue (store-scoped; the API checks membership). */

const base = (storeId: string) => `/stores/${encodeURIComponent(storeId)}/catalog` as const;

export function listProducts(storeId: string, query: Partial<ProductListQuery>) {
  const params = new URLSearchParams();
  if (query.status) params.set('status', query.status);
  if (query.q) params.set('q', query.q);
  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  const qs = params.toString();
  return apiGet(`${base(storeId)}/products${qs ? `?${qs}` : ''}`, productListSchema);
}

/** The product, or null when it doesn't exist in this store. */
export async function getProduct(storeId: string, productId: string) {
  try {
    return await apiGet(
      `${base(storeId)}/products/${encodeURIComponent(productId)}`,
      productDetailSchema,
    );
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}

export const listCategories = cache((storeId: string) =>
  apiGet(`${base(storeId)}/categories`, categoryListSchema),
);
