'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV, MERCHANT_NAV, MERCHANT_NAV_FOOTER, type NavGroup, type NavItem } from './nav-config';

/** Nav sets are looked up here (client side): icon components can't be passed as RSC props. */
const GROUPS: Record<'merchant' | 'admin', NavGroup[]> = { merchant: MERCHANT_NAV, admin: ADMIN_NAV };
const ITEM_SETS = { 'merchant-footer': MERCHANT_NAV_FOOTER } satisfies Record<string, NavItem[]>;

type Variant = 'merchant' | 'admin';

const STYLES: Record<Variant, { item: string; active: string; heading: string }> = {
  // 00.06: inactive #C9CCBC, active bg #434B3E + paper text, no indicator bar.
  merchant: {
    item: 'text-nav-fg hover:bg-nav-active/60',
    active: 'bg-nav-active text-nav-strong',
    heading: 'text-nav-muted',
  },
  // 06.xx: inactive #B4B9A8, active bg paper @ 7%, headings #80877A.
  admin: {
    item: 'text-admin-fg hover:bg-admin-active',
    active: 'bg-admin-active text-nav-strong',
    heading: 'text-admin-heading',
  },
};

export function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function CountPill({ item, variant }: { item: NavItem; variant: Variant }) {
  if (item.count === undefined) return null;
  const tone =
    item.countTone === 'danger'
      ? 'bg-danger text-paper'
      : item.countTone === 'muted' || variant === 'admin'
        ? 'bg-nav-line text-surface'
        : 'bg-paper text-forest';
  return <span className={cn('ml-auto rounded-pill px-[7px] py-px text-2xs font-bold', tone)}>{item.count}</span>;
}

export function SidebarNavItems({ set, variant, items: given }: { set?: keyof typeof ITEM_SETS; variant: Variant; items?: NavItem[] }) {
  const items = given ?? (set ? ITEM_SETS[set] : []);
  const pathname = usePathname();
  const s = STYLES[variant];
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                active ? s.active : s.item,
              )}
            >
              <item.icon className="size-[18px] shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
              <CountPill item={item} variant={variant} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function SidebarNav({ variant }: { variant: Variant }) {
  const groups = GROUPS[variant];
  const s = STYLES[variant];
  return (
    <nav className="flex flex-col gap-[22px]" aria-label="Main">
      {groups.map((group, i) => (
        <div key={group.heading ?? i} className="flex flex-col gap-1.5">
          {group.heading ? (
            <span className={cn('px-2.5 text-2xs font-semibold tracking-label uppercase', s.heading)}>{group.heading}</span>
          ) : null}
          <SidebarNavItems items={group.items} variant={variant} />
        </div>
      ))}
    </nav>
  );
}
