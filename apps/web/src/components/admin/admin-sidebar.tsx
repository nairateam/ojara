'use client';

import { ADMIN_NAV } from '@/components/app/nav-config';
import { SidebarNavItems } from '@/components/app/sidebar-nav';
import { ADMIN_NAV_COUNTS } from '@/mock/admin';

/**
 * Admin sidebar nav (06.xx) with the count pills from the designs: "Reports & abuse" red "3",
 * "Support tickets" muted "12". Reuses the shared SidebarNavItems styles; counts come from mock
 * data until /v1/admin exposes them.
 */
export function AdminSidebarNav() {
  return (
    <nav className="flex flex-col gap-[22px]" aria-label="Main">
      {ADMIN_NAV.map((group, i) => (
        <div key={group.heading ?? i} className="flex flex-col gap-1.5">
          {group.heading ? (
            <span className="px-2.5 text-2xs font-semibold tracking-label text-admin-heading uppercase">
              {group.heading}
            </span>
          ) : null}
          <SidebarNavItems
            variant="admin"
            items={group.items.map((item) => {
              const c = ADMIN_NAV_COUNTS[item.href];
              return c
                ? { ...item, count: c.count, countTone: c.tone === 'danger' ? 'danger' : undefined }
                : item;
            })}
          />
        </div>
      ))}
    </nav>
  );
}
