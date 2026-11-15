import 'server-only';
import type { SessionUserDto, StoreMembershipDto, StoreRole, StoreSummaryDto } from '@ojara/shared';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { getAdminAccess, getMyStores, getSessionUser, getStoreSummary } from '@/lib/api/session';
import { storefrontOrigin } from '@/lib/platform-url';
import { loginPath, REQUEST_PATH_HEADER } from '@/lib/routing';
import { clientEnv } from '@/env';

/**
 * Server-side access checks for the signed-in surfaces. These shape the UI (redirects, which store
 * to show); the API remains the security boundary and re-checks every call.
 *
 * Call them from layouts *and* from pages that show account data: layouts are not re-run on
 * client-side navigation, pages are. React `cache` makes repeat calls in one request free.
 */

/** Cookie remembering which store the merchant last opened (store switcher). */
export const ACTIVE_STORE_COOKIE = 'ojara_store';

const ROLE_LABEL: Record<StoreRole, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

async function redirectToLogin(): Promise<never> {
  redirect(loginPath((await headers()).get(REQUEST_PATH_HEADER)));
}

/** Any signed-in user (onboarding). */
export const requireUser = cache(async (): Promise<SessionUserDto> => {
  const user = await getSessionUser();
  return user ?? redirectToLogin();
});

export interface MerchantContext {
  user: SessionUserDto;
  /** The store being managed (from the switcher cookie, else the first one). */
  membership: StoreMembershipDto;
  stores: StoreMembershipDto[];
  summary: StoreSummaryDto;
  roleLabel: string;
  /** Public address as shown in the UI, e.g. "demo.ojara.localhost". */
  storeAddress: string;
  /** Absolute storefront URL for "View store" links. */
  storeUrl: string;
}

/** Signed-in merchant with at least one store; otherwise /login or /onboarding. */
export const requireMerchant = cache(async (): Promise<MerchantContext> => {
  const user = await requireUser();
  const stores = await getMyStores();
  const preferred = (await cookies()).get(ACTIVE_STORE_COOKIE)?.value;
  const membership = stores.find((s) => s.id === preferred) ?? stores[0];
  if (!membership) redirect('/onboarding');

  const [summary, storeUrl] = await Promise.all([
    getStoreSummary(membership.id),
    storefrontOrigin(membership.slug),
  ]);
  return {
    user,
    membership,
    stores,
    summary,
    roleLabel: ROLE_LABEL[membership.role],
    storeAddress: `${membership.slug}.${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}`,
    storeUrl,
  };
});

/**
 * Admin console access. Signed-out or expired sessions go to /login, admins without two-factor
 * go to /security; returns null for signed-in users who aren't platform admins (the layout shows
 * a "no access" message rather than bouncing them to a login they can't use).
 */
export const requireAdmin = cache(async () => {
  const access = await getAdminAccess();
  switch (access.status) {
    case 'ok':
      return access.user;
    case 'two-factor-required':
      return redirect('/security');
    case 'expired':
      return redirect('/login?expired=1');
    case 'signed-out':
      return redirectToLogin();
    case 'forbidden':
      return null;
  }
});

/** First name for greetings ("Good afternoon, Adùnní"). */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
