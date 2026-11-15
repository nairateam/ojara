import { ChevronRight, CreditCard, Flag, LifeBuoy } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { AdminKpi, OVERVIEW } from '@/mock/admin';
import { AdminCard, AdminCardTitle, formatKoboCompact } from './primitives';

function CardHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <AdminCardTitle>{title}</AdminCardTitle>
      {subtitle ? <p className="text-xs text-fg-muted">{subtitle}</p> : null}
    </div>
  );
}

/** 06.01 stacked MRR bars: Professional (forest) over Starter (muted); current month highlighted. */
export function MrrChart({ data }: { data: (typeof OVERVIEW)['mrr'] }) {
  const max = Math.max(...data.map((d) => d.starterKobo + d.proKobo));
  const MAX_H = 120;
  return (
    <AdminCard>
      <CardHead title="Monthly recurring revenue" subtitle="Starter + Professional subscriptions" />
      <div
        className="flex h-[180px] items-end gap-2 sm:gap-3.5"
        role="img"
        aria-label="MRR by month"
      >
        {data.map((d, i) => {
          const total = d.starterKobo + d.proKobo;
          const h = Math.round((total / max) * MAX_H);
          const proH = Math.round((d.proKobo / total) * h);
          const current = i === data.length - 1;
          return (
            <div key={d.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5">
              <span
                className={cn(
                  'text-center text-2xs font-semibold',
                  current ? 'text-fg' : 'text-fg-muted',
                )}
              >
                {formatKoboCompact(total, 'M')}
              </span>
              <div className="flex flex-col overflow-hidden rounded-sm" style={{ height: h }}>
                <div className="bg-forest" style={{ height: proH }} />
                <div className={cn('flex-1', current ? 'bg-line-strong' : 'bg-chart-muted')} />
              </div>
              <span className="text-center text-2xs text-fg-subtle">{d.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4">
        {[
          { label: 'Professional', cls: 'bg-forest' },
          { label: 'Starter', cls: 'bg-line-strong' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span className={cn('size-2.5 rounded-[3px]', l.cls)} aria-hidden />
            {l.label}
          </span>
        ))}
      </div>
    </AdminCard>
  );
}

const FILL = { forest: 'bg-forest', muted: 'bg-fg-muted', success: 'bg-success' } as const;

/** 06.01 activation funnel: 10px tracks, fill width = share of sign-ups. */
export function ActivationFunnel({ funnel }: { funnel: (typeof OVERVIEW)['funnel'] }) {
  return (
    <AdminCard>
      <CardHead title="New merchant activation" subtitle={funnel.subtitle} />
      {funnel.stages.map((s) => (
        <div key={s.label} className="flex flex-col gap-[5px]">
          <div className="flex items-center justify-between gap-3 text-ui text-fg">
            <span>{s.label}</span>
            <span className="font-semibold">
              {s.count} · {s.pct}%
            </span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-[5px] bg-surface-muted"
            role="progressbar"
            aria-label={s.label}
            aria-valuenow={s.pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn('h-full rounded-[5px]', FILL[s.tone])}
              style={{ width: `${s.pct}%` }}
            />
          </div>
        </div>
      ))}
    </AdminCard>
  );
}

const NOTE: Record<NonNullable<AdminKpi['noteTone']>, string> = {
  success: 'text-success',
  danger: 'text-danger',
  muted: 'text-fg-subtle',
  default: 'text-fg-muted',
};

/** 06.01 "Shopper & merchant experience": four paper tiles, value Bricolage 20/600. */
export function ExperienceCard({ items }: { items: AdminKpi[] }) {
  return (
    <AdminCard>
      <CardHead title="Shopper & merchant experience" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((m) => (
          <div key={m.label} className="flex flex-col gap-1 rounded-[10px] bg-paper p-3.5">
            <span className="text-xs text-fg-muted">{m.label}</span>
            <span className="font-display text-xl font-semibold text-fg">{m.value}</span>
            {m.note ? (
              <span className={cn('text-2xs', NOTE[m.noteTone ?? 'default'])}>{m.note}</span>
            ) : null}
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

const KIND = {
  abuse: { icon: Flag, cls: 'bg-danger-soft text-danger' },
  support: { icon: LifeBuoy, cls: 'bg-info-soft text-info' },
  billing: { icon: CreditCard, cls: 'bg-warning-soft text-warning' },
} as const;

/** 06.01 "Needs a person": linked rows with a tinted icon tile and a chevron. */
export function NeedsAPerson({ items }: { items: (typeof OVERVIEW)['needsAPerson'] }) {
  return (
    <section className="flex flex-col rounded-lg border border-line bg-surface">
      <div className="px-5 pt-[18px] pb-2.5">
        <AdminCardTitle>Needs a person</AdminCardTitle>
      </div>
      <ul>
        {items.map((item) => {
          const k = KIND[item.kind];
          return (
            <li key={item.title} className="border-t border-line">
              <Link
                href={item.href}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-selected/60"
              >
                <span
                  className={cn(
                    'flex size-[34px] shrink-0 items-center justify-center rounded-[9px]',
                    k.cls,
                  )}
                >
                  <k.icon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-ui font-semibold text-fg">{item.title}</span>
                  <span className="text-xs text-fg-muted">{item.body}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
