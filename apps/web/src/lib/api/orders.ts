import 'server-only';
import { type OrderTab, orderDetailSchema, orderListSchema } from '@ojara/shared';
import { ApiRequestError } from './client';
import { apiGet } from './session';

/** Server Component reads for merchant orders (store-scoped; the API checks membership). */

const base = (storeId: string) => `/stores/${encodeURIComponent(storeId)}/orders` as const;

export function listOrders(
  storeId: string,
  query: { tab?: OrderTab; q?: string | undefined; page?: number; pageSize?: number },
) {
  const params = new URLSearchParams();
  if (query.tab && query.tab !== 'ALL') params.set('tab', query.tab);
  if (query.q) params.set('q', query.q);
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  const qs = params.toString();
  return apiGet(`${base(storeId)}${qs ? `?${qs}` : ''}`, orderListSchema);
}

/** The order, or null when it doesn't exist in this store. */
export async function getOrder(storeId: string, orderId: string) {
  try {
    return await apiGet(`${base(storeId)}/${encodeURIComponent(orderId)}`, orderDetailSchema);
  } catch (err) {
    if (err instanceof ApiRequestError && (err.status === 404 || err.status === 400)) return null;
    throw err;
  }
}
