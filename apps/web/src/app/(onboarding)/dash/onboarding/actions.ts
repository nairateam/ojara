'use server';

import {
  createStoreSchema,
  instagramHandleSchema,
  NIGERIAN_STATES,
  nigerianPhoneSchema,
  STORE_CATEGORY_IDS,
  brandColourSchema,
  storeSchema,
  storeSlugSchema,
} from '@ojara/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clientEnv } from '@/env';
import { ApiRequestError } from '@/lib/api/client';
import { apiWrite } from '@/lib/api/session';
import {
  ACTIVE_STORE_COOKIE,
  getActiveStore,
  ONBOARDING_PATHS,
  requireUser,
} from '@/lib/auth/guards';
import type { OnboardingFormState } from '@/components/onboarding/onboarding-form';

/**
 * Onboarding Server Actions. Each one is a public POST endpoint, so it authenticates (requireUser),
 * takes the store from the session (never from the form) and re-validates its input; the API then
 * checks the caller's store role and validates again.
 */

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
}

/** Zod issues as per-input messages; `inputNames` maps schema keys to the form's input names. */
function fieldErrors(
  error: z.ZodError,
  inputNames: Record<string, string> = {},
): OnboardingFormState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[inputNames[key] ?? key] ??= issue.message;
  }
  return { fieldErrors: errors, message: 'Please fix the highlighted fields.' };
}

/** Turns an API failure into form feedback. Unexpected failures are logged, not shown. */
function apiFailure(err: unknown): OnboardingFormState {
  if (err instanceof ApiRequestError) {
    if (err.status === 401) redirect('/login?next=%2Fonboarding');
    if (err.status === 409) {
      return { fieldErrors: { slug: err.message }, message: 'Please fix the highlighted fields.' };
    }
    if (err.status === 403) return { message: 'Only the store owner or a manager can do this.' };
    if (err.status === 400) return { message: err.message };
    if (err.status === 429) return { message: 'Too many requests. Please wait a minute.' };
  }
  console.error('[onboarding] action failed', err);
  return { message: 'Something went wrong saving your progress. Please try again.' };
}

async function rememberStore(storeId: string) {
  (await cookies()).set(ACTIVE_STORE_COOKIE, storeId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !clientEnv.NEXT_PUBLIC_ROOT_DOMAIN.endsWith('localhost'),
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

function recordStep(storeId: string, step: number) {
  return apiWrite('POST', `/stores/${encodeURIComponent(storeId)}/onboarding`, storeSchema, {
    step,
  });
}

async function requireStore() {
  await requireUser();
  const store = await getActiveStore();
  if (!store) redirect('/onboarding');
  return store;
}

const businessSchema = z.object({
  name: createStoreSchema.shape.name,
  category: z.enum(STORE_CATEGORY_IDS, { error: 'Choose what you sell' }),
  state: z.enum(NIGERIAN_STATES, { error: 'Choose your state' }),
  whatsappNumber: nigerianPhoneSchema,
  instagramHandle: instagramHandleSchema,
});

/** Step 1: creates the store (first time) or updates it, then opens step 2. */
export async function saveBusinessDetails(
  _prev: OnboardingFormState,
  data: FormData,
): Promise<OnboardingFormState> {
  await requireUser();
  const parsed = businessSchema.safeParse({
    name: text(data, 'businessName'),
    category: text(data, 'category'),
    state: text(data, 'state'),
    whatsappNumber: text(data, 'whatsapp'),
    instagramHandle: text(data, 'instagram'),
  });
  if (!parsed.success) {
    return fieldErrors(parsed.error, {
      name: 'businessName',
      whatsappNumber: 'whatsapp',
      instagramHandle: 'instagram',
    });
  }
  const details = parsed.data;

  try {
    let store = await getActiveStore();
    if (!store) {
      const created = await apiWrite('POST', '/stores', storeSchema, {
        ...details,
        instagramHandle: details.instagramHandle ?? undefined,
      });
      await rememberStore(created.id);
      store = { ...created, role: 'OWNER' };
    } else {
      await apiWrite('PATCH', `/stores/${encodeURIComponent(store.id)}`, storeSchema, details);
    }
    await recordStep(store.id, 2);
  } catch (err) {
    return apiFailure(err);
  }
  redirect(ONBOARDING_PATHS[1]);
}

const brandSchema = z.object({
  name: createStoreSchema.shape.name,
  slug: storeSlugSchema,
  primaryColor: brandColourSchema.nullable(),
});

/** Step 2: store name, web address and brand colour. */
export async function saveStoreBrand(
  _prev: OnboardingFormState,
  data: FormData,
): Promise<OnboardingFormState> {
  const store = await requireStore();
  const colour = text(data, 'brandColour');
  const parsed = brandSchema.safeParse({
    name: text(data, 'storeName'),
    slug: text(data, 'slug'),
    primaryColor: colour === '' ? null : colour,
  });
  if (!parsed.success) {
    return fieldErrors(parsed.error, { name: 'storeName', primaryColor: 'brandColour' });
  }
  try {
    await apiWrite('PATCH', `/stores/${encodeURIComponent(store.id)}`, storeSchema, parsed.data);
    await recordStep(store.id, 3);
  } catch (err) {
    return apiFailure(err);
  }
  redirect(ONBOARDING_PATHS[2]);
}

/** Steps 3–5 (products, payments, delivery) aren't built yet: record progress and move on. */
async function continueFrom(step: 3 | 4 | 5): Promise<OnboardingFormState> {
  const store = await requireStore();
  try {
    await recordStep(store.id, step + 1);
  } catch (err) {
    return apiFailure(err);
  }
  redirect(ONBOARDING_PATHS[step]);
}

export async function continueFromProducts(): Promise<OnboardingFormState> {
  return continueFrom(3);
}
export async function continueFromPayments(): Promise<OnboardingFormState> {
  return continueFrom(4);
}
export async function continueFromDelivery(): Promise<OnboardingFormState> {
  return continueFrom(5);
}

/** Step 6: take the store live (owner only; the API enforces it). */
export async function publishStore(): Promise<OnboardingFormState> {
  const store = await requireStore();
  try {
    await apiWrite('POST', `/stores/${encodeURIComponent(store.id)}/publish`, storeSchema);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 403) {
      return { message: 'Only the store owner can publish the store.' };
    }
    return apiFailure(err);
  }
  redirect('/?published=1');
}
