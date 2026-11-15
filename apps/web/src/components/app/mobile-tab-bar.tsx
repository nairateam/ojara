'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MERCHANT_TABS } from './nav-config';
import { isActive } from './sidebar-nav';

/** Mobile bottom tab bar (04.xx): surface, 1px top border, 5 items, 24px icons, 11px labels. */
export function MobileTabBar() {
  const items = MERCHANT_TABS;
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface px-2 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] lg:hidden"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-1 py-1.5 text-2xs',
              active ? 'font-semibold text-fg' : 'font-medium text-fg-subtle',
            )}
          >
            <item.icon className="size-6" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
