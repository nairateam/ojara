'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Settings sub-pages (03.15–03.19). Visible paths on app.ROOT_DOMAIN (the proxy adds /dash). */
const SETTINGS_TABS = [
  { href: '/settings', label: 'Store details' },
  { href: '/settings/billing', label: 'Plan & billing' },
  { href: '/settings/staff', label: 'Staff' },
  { href: '/settings/notifications', label: 'Notifications' },
  { href: '/settings/policies', label: 'Policies' },
];

/**
 * Underline tab bar (§7): gap 24, 1px bottom border, active = 2px forest underline + 13/600,
 * inactive 13/500 muted, padding-bottom 11. Each tab is its own route.
 */
export function SettingsTabs() {
  const pathname = usePathname().replace(/^\/dash/, '');
  return (
    <nav aria-label="Settings" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex min-w-max gap-6 border-b border-line">
        {SETTINGS_TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  '-mb-px block border-b-2 pb-[11px] text-ui whitespace-nowrap',
                  active
                    ? 'border-forest font-semibold text-fg'
                    : 'border-transparent font-medium text-fg-muted hover:text-fg',
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
