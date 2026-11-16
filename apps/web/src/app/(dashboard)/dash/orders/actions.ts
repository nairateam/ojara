'use server';

import { FULFILMENT_STATUSES, type FulfilmentStatus, orderDetailSchema } from '@ojara/shared';
import { redirect } from 'next/navigation';
import { ApiRequestError } from '@/lib/api/client';
import { apiWrite } from '@/lib/api/session';
import { getActiveStore, requireUser } from '@/lib/auth/guards';

/**
 * Order Server Actions. They authenticate and take the store from the session; the API checks
 * membership, that the order is in this store and that the status change is allowed.
 */
export async function updateOrderStatus(
  orderId: string,
  status: FulfilmentStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireUser();
  const store = await getActiveStore();
  if (!store) redirect('/onboarding');
  if (typeof orderId !== 'string' || !FULFILMENT_STATUSES.includes(status)) {
    return { ok: false, message: 'That status change isn’t possible.' };
  }
  try {
    await apiWrite(
      'PATCH',
      `/stores/${encodeURIComponent(store.id)}/orders/${encodeURIComponent(orderId)}/fulfilment`,
      orderDetailSchema,
      { status },
    );
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiRequestError && err.status < 500) {
      return { ok: false, message: err.message };
    }
    console.error('[orders] status update failed', err);
    return { ok: false, message: 'We couldn’t update the order. Please try again.' };
  }
}
