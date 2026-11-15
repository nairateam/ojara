import type { Metadata } from 'next';
import {
  type SupportTab,
  SupportLayout,
  TicketContext,
  TicketListPane,
  TicketThread,
} from '@/components/admin/support';
import { SUPPORT_TICKETS } from '@/mock/admin';

export const metadata: Metadata = { title: 'Support tickets' };

type Props = { searchParams: Promise<{ ticket?: string; tab?: string }> };

/** 06.07 Support tickets — ticket list, conversation with reply composer, merchant context. */
export default async function SupportPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab: SupportTab = params.tab === 'mine' || params.tab === 'solved' ? params.tab : 'open';
  const tickets =
    tab === 'solved'
      ? []
      : tab === 'mine'
        ? SUPPORT_TICKETS.filter((t) => t.assignee === 'Tolu O.')
        : SUPPORT_TICKETS;
  const selected =
    SUPPORT_TICKETS.find((t) => t.id === params.ticket) ?? tickets[0] ?? SUPPORT_TICKETS[0]!;

  return (
    <SupportLayout
      list={<TicketListPane tickets={tickets} tab={tab} selectedId={selected.id} />}
      thread={<TicketThread ticket={selected} />}
      context={<TicketContext ticket={selected} />}
    />
  );
}
