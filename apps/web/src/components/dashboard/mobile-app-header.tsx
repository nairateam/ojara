'use client';

import { ChevronLeft, Plus, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { MockNotification } from '@/mock/dashboard';
import { type ShellStore, StoreSwitcher } from './merchant-sidebar';
import { NotificationsPopover } from './notifications-popover';

type ListHeader = { title: string; tools?: 'search-filter' | 'search'; add?: string };

/** List screens get the 04.02 title header; everything else gets the 04.01 home header. */
const LIST_HEADERS: Record<string, ListHeader> = {
  '/orders': { title: 'Orders', tools: 'search-filter' },
  '/products': { title: 'Products', tools: 'search', add: '/products/new' },
  '/inventory': { title: 'Inventory', tools: 'search-filter' },
  '/customers': { title: 'Customers', tools: 'search-filter' },
  '/reports': { title: 'Reports' },
  '/categories': { title: 'Categories', add: '/categories?category=new' },
  '/more': { title: 'More' },
};

function RoundButton({
  label,
  children,
  href,
}: {
  label: string;
  children: ReactNode;
  href?: string;
}) {
  const cls =
    'inline-flex size-[38px] items-center justify-center rounded-full bg-surface-muted text-fg [&_svg]:size-[18px]';
  return href ? (
    <Link href={href} aria-label={label} className={cls}>
      {children}
    </Link>
  ) : (
    <button type="button" aria-label={label} className={cls}>
      {children}
    </button>
  );
}

/**
 * Mobile merchant app header (04.xx, below lg): surface, padding 8/20/14.
 * - Home & other sections: store switcher + bell (opens the notifications popover).
 * - List pages: Bricolage 24/600 title + 38px round search / filter buttons.
 * - Product editor: back bar. Order detail (04.03) renders its own nav bar, so nothing here.
 */
export function MobileAppHeader({
  store,
  notifications,
}: {
  store: ShellStore;
  notifications: MockNotification[];
}) {
  const pathname = usePathname();
  const base = 'sticky top-0 z-20 flex items-center justify-between gap-3 bg-surface lg:hidden';

  if (/^\/orders\/[^/]+/.test(pathname)) return null;

  const productEdit = /^\/products\/([^/]+)/.exec(pathname);
  if (productEdit) {
    return (
      <header className={`${base} border-b border-line px-3 pt-1.5 pb-3`}>
        <Link
          href="/products"
          aria-label="Back to products"
          className="inline-flex size-[38px] items-center justify-center"
        >
          <ChevronLeft className="size-[22px]" aria-hidden />
        </Link>
        <span className="text-base font-bold">
          {productEdit[1] === 'new' ? 'New product' : 'Edit product'}
        </span>
        <span className="size-[38px]" aria-hidden />
      </header>
    );
  }

  const list = LIST_HEADERS[pathname];
  if (list) {
    return (
      <header className={`${base} px-5 pt-2 pb-3.5`}>
        <h1 className="font-display text-[24px]/[30px] font-semibold tracking-[-0.4px]">
          {list.title}
        </h1>
        <div className="flex gap-1">
          {list.tools ? (
            <RoundButton label={`Search ${list.title.toLowerCase()}`}>
              <Search aria-hidden />
            </RoundButton>
          ) : null}
          {list.tools === 'search-filter' ? (
            <RoundButton label="Filter">
              <SlidersHorizontal aria-hidden />
            </RoundButton>
          ) : null}
          {list.add ? (
            <RoundButton label={`Add to ${list.title.toLowerCase()}`} href={list.add}>
              <Plus aria-hidden />
            </RoundButton>
          ) : null}
        </div>
      </header>
    );
  }

  return (
    <header className={`${base} px-5 pt-2 pb-3.5`}>
      <StoreSwitcher store={store} compact />
      <NotificationsPopover
        items={notifications}
        placement="mobile"
        iconClassName="size-[22px] text-fg"
      />
    </header>
  );
}
