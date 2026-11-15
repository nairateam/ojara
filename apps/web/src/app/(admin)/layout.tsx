import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { SidebarNav } from '@/components/app/sidebar-nav';
import { TopBar } from '@/components/app/top-bar';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Ojara Admin' },
  robots: { index: false, follow: false },
};

/**
 * Platform admin shell (admin.ROOT_DOMAIN), matching 06.xx: darker 240px sidebar with the
 * wordmark + "ADMIN" tag (no store switcher, no plan card) and a top bar without "View store".
 *
 * TODO(auth): require a PLATFORM_ADMIN session server-side (GET /v1/session) and redirect others
 * to /login. The API already enforces @Roles('PLATFORM_ADMIN') on /v1/admin/*.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-[240px] shrink-0 flex-col gap-6 overflow-y-auto bg-admin-nav px-3.5 py-[22px] lg:flex">
        <div className="flex items-center gap-2 px-2">
          <Wordmark size="sm" tone="light" />
          <span className="rounded-xs bg-nav-tint px-[7px] py-0.5 text-micro font-bold tracking-label text-admin-fg">ADMIN</span>
        </div>
        <SidebarNav variant="admin" />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          searchPlaceholder="Search merchants, stores or domains"
          account={{ name: 'Platform Admin', role: 'Operations admin' }}
          leading={
            <span className="flex items-center gap-2">
              <Wordmark size="sm" />
              <span className="rounded-xs bg-surface-muted px-[7px] py-0.5 text-micro font-bold tracking-label text-fg-muted">ADMIN</span>
            </span>
          }
        />
        <main className="flex flex-1 flex-col gap-5 px-4 py-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}
