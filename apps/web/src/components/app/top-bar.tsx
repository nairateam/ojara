import { Bell, ExternalLink, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * App top bar (00.05): surface, 64px high, 1px bottom border, padding 0/32.
 * Left: 380px search with "/" hint. Right: optional "View store", bell with unread dot, account.
 */
export function TopBar({
  searchPlaceholder,
  viewStoreHref,
  account,
  hasUnread = false,
  leading,
  notifications,
  className,
}: {
  searchPlaceholder: string;
  viewStoreHref?: string;
  account: { name: string; role: string };
  hasUnread?: boolean;
  /** Mobile-only leading slot (e.g. store switcher) shown below lg. */
  leading?: ReactNode;
  /**
   * Replaces the static bell with an interactive one, e.g. the merchant notifications popover
   * (03.02). The node renders its own bell button.
   */
  notifications?: ReactNode;
  className?: string;
}) {
  const initials = account.name
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-4 lg:px-8',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {leading ? <div className="lg:hidden">{leading}</div> : null}
        <label className="hidden w-[380px] max-w-full items-center gap-2.5 rounded-md border border-line bg-paper px-3 py-2 md:flex">
          <Search className="size-4 text-fg-subtle" aria-hidden />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-ui outline-none placeholder:text-fg-subtle"
          />
          <kbd className="rounded-xs border border-line bg-surface px-1.5 py-px font-sans text-2xs text-fg-muted">
            /
          </kbd>
        </label>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {viewStoreHref ? (
          <Button variant="secondary" asChild className="hidden sm:inline-flex">
            <a href={viewStoreHref} target="_blank" rel="noreferrer">
              <ExternalLink /> View store
            </a>
          </Button>
        ) : null}
        {notifications ?? (
          <Button
            variant="none"
            size="icon-ghost"
            className="relative rounded-md"
            aria-label="Notifications"
          >
            <Bell />
            {hasUnread ? (
              <span
                className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-surface"
                aria-hidden
              />
            ) : null}
          </Button>
        )}
        <div className="flex items-center gap-2.5">
          <span className="flex size-[34px] items-center justify-center rounded-full bg-surface-muted text-ui font-semibold">
            {initials}
          </span>
          <span className="hidden flex-col leading-tight md:flex">
            <span className="text-ui font-semibold">{account.name}</span>
            <span className="text-xs text-fg-muted">{account.role}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
