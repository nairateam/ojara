'use server';

import { categoryCreateSchema, categoryListSchema, categorySchema } from '@ojara/shared';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ApiRequestError } from '@/lib/api/client';
import { apiGet, apiWrite } from '@/lib/api/session';
import { getActiveStore, requireUser } from '@/lib/auth/guards';

/**
 * Categories Server Actions: authenticate, take the store from the session, validate, then call
 * the API (which checks membership and, for archiving, the owner/manager role).
 */

export interface CategoryFormState {
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function storePath(): Promise<`/${string}`> {
  await requireUser();
  const store = await getActiveStore();
  if (!store) redirect('/onboarding');
  return `/stores/${encodeURIComponent(store.id)}/catalog/categories`;
}

function failure(err: unknown): CategoryFormState {
  if (err instanceof ApiRequestError) {
    if (err.status === 401) redirect('/login');
    if (err.status === 409) return { fieldErrors: { name: err.message }, message: err.message };
    if (err.status === 403) return { message: 'Only the store owner or a manager can do this.' };
    if (err.status === 400 || err.status === 404) return { message: err.message };
  }
  console.error('[categories] action failed', err);
  return { message: 'Something went wrong. Please try again.' };
}

const ok = z.unknown();

export async function saveCategory(
  _prev: CategoryFormState,
  data: FormData,
): Promise<CategoryFormState> {
  const base = await storePath();
  const rawId = data.get('id');
  const id = typeof rawId === 'string' && rawId ? rawId : 'new';
  const parsed = categoryCreateSchema.safeParse({
    name: data.get('name') ?? '',
    description: data.get('description') ?? null,
  });
  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [String(i.path[0] ?? 'form'), i.message]),
      ),
    };
  }
  let savedId = id;
  try {
    if (id === 'new') {
      savedId = (await apiWrite('POST', base, categorySchema, parsed.data)).id;
    } else {
      await apiWrite('PATCH', `${base}/${encodeURIComponent(id)}`, ok, parsed.data);
    }
  } catch (err) {
    return failure(err);
  }
  redirect(`/categories?category=${encodeURIComponent(savedId)}&saved=1`);
}

/** Show or hide a category in the store menu (row switch). */
export async function setCategoryInMenu(
  id: string,
  showInMenu: boolean,
): Promise<CategoryFormState> {
  const base = await storePath();
  try {
    await apiWrite('PATCH', `${base}/${encodeURIComponent(id)}`, ok, { showInMenu });
  } catch (err) {
    return failure(err);
  }
  return {};
}

/** Move a category one place up (-1) or down (+1) in the menu. */
export async function moveCategory(id: string, direction: -1 | 1): Promise<CategoryFormState> {
  const base = await storePath();
  try {
    const { categories } = await apiGet(base, categoryListSchema);
    const ids = categories.map((c) => c.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= ids.length) return {};
    [ids[from], ids[to]] = [ids[to] ?? id, ids[from] ?? id];
    await apiWrite('PUT', `${base}/order`, ok, { ids });
  } catch (err) {
    return failure(err);
  }
  redirect('/categories');
}

export async function setCategoryArchived(
  id: string,
  archive: boolean,
): Promise<CategoryFormState> {
  const base = await storePath();
  try {
    await apiWrite(
      'POST',
      `${base}/${encodeURIComponent(id)}/${archive ? 'archive' : 'restore'}`,
      ok,
    );
  } catch (err) {
    return failure(err);
  }
  redirect(archive ? '/categories?category=none&archived=1' : `/categories?category=${id}`);
}
