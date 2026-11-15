import { PLANS } from '@ojara/shared';
import { Check, Eye, ImageIcon, Send, User, Zap } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/ui/panels';
import { cn } from '@/lib/utils';
import { MERCHANTS, SUPPORT_TABS, type SupportTicket } from '@/mock/admin';
import { MerchantLogo } from './primitives';

export type SupportTab = (typeof SUPPORT_TABS)[number]['key'];

/**
 * 06.07 three-pane layout: ticket list (~340) · conversation · merchant context (~280).
 * Fills the viewport under the top bar on desktop so the thread scrolls on its own.
 */
export function SupportLayout({
  list,
  thread,
  context,
}: {
  list: ReactNode;
  thread: ReactNode;
  context: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row lg:overflow-hidden">
      {list}
      {thread}
      {context}
    </div>
  );
}

function ticketHref(tab: SupportTab, id: string) {
  return tab === 'open' ? `/support?ticket=${id}` : `/support?tab=${tab}&ticket=${id}`;
}

export function TicketListPane({
  tickets,
  tab,
  selectedId,
}: {
  tickets: SupportTicket[];
  tab: SupportTab;
  selectedId?: string;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-surface lg:w-[340px] lg:overflow-y-auto lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-3 px-[18px] pt-[22px]">
        <h1 className="font-display text-h-panel font-semibold text-fg">Support</h1>
        <nav className="flex gap-4" aria-label="Ticket filter">
          {SUPPORT_TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                href={t.key === 'open' ? '/support' : `/support?tab=${t.key}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-[5px] border-b-2 pb-1.5 text-ui',
                  active
                    ? 'border-forest font-semibold text-fg'
                    : 'border-transparent font-medium text-fg-muted hover:text-fg',
                )}
              >
                {t.label}
                {'count' in t ? (
                  <span className="text-xs font-normal text-fg-subtle">{t.count}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
      {tickets.length === 0 ? (
        <p className="mt-3 border-t border-line px-[18px] py-4 text-ui text-fg-muted">
          No solved tickets in the last 30 days.
        </p>
      ) : (
        <ul className="mt-3">
          {tickets.map((t) => {
            const selected = t.id === selectedId;
            return (
              <li key={t.id} className="border-t border-line last:border-b">
                <Link
                  href={ticketHref(tab, t.id)}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'flex flex-col gap-1 px-[18px] py-[13px]',
                    selected
                      ? 'bg-selected shadow-[inset_3px_0_0_var(--ojara-forest)]'
                      : 'hover:bg-selected/50',
                  )}
                >
                  <span className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-fg-muted">{t.store}</span>
                    <span
                      className={cn(
                        'text-2xs',
                        t.plan === 'PROFESSIONAL' ? 'font-semibold text-fg' : 'text-fg-subtle',
                      )}
                    >
                      {PLANS[t.plan].name}
                    </span>
                  </span>
                  <span className="text-ui font-semibold text-fg">{t.subject}</span>
                  <span className={cn('text-xs', t.metaUrgent ? 'text-danger' : 'text-fg-subtle')}>
                    {t.meta}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export function TicketThread({ ticket }: { ticket: SupportTicket }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col" aria-label="Conversation">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-6 py-[18px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <h2 className="truncate text-[17px] font-semibold text-fg">{ticket.subject}</h2>
          <p className="truncate text-xs text-fg-muted">
            #{ticket.id} · {ticket.topic} · {ticket.opened} · assigned to {ticket.assignee}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <User /> {ticket.assignee}
          </Button>
          <Button variant="secondary">
            <Check /> Mark solved
          </Button>
        </div>
      </header>

      <ol className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:overflow-y-auto">
        {ticket.messages.map((m) => {
          const staff = m.role === 'staff';
          return (
            <li key={`${m.time}-${m.from}`} className={cn('flex', staff && 'justify-end')}>
              <div
                className={cn(
                  'flex w-full max-w-[460px] flex-col gap-1.5 rounded-lg p-3.5',
                  staff ? 'bg-forest text-paper' : 'border border-line bg-surface text-fg',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold">
                    {m.from} · {staff ? 'Ojara support' : 'Merchant'}
                  </span>
                  <time className={cn('text-2xs', staff ? 'text-fg-on-dark' : 'text-fg-subtle')}>
                    {m.time}
                  </time>
                </div>
                <p className="text-ui leading-5">{m.body}</p>
                {m.attachment ? (
                  <span className="flex w-fit items-center gap-2 rounded-md bg-paper px-2.5 py-2 text-xs text-fg-muted">
                    <ImageIcon className="size-3.5" aria-hidden />
                    {m.attachment}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <form className="flex flex-col gap-2.5 border-t border-line bg-surface px-4 pt-3.5 pb-[18px] md:px-6">
        <div className="flex flex-wrap gap-2">
          {ticket.macros.map((m) => (
            <button
              key={m}
              type="button"
              className="flex items-center gap-1.5 rounded-pill bg-surface-muted px-2.5 py-[5px] text-xs font-medium text-fg hover:bg-selected"
            >
              <Zap className="size-3.5" aria-hidden />
              {m}
            </button>
          ))}
        </div>
        <textarea
          defaultValue={ticket.draft}
          placeholder="Write a reply…"
          aria-label="Reply"
          className="h-[72px] resize-none rounded-[10px] border-[1.5px] border-forest bg-surface p-3 text-ui leading-5 text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-focus"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-fg-subtle">{ticket.channelNote}</span>
          <Button type="button">
            <Send /> Send reply
          </Button>
        </div>
      </form>
    </section>
  );
}

export function TicketContext({ ticket }: { ticket: SupportTicket }) {
  const merchant = MERCHANTS.find((m) => m.id === ticket.merchantId);
  const logo =
    ticket.merchantId === 'adunni-threads'
      ? { bg: '#E9A23B', ink: '#14183A' }
      : { bg: merchant?.logoColor ?? '#4B5563', ink: '#F5F6EE' };
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col gap-4 border-l border-line bg-surface p-5 xl:flex xl:overflow-y-auto">
      <SectionLabel>Merchant</SectionLabel>
      <Link href={`/merchants/${ticket.merchantId}`} className="flex items-center gap-2.5">
        <MerchantLogo name={ticket.store} bg={logo.bg} ink={logo.ink} size={36} />
        <span className="flex min-w-0 flex-col gap-px">
          <span className="truncate text-ui font-semibold text-fg">{ticket.store}</span>
          <span className="truncate text-xs text-fg-muted">{merchant?.owner}</span>
        </span>
      </Link>
      <dl className="flex flex-col gap-4">
        {ticket.context.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5">
            <dt className="text-2xs text-fg-subtle">{f.label}</dt>
            <dd className="text-ui font-medium text-fg">{f.value}</dd>
          </div>
        ))}
      </dl>
      <Button variant="secondary" className="w-full">
        <Eye /> View dashboard (read-only)
      </Button>
      <p className="text-2xs leading-4 text-fg-subtle">
        Read-only access is logged in the audit trail and the merchant is notified.
      </p>
    </aside>
  );
}
