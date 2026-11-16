'use server';

import { productDetailSchema, productInputSchema } from '@ojara/shared';
import { redirect } from 'next/navigation';
import { ApiRequestError } from '@/lib/api/client';
import { apiWrite } from '@/lib/api/session';
import { getActiveStore, requireUser } from '@/lib/auth/guards';

/**
 * Product editor Server Actions. Public POST endpoints: they authenticate, take the store from the
 * session, re-validate with the shared schema and call the API, which checks store membership and
 * that the product belongs to the store.
 */

export interface ProductFormState {
  message?: string;
  /** Keyed by the input path, e.g. "name", "basePriceKobo", "variants.2.sku". */
  fieldErrors?: Record<string, string>;
}

async function requireStoreId(): Promise<string> {
  await requireUser();
  const store = await getActiveStore();
  if (!store) redirect('/onboarding');
  return store.id;
}

const catalog = (storeId: string) => `/stores/${encodeURIComponent(storeId)}/catalog` as const;

function apiFailure(err: unknown): ProductFormState {
  if (err instanceof ApiRequestError) {
    if (err.status === 401) redirect('/login');
    if (err.code === 'SKU_TAKEN')
      return { message: err.message, fieldErrors: { variants: err.message } };
    if (err.status === 403 || err.status === 400 || err.status === 409)
      return { message: err.message };
    if (err.status === 404) return { message: 'This product no longer exists.' };
    if (err.status === 429) return { message: 'Too many requests. Please wait a minute.' };
  }
  console.error('[products] action failed', err);
  return { message: 'Something went wrong saving the product. Please try again.' };
}

export async function saveProduct(
  _prev: ProductFormState,
  data: FormData,
): Promise<ProductFormState> {
  const storeId = await requireStoreId();
  const productId = data.get('productId');
  let raw: unknown;
  try {
    const payload = data.get('payload');
    raw = JSON.parse(typeof payload === 'string' ? payload : '');
  } catch {
    return { message: 'Something went wrong reading the form. Please reload and try again.' };
  }
  const parsed = productInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.') || 'form'] ??= issue.message;
    }
    return { fieldErrors, message: 'Please fix the highlighted fields.' };
  }

  let saved;
  try {
    saved =
      typeof productId === 'string' && productId
        ? await apiWrite(
            'PUT',
            `${catalog(storeId)}/products/${encodeURIComponent(productId)}`,
            productDetailSchema,
            parsed.data,
          )
        : await apiWrite('POST', `${catalog(storeId)}/products`, productDetailSchema, parsed.data);
  } catch (err) {
    return apiFailure(err);
  }
  redirect(`/products/${saved.id}?saved=1`);
}

/** Archive (hide, free a plan slot) or restore (back as a draft). */
export async function setProductArchived(
  productId: string,
  archive: boolean,
): Promise<ProductFormState> {
  const storeId = await requireStoreId();
  try {
    await apiWrite(
      'POST',
      `${catalog(storeId)}/products/${encodeURIComponent(productId)}/${archive ? 'archive' : 'restore'}`,
      productDetailSchema,
    );
  } catch (err) {
    return apiFailure(err);
  }
  redirect(`/products/${productId}?${archive ? 'archived' : 'restored'}=1`);
}
