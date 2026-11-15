import { formatKobo } from '@ojara/shared';
import { Ban, Check, ExternalLink, EyeOff, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { StatusPill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioCard, Textarea } from '@/components/ui/form-controls';
import { cn } from '@/lib/utils';
import type { AbuseCase } from '@/mock/admin';
import { AdminCardTitle, SeverityTag } from './primitives';

/** 06.06 left pane (~360): title, Open/Resolved segmented control and the case list. */
export function CaseListPane({
  cases,
  selectedId,
  tab,
  counts,
}: {
  cases: AbuseCase[];
  selectedId?: string;
  tab: 'open' | 'resolved';
  counts: { open: number; resolved: number };
}) {
  const segments = [
    { key: 'open', label: 'Open', count: counts.open, href: '/reports' },
    { key: 'resolved', label: 'Resolved', count: counts.resolved, href: '/reports?tab=resolved' },
  ] as const;
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line bg-surface lg:w-[360px] lg:border-r lg:border-b-0">
      <div className="flex flex-col gap-3 px-5 pt-[22px] pb-4">
        <h1 className="font-display text-h-panel font-semibold tracking-[-0.4px] text-fg">
          Reports &amp; abuse
        </h1>
        <nav
          aria-label="Case status"
          className="flex w-fit gap-0.5 rounded-md bg-surface-muted p-[3px]"
        >
          {segments.map((s) => {
            const active = s.key === tab;
            return (
              <Link
                key={s.key}
                href={s.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-sm px-3 py-[5px] text-xs',
                  active
                    ? 'bg-surface font-semibold text-fg shadow-segment'
                    : 'font-medium text-fg-muted hover:text-fg',
                )}
              >
                {s.label}
                <span className="text-2xs font-normal text-fg-subtle">{s.count}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {tab === 'resolved' ? (
        <p className="border-t border-line px-5 py-4 text-ui text-fg-muted">
          {counts.resolved} resolved cases. Closed cases stay in the audit log.
        </p>
      ) : (
        <ul>
          {cases.map((c) => {
            const selected = c.id === selectedId;
            return (
              <li key={c.id} className="border-t border-line last:border-b">
                <Link
                  href={`/reports?case=${c.id}`}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'flex flex-col gap-[5px] px-5 py-3.5',
                    selected
                      ? 'bg-selected shadow-[inset_3px_0_0_var(--ojara-forest)]'
                      : 'hover:bg-selected/50',
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-ui font-semibold text-fg">{c.store}</span>
                    <SeverityTag severity={c.severity} />
                  </span>
                  <span className="text-ui text-fg">{c.summary}</span>
                  <span className="text-xs text-fg-subtle">{c.meta}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

/** 06.06 case detail: evidence on the left, decision radio cards on the right. */
export function CaseDetail({ c }: { c: AbuseCase }) {
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-h-panel font-semibold text-fg">{c.store}</h2>
            <StatusPill tone={c.severity === 'High' ? 'danger' : 'warning'}>{c.badge}</StatusPill>
          </div>
          <p className="text-ui text-fg-muted">
            Case #{c.id} · {c.subtitle}
          </p>
        </div>
        {c.merchantId ? (
          <Button variant="secondary" asChild>
            <Link href={`/merchants/${c.merchantId}`}>
              <ExternalLink /> View store
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[18px]">
            <AdminCardTitle>What shoppers reported ({c.reportCount})</AdminCardTitle>
            {c.reports.map((r) => (
              <blockquote key={r.quote} className="flex flex-col gap-1 rounded-md bg-paper p-3">
                <p className="text-ui leading-[19px] text-fg">{r.quote}</p>
                <footer className="text-xs text-fg-subtle">{r.source}</footer>
              </blockquote>
            ))}
          </section>
          {c.listings.length > 0 ? (
            <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[18px]">
              <AdminCardTitle>Flagged listings</AdminCardTitle>
              {c.listings.map((l) => (
                <div key={l.name} className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-muted text-fg-subtle">
                    <Smartphone className="size-4" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-ui font-semibold text-fg">{l.name}</span>
                    <span className="text-xs text-danger">{l.warning}</span>
                  </span>
                  <span className="text-ui font-semibold text-fg">{formatKobo(l.priceKobo)}</span>
                </div>
              ))}
            </section>
          ) : null}
        </div>

        <div className="flex flex-col gap-3.5">
          <form className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[18px]">
            <AdminCardTitle>Decision</AdminCardTitle>
            {c.options.map((o, i) => (
              <RadioCard key={o.title} name="decision" value={o.title} defaultChecked={i === 0}>
                <span className="text-ui font-semibold text-fg">{o.title}</span>
                <span className="text-xs text-fg-muted">{o.body}</span>
              </RadioCard>
            ))}
            <Textarea
              placeholder="Message to seller (sent by email & SMS)…"
              aria-label="Message to seller"
              className="min-h-16 text-xs"
            />
            <Button type="button" className="w-full">
              <Check /> Confirm decision
            </Button>
          </form>
          <Button
            variant="none"
            className="h-auto justify-start rounded-[10px] border border-danger/40 bg-surface px-3.5 py-3 text-xs font-semibold text-danger hover:bg-danger-soft"
          >
            <Ban /> Terminate account (needs 2nd approver)
          </Button>
          <p className="flex items-start gap-2 text-2xs text-fg-subtle">
            <EyeOff className="mt-px size-3.5 shrink-0" aria-hidden />
            Shopper names and contacts are hidden. Opening this case was added to the audit log.
          </p>
        </div>
      </div>
    </div>
  );
}
