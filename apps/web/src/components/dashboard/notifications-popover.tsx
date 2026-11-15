'use client';

import {
  Bell,
  CreditCard,
  Landmark,
  type LucideIcon,
  Megaphone,
  ShoppingBag,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { MockNotification, NotificationKind } from '@/mock/dashboard';

const KIND: Record<NotificationKind, { icon: LucideIcon; cls: string }> = {
  order: { icon: ShoppingBag, cls: 'bg-success-soft text-success' },
  failed: { icon: CreditCard, cls: 'bg-danger-soft text-danger' },
  stock: { icon: TriangleAlert, cls: 'bg-attention-soft text-warning' },
  payout: { icon: Landmark, cls: 'bg-surface-muted text-fg' },
  ojara: { icon: Megaphone, cls: 'bg-forest text-paper' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'stock', label: 'Stock' },
  { key: 'ojara', label: 'From Ojara' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

/**
 * Notifications popover (03.02): opens from the top-bar bell. 400 wide, radius 14, popover shadow,
 * scrim (forest @ 8%) over the main area only. Tabs filter by type; unread rows are tinted with a
 * trailing dot. `placement="mobile"` anchors it under the 04.01 app header instead.
 */
export function NotificationsPopover({
  items,
  placement = 'desktop',
  iconClassName,
}: {
  items: MockNotification[];
  placement?: 'desktop' | 'mobile';
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('all');
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isUnread = (n: MockNotification) => n.unread && !readIds.has(n.id);
  const unreadCount = items.filter(isUnread).length;
  const visible = tab === 'all' ? items : items.filter((n) => n.tab === tab);

  return (
    <>
      <button
        type="button"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative inline-flex size-9 items-center justify-center rounded-md text-fg-muted outline-none hover:bg-selected focus-visible:shadow-focus',
          open && 'bg-selected',
        )}
      >
        <Bell className={cn('size-5', iconClassName)} aria-hidden />
        {unreadCount ? (
          <span
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger ring-2 ring-surface"
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <>
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 top-16 bottom-0 z-30 bg-forest/8 lg:left-[248px]"
          />
          <div
            id={panelId}
            role="dialog"
            aria-label="Notifications"
            className={cn(
              'fixed z-40 flex max-h-[calc(100dvh-80px)] flex-col overflow-hidden rounded-[14px] border border-line bg-surface shadow-popover',
              placement === 'desktop'
                ? 'top-[58px] right-[30px] w-[400px]'
                : 'inset-x-3 top-[60px] sm:right-4 sm:left-auto sm:w-[400px]',
            )}
          >
            <div className="flex flex-col gap-3 px-[18px] pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Notifications</h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-fg hover:text-fg-muted"
                  onClick={() => setReadIds(new Set(items.map((n) => n.id)))}
                >
                  Mark all as read
                </button>
              </div>
              <div role="tablist" className="flex gap-[18px] border-b border-line">
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        '-mb-px flex items-center gap-[5px] border-b-2 pb-2.5 text-xs',
                        active
                          ? 'border-forest font-semibold text-fg'
                          : 'border-transparent font-medium text-fg-muted',
                      )}
                    >
                      {t.label}
                      {t.key === 'all' && unreadCount ? (
                        <span className="rounded-pill bg-danger px-[5px] text-[10px]/[14px] font-bold text-paper">
                          {unreadCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto">
              {visible.length === 0 ? (
                <li className="px-[18px] py-8 text-center text-[13px]/[19px] text-fg-muted">
                  You’re all caught up.
                </li>
              ) : (
                visible.map((n, i) => {
                  const k = KIND[n.kind];
                  const unread = isUnread(n);
                  return (
                    <li key={n.id} className={cn(i > 0 && 'border-t border-line')}>
                      <Link
                        href={n.href}
                        onClick={() => {
                          setReadIds((s) => new Set(s).add(n.id));
                          setOpen(false);
                        }}
                        className={cn(
                          'flex items-start gap-3 px-[18px] py-[13px] hover:bg-selected/70',
                          unread && 'bg-selected',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-[34px] shrink-0 items-center justify-center rounded-full',
                            k.cls,
                          )}
                        >
                          <k.icon className="size-4" aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                          <span className="text-[13px]/[19px] font-semibold">{n.title}</span>
                          <span className="text-xs leading-[17px] text-fg-muted">{n.body}</span>
                          <span className="text-[11px]/[14px] text-fg-subtle">{n.time}</span>
                        </span>
                        {unread ? (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-forest">
                            <span className="sr-only">Unread</span>
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="flex items-center justify-between border-t border-line bg-paper px-[18px] py-3 text-xs font-semibold">
              <Link
                href="/settings/notifications"
                onClick={() => setOpen(false)}
                className="text-fg-muted hover:text-fg"
              >
                Notification settings
              </Link>
              <Link href="/orders" onClick={() => setOpen(false)} className="text-fg">
                View all
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
