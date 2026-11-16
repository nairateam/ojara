'use server';

import { redirect } from 'next/navigation';
import { getActiveStore, requireUser } from '@/lib/auth/guards';
import { type DeliveryFormState, saveDeliveryPayload } from '@/lib/delivery/save';

/** 03.11 "Save changes": authenticate, take the store from the session, validate and save. */
export async function saveDelivery(
  _prev: DeliveryFormState,
  data: FormData,
): Promise<DeliveryFormState> {
  await requireUser();
  const store = await getActiveStore();
  if (!store) redirect('/onboarding');
  const failure = await saveDeliveryPayload(store.id, data);
  if (failure) return failure;
  redirect('/delivery?saved=1');
}
