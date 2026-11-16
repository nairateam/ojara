'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { cn } from '@/lib/utils';

/** Public site nav (08–14). Blog is in the design but hidden until there is a blog. */
export const SITE_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/stores', label: 'Stores' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
] as const;

/** Visible path; strips the internal `/marketing` rewrite prefix if it ever leaks through. */
function useVisiblePath() {
  const pathname = usePathname() ?? '/';
  return pathname.replace(/^\/marketing(?=\/|$)/, '') || '/';
}

function isActive(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`);
}

/**
 * Nav row inside each page's dark hero card: wordmark, centred pill of links (active link tinted),
 * "Log in" and a paper "Start free" pill. Below 1024px the links move into a menu.
 */
export function SiteNav({ appOrigin }: { appOrigin: string }) {
  const path = useVisiblePath();
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [path]);

  return (
    <div className="relative z-20 flex items-center justify-between gap-4">
      <Link href="/" aria-label="Ojara home" className="lg:w-[280px]">
        <Wordmark size="xl" tone="light" />
      </Link>

      <nav
        aria-label="Main"
        className="hidden items-center gap-0.5 rounded-full bg-paper/12 p-[5px] lg:flex"
      >
        {SITE_LINKS.map((l) => {
          const active = isActive(path, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full px-[18px] py-[9px] text-[15px] font-medium text-paper transition-colors',
                active ? 'bg-paper/16' : 'hover:bg-paper/8',
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-end gap-2.5 lg:w-[280px]">
        <a
          href={`${appOrigin}/login`}
          className="hidden px-2 text-[15px] font-medium text-paper hover:text-paper/80 sm:inline"
        >
          Log in
        </a>
        <a
          href={`${appOrigin}/signup`}
          className="site-btn rounded-full bg-paper px-4 py-2.5 text-sm font-semibold text-forest md:px-5 md:py-[11px] md:text-[15px]"
        >
          Start free
        </a>
        <details ref={menu} className="group lg:hidden">
          <summary
            aria-label="Menu"
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full bg-paper/12 text-paper [&::-webkit-details-marker]:hidden"
          >
            <Menu aria-hidden className="size-5 group-open:hidden" />
            <X aria-hidden className="hidden size-5 group-open:block" />
          </summary>
          <nav
            aria-label="Main"
            className="absolute inset-x-0 top-full mt-3 flex flex-col rounded-2xl bg-[#3B4336] p-2 shadow-popover"
          >
            {SITE_LINKS.map((l) => {
              const active = isActive(path, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-xl px-4 py-3 text-[15px] font-medium text-paper',
                    active && 'bg-paper/12',
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <a
              href={`${appOrigin}/login`}
              className="mt-1 rounded-xl border-t border-paper/10 px-4 py-3 text-[15px] font-semibold text-paper"
            >
              Log in
            </a>
          </nav>
        </details>
      </div>
    </div>
  );
}
