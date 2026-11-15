import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar';
import { TopBar } from '@/components/app/top-bar';
import { Wordmark } from '@/components/brand/wordmark';
import { NoAdminAccess } from '@/components/auth/no-admin-access';
import { requireAdmin } from '@/lib/auth/guards';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Ojara Admin' },
  robots: { index: false, follow: false },
};

/**
 * Platform admin shell (admin.ROOT_DOMAIN), matching 06.xx: darker 240px sidebar with the
 * wordmark + "ADMIN" tag (no store switcher, no plan card) and a top bar without "View store".
 *
 * Access: GET /v1/admin/session (PLATFORM_ADMIN + two-factor + session under 8 hours). Signed-out
 * or expired sessions go to /login, admins without two-factor to /security, other accounts see a
 * "no admin access" message. The API enforces the same rules on every /v1/admin/* call.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) return <NoAdminAccess />;

  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-[240px] shrink-0 flex-col gap-6 overflow-y-auto bg-admin-nav px-3.5 py-[22px] lg:flex">
        <div className="flex items-center gap-2 px-2">
          <Wordmark size="sm" tone="light" />
          <span className="rounded-xs bg-nav-tint px-[7px] py-0.5 text-micro font-bold tracking-label text-admin-fg">
            ADMIN
          </span>
        </div>
        <AdminSidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          searchPlaceholder="Search merchants, stores or domains"
          account={{ name: admin.name, role: 'Platform admin' }}
          hasUnread
          leading={
            <span className="flex items-center gap-2">
              <Wordmark size="sm" />
              <span className="rounded-xs bg-surface-muted px-[7px] py-0.5 text-micro font-bold tracking-label text-fg-muted">
                ADMIN
              </span>
            </span>
          }
        />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
