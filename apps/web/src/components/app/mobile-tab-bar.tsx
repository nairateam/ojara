'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MERCHANT_TABS, type NavItem } from './nav-config';
import { isActive } from './sidebar-nav';

/** 04.xx uses lucide `menu` for "More". */
const TABS: NavItem[] = MERCHANT_TABS.map((t) => (t.href === '/more' ? { ...t, icon: Menu } : t));

/** More-tab destinations: the tab stays active while browsing them. */
const MORE_ROUTES = [
  '/inventory',
  '/customers',
  '/reports',
  '/categories',
  '/delivery',
  '/payments',
  '/domains',
  '/settings',
  '/help',
];

/** Detail screens with their own sticky action bar (04.03) hide the tab bar. */
function hiddenOn(pathname: string) {
  return /^\/orders\/[^/]+/.test(pathname);
}

/**
 * Mobile bottom tab bar (04.xx): surface, 1px top border, padding 8/8/26, 5 items (24px icons,
 * 11px labels; active 600 forest, inactive 500 #8D9387). `counts` adds the small #5E6559 badge
 * (10/700, 1.5px surface ring) on an icon, e.g. open orders.
 */
export function MobileTabBar({ counts = {} }: { counts?: Record<string, number> }) {
  const pathname = usePathname();
  if (hiddenOn(pathname)) return null;
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface px-2 pt-2 pb-[max(env(safe-area-inset-bottom),26px)] lg:hidden"
    >
      {TABS.map((item) => {
        const active =
          isActive(pathname, item.href) ||
          (item.href === '/more' && MORE_ROUTES.some((r) => isActive(pathname, r)));
        const count = counts[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-1 py-1.5 text-[11px]/[14px]',
              active ? 'font-semibold text-fg' : 'font-medium text-fg-subtle',
            )}
          >
            <span className="relative">
              <item.icon className="size-6" aria-hidden />
              {count ? (
                <span className="absolute -top-1.5 -right-2 rounded-pill bg-fg-muted px-[5px] py-px text-[10px]/[14px] leading-none font-bold text-paper ring-[1.5px] ring-surface">
                  {count}
                  <span className="sr-only"> open</span>
                </span>
              ) : null}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
