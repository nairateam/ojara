import { Eye } from 'lucide-react';
import type { Metadata } from 'next';
import type * as React from 'react';
import { Switch } from '@/components/ui/switch';
import { CUSTOMER_MESSAGES, MERCHANT_ALERTS, STORE } from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Settings · Notifications' };

const channelCell = 'flex w-14 shrink-0 justify-center sm:w-24';

function NotificationCard({
  title,
  description,
  channels,
  children,
}: {
  title: string;
  description: string;
  channels: string[];
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-end gap-3 border-b border-line bg-paper px-4 py-4 sm:px-5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-title font-semibold">{title}</h2>
          <p className="text-xs text-fg-muted">{description}</p>
        </div>
        {channels.map((c) => (
          <span
            key={c}
            className={`${channelCell} text-[10px] font-semibold tracking-[0.6px] text-fg-subtle uppercase sm:text-2xs`}
          >
            {c}
          </span>
        ))}
      </div>
      <ul>{children}</ul>
    </section>
  );
}

function Row({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 px-4 py-[13px] not-last:border-b not-last:border-line sm:px-5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ui font-semibold">{title}</span>
        <span className="text-xs text-fg-muted">{body}</span>
      </div>
      {children}
    </li>
  );
}

/** 03.18 Settings – Notifications. Toggles are visual until the settings API exists. */
export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-[22px]">
      <NotificationCard
        title="Alerts for you"
        description={`Sent to ${STORE.ownerFirstName} · ${STORE.ownerEmail} · +234 ${STORE.whatsapp}`}
        channels={['Email', 'SMS', 'WhatsApp']}
      >
        {MERCHANT_ALERTS.map((a) => (
          <Row key={a.title} title={a.title} body={a.body}>
            <span className={channelCell}>
              <Switch size="sm" defaultChecked={a.email} aria-label={`${a.title} by email`} />
            </span>
            <span className={channelCell}>
              <Switch size="sm" defaultChecked={a.sms} aria-label={`${a.title} by SMS`} />
            </span>
            <span className={`${channelCell} text-2xs font-semibold text-fg-subtle`}>Soon</span>
          </Row>
        ))}
      </NotificationCard>

      <NotificationCard
        title="Messages to customers"
        description={`Sent automatically from ${STORE.name}. Included in your plan.`}
        channels={['Email', 'SMS']}
      >
        {CUSTOMER_MESSAGES.map((m) => (
          <Row key={m.title} title={m.title} body={m.body}>
            <span className={channelCell}>
              <Switch size="sm" defaultChecked={m.email} aria-label={`${m.title} by email`} />
            </span>
            <span className={channelCell}>
              <Switch size="sm" defaultChecked={m.sms} aria-label={`${m.title} by SMS`} />
            </span>
          </Row>
        ))}
      </NotificationCard>

      <button
        type="button"
        className="inline-flex w-fit items-center gap-2 text-ui font-semibold text-fg hover:text-fg-muted"
      >
        <Eye className="size-3.5 text-fg-muted" aria-hidden />
        Preview the SMS customers get when an order ships
      </button>
    </div>
  );
}
