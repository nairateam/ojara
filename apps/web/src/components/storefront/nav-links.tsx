'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
}

/**
 * Header nav with the active link in the merchant colour. A tiny client island (usePathname) so
 * the header itself can live in the shared (shop) layout. `/shop` is active only on exact match.
 */
export function NavLinks({
  items,
  className,
  linkClassName,
}: {
  items: NavItem[];
  className?: string;
  linkClassName?: string;
}) {
  // Strip the internal rewrite prefix in case the server render sees the rewritten path.
  const pathname = (usePathname() ?? '/').replace(/^\/store-site\/[^/]+/, '') || '/';
  const isActive = (item: NavItem) =>
    item.href === '/shop'
      ? pathname === '/shop'
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <nav className={className} aria-label="Shop">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-sm font-medium hover:text-store-primary',
              active ? 'text-store-primary' : 'text-store-ink',
              linkClassName,
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
