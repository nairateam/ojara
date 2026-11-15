'use client';

import { MERCHANT_NAV } from '@/components/app/nav-config';
import { SidebarNavItems } from '@/components/app/sidebar-nav';

/**
 * Merchant sidebar nav (00.06) with live count pills. Icons can't cross the RSC boundary, so the
 * server layout passes plain counts keyed by href and the items are built here.
 */
export function MerchantNav({ counts = {} }: { counts?: Record<string, number> }) {
  return (
    <nav className="flex flex-col gap-[22px]" aria-label="Main">
      {MERCHANT_NAV.map((group, i) => (
        <div key={group.heading ?? i} className="flex flex-col gap-1.5">
          {group.heading ? (
            <span className="px-2.5 text-[11px]/[14px] font-semibold tracking-label text-nav-muted uppercase">
              {group.heading}
            </span>
          ) : null}
          <SidebarNavItems
            variant="merchant"
            items={group.items.map((item) =>
              counts[item.href] ? { ...item, count: counts[item.href] } : item,
            )}
          />
        </div>
      ))}
    </nav>
  );
}
