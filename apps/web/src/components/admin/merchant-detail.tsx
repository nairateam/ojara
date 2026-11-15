import {
  ArrowLeft,
  ArrowUpRight,
  Ban,
  CreditCard,
  ExternalLink,
  Eye,
  Globe,
  LifeBuoy,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { formatKobo } from '@ojara/shared';
import Link from 'next/link';
import { PaymentBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { MerchantDetail } from '@/mock/admin';
import {
  AdminCard,
  AdminCardTitle,
  MerchantLogo,
  PlanBadge,
  PrivacyNote,
  StoreStatusBadge,
} from './primitives';

export function MerchantHeader({ detail }: { detail: MerchantDetail }) {
  const m = detail.merchant;
  const meta = [m.domain, detail.customDomain, m.category, m.city].filter(Boolean).join(' · ');
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/merchants"
        className="inline-flex w-fit items-center gap-1.5 text-ui font-medium text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> Merchants
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <MerchantLogo name={m.store} bg={detail.logo.bg} ink={detail.logo.ink} size={52} />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[22px] font-semibold tracking-[-0.4px] text-fg md:text-[26px]">
                {m.store}
              </h1>
              <StoreStatusBadge status={m.status} />
              <PlanBadge plan={m.plan} />
            </div>
            <p className="text-ui text-fg-muted">{meta}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" asChild>
            <a href={`https://${m.domain}`} target="_blank" rel="noreferrer">
              <ExternalLink /> View store
            </a>
          </Button>
          <Button variant="secondary">
            <Eye /> Dashboard (read-only)
          </Button>
          {m.status === 'SUSPENDED' ? (
            <Button variant="secondary">Restore store</Button>
          ) : (
            <Button variant="destructive">
              <Ban /> Suspend
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountCard({ detail }: { detail: MerchantDetail }) {
  return (
    <AdminCard className="gap-3.5">
      <AdminCardTitle>Account</AdminCardTitle>
      <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
        {detail.account.map((f) => (
          <div key={f.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs text-fg-subtle">{f.label}</dt>
            <dd className="truncate text-ui font-medium text-fg">{f.value}</dd>
          </div>
        ))}
      </dl>
      <PrivacyNote className="rounded-md bg-paper px-3 py-2.5">
        This store’s customer list and order addresses are hidden from admins.
      </PrivacyNote>
    </AdminCard>
  );
}

export function InvoicesCard({ detail }: { detail: MerchantDetail }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <div className="px-5 py-4">
        <AdminCardTitle>Plan invoices</AdminCardTitle>
      </div>
      {detail.invoices.length === 0 ? (
        <p className="border-t border-line px-5 py-3 text-ui text-fg-muted">
          No plan invoices — this store is on Free.
        </p>
      ) : (
        <ul>
          {detail.invoices.map((inv) => (
            <li
              key={inv.number}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-5 py-3 text-ui"
            >
              <span className="font-semibold text-fg">{inv.number}</span>
              <span className="text-fg-muted">
                {inv.date} · {inv.description}
              </span>
              <span className="ml-auto font-semibold text-fg">{formatKobo(inv.amountKobo)}</span>
              <PaymentBadge status="PAID" />
              <button type="button" className="text-xs font-semibold text-fg hover:underline">
                Refund
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const ACTIVITY_ICONS = {
  ticket: LifeBuoy,
  globe: Globe,
  upgrade: ArrowUpRight,
  orders: ShoppingBag,
  card: CreditCard,
  store: Store,
} as const;

export function ActivityCard({ detail }: { detail: MerchantDetail }) {
  return (
    <AdminCard className="gap-3.5">
      <AdminCardTitle>Activity</AdminCardTitle>
      <ul className="flex flex-col gap-3.5">
        {detail.activity.map((a) => {
          const Icon = ACTIVITY_ICONS[a.icon];
          return (
            <li key={a.text} className="flex items-center gap-3">
              <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-surface-muted text-fg-muted">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-ui text-fg">{a.text}</span>
              <span className="shrink-0 text-xs text-fg-subtle">{a.when}</span>
            </li>
          );
        })}
      </ul>
    </AdminCard>
  );
}

export function NotesCard({ detail }: { detail: MerchantDetail }) {
  return (
    <AdminCard className="gap-3.5">
      <AdminCardTitle>Internal notes</AdminCardTitle>
      {detail.notes.map((n) => (
        <div key={n.body} className="flex flex-col gap-1 rounded-md bg-attention-soft p-3">
          <p className="text-xs leading-[18px] text-[#6E4A0E]">{n.body}</p>
          <span className="text-2xs text-warning">
            {n.author} · {n.date}
          </span>
        </div>
      ))}
      <Input placeholder="Add a note for the team…" aria-label="Add a note for the team" />
    </AdminCard>
  );
}
