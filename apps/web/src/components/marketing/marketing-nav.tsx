'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const MARKETING_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/stores', label: 'Stores on Ojara' },
  { href: '/help', label: 'Help' },
] as const;

/** Visible path; strips the internal `/marketing` rewrite prefix if it ever leaks through. */
function useVisiblePath() {
  const pathname = usePathname() ?? '/';
  return pathname.replace(/^\/marketing(?=\/|$)/, '') || '/';
}

function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`);
}

/** Centre links (desktop): Inter 14/500 muted; active 600 forest. */
export function MarketingNavLinks() {
  const path = useVisiblePath();
  return (
    <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
      {MARKETING_LINKS.map((l) => {
        const active = isActive(path, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-sm transition-colors hover:text-fg',
              active ? 'font-semibold text-fg' : 'font-medium text-fg-muted',
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Hamburger menu below 1024px: a native <details> disclosure, closed on navigation. */
export function MarketingMobileMenu({ loginHref }: { loginHref: string }) {
  const path = useVisiblePath();
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [path]);

  return (
    <details ref={ref} className="group lg:hidden">
      <summary
        aria-label="Menu"
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-fg [&::-webkit-details-marker]:hidden"
      >
        <Menu aria-hidden className="size-[22px] group-open:hidden" />
        <X aria-hidden className="hidden size-[22px] group-open:block" />
      </summary>
      <nav
        aria-label="Main"
        className="absolute inset-x-3 top-full z-50 mt-1 flex flex-col rounded-lg border border-line bg-surface p-2 shadow-popover"
      >
        {MARKETING_LINKS.map((l) => {
          const active = isActive(path, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-3 text-[15px]',
                active ? 'bg-selected font-semibold text-fg' : 'font-medium text-fg-muted',
              )}
            >
              {l.label}
            </Link>
          );
        })}
        <a
          href={loginHref}
          className="mt-1 rounded-md border-t border-line px-3 py-3 text-[15px] font-semibold text-fg"
        >
          Log in
        </a>
      </nav>
    </details>
  );
}
