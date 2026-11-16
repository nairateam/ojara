import 'server-only';
import { deliverySettingsInputSchema, deliverySettingsSchema } from '@ojara/shared';
import { ApiRequestError } from '@/lib/api/client';
import { apiWrite } from '@/lib/api/session';

export interface DeliveryFormState {
  message?: string;
  /** Keyed by schema path, e.g. "pickupAddress", "zones.1.name". */
  fieldErrors?: Record<string, string>;
}

/**
 * Validates the delivery editor's JSON `payload` and saves it (PUT /v1/stores/:id/delivery).
 * Returns form feedback, or null on success. Shared by the dashboard page and onboarding step 5.
 */
export async function saveDeliveryPayload(
  storeId: string,
  data: FormData,
): Promise<DeliveryFormState | null> {
  let raw: unknown;
  try {
    const payload = data.get('payload');
    raw = JSON.parse(typeof payload === 'string' ? payload : '');
  } catch {
    return { message: 'Something went wrong reading the form. Please reload and try again.' };
  }
  const parsed = deliverySettingsInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.') || 'form'] ??= issue.message;
    }
    return { fieldErrors, message: 'Please fix the highlighted fields.' };
  }
  try {
    await apiWrite(
      'PUT',
      `/stores/${encodeURIComponent(storeId)}/delivery`,
      deliverySettingsSchema,
      parsed.data,
    );
    return null;
  } catch (err) {
    if (err instanceof ApiRequestError) {
      if (err.status === 403) return { message: 'Only the store owner or a manager can do this.' };
      if (err.status === 400 || err.status === 429) return { message: err.message };
    }
    console.error('[delivery] save failed', err);
    return { message: 'Something went wrong saving delivery. Please try again.' };
  }
}
