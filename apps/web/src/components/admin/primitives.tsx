import { PLANS, type PlanKey, STORE_STATUS_LABELS, type StoreStatus } from '@ojara/shared';
import { ChevronDown, EyeOff, Search } from 'lucide-react';
import type * as React from 'react';
import { StatusPill, Tag } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminKpi, SubscriptionStatus, Tone } from '@/mock/admin';

const NOTE_TONE: Record<Tone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  muted: 'text-fg-subtle',
  default: 'text-fg-muted',
};

/**
 * Admin KPI strip (06.01/02/04): one surface card split by 1px dividers. Label Inter 12, value
 * Bricolage 24/600 (22 on Merchant detail), coloured 12/500 note. Wraps to 2 columns on small
 * screens.
 */
export function AdminKpiStrip({
  items,
  size = 'default',
  className,
}: {
  items: AdminKpi[];
  size?: 'default' | 'sm';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr',
        className,
      )}
    >
      {items.map((kpi, i) => (
        <div
          key={kpi.label}
          className={cn(
            'flex min-w-0 flex-col bg-surface',
            size === 'sm' ? 'gap-1 px-[18px] py-3.5' : 'gap-1.5 px-5 py-4',
            items.length % 2 === 1 && i === items.length - 1 && 'col-span-2 lg:col-span-1',
          )}
        >
          <span className="text-xs text-fg-muted">{kpi.label}</span>
          <span
            className={cn(
              'font-display font-semibold tracking-[-0.4px]',
              size === 'sm' ? 'text-[22px] leading-7' : 'text-h-panel',
              kpi.valueTone === 'danger' ? 'text-danger' : 'text-fg',
            )}
          >
            {kpi.value}
          </span>
          {kpi.note ? (
            <span className={cn('text-xs font-medium', NOTE_TONE[kpi.noteTone ?? 'default'])}>
              {kpi.note}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Admin plan badge: Free grey, Starter blue, Professional grey/forest. No dot, padding 3/9. */
export function PlanBadge({ plan, className }: { plan: PlanKey; className?: string }) {
  const tone = plan === 'STARTER' ? 'info' : plan === 'PROFESSIONAL' ? 'strong' : 'neutral';
  return (
    <StatusPill tone={tone} dot={false} className={className}>
      {PLANS[plan].name}
    </StatusPill>
  );
}

const STORE_TONES = {
  PUBLISHED: 'success',
  SUSPENDED: 'danger',
  DRAFT: 'warning',
  DISABLED: 'neutral',
} as const satisfies Record<StoreStatus, string>;

/** Store status in admin wording (Live / Suspended / Onboarding / Closed). */
export function StoreStatusBadge({
  status,
  label,
  className,
}: {
  status: StoreStatus;
  /** Override for case-specific wording, e.g. "Suspended pending review". */
  label?: string;
  className?: string;
}) {
  return (
    <StatusPill tone={STORE_TONES[status]} className={className}>
      {label ?? STORE_STATUS_LABELS[status]}
    </StatusPill>
  );
}

const SUB_STATUS = {
  ACTIVE: { tone: 'success', label: 'Active' },
  PAST_DUE: { tone: 'danger', label: 'Past due' },
  CANCELLING: { tone: 'warning', label: 'Cancelling' },
} as const satisfies Record<SubscriptionStatus, { tone: string; label: string }>;

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  const s = SUB_STATUS[status];
  return <StatusPill tone={s.tone}>{s.label}</StatusPill>;
}

/** Severity tag on abuse cases: High red, Medium amber (10/700). */
export function SeverityTag({ severity }: { severity: 'High' | 'Medium' }) {
  return <Tag tone={severity === 'High' ? 'danger' : 'warning'}>{severity}</Tag>;
}

/** Coloured store tile with the initial (each store's own colour in the admin tables). */
export function MerchantLogo({
  name,
  bg,
  ink = '#F5F6EE',
  size = 32,
  className,
}: {
  name: string;
  bg: string;
  ink?: string;
  size?: 32 | 36 | 52;
  className?: string;
}) {
  const radius = size >= 52 ? 12 : 8;
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        background: bg,
        color: ink,
        borderRadius: radius,
        fontSize: size >= 52 ? 26 : size >= 36 ? 17 : 15,
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-display font-bold',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** Toolbar filter chip ("Plan: All ⌄"): visual only until filtering is wired. */
export function FilterButton({
  children,
  size = 'sm',
  className,
}: {
  children: React.ReactNode;
  size?: 'sm' | 'default';
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface font-medium text-fg hover:bg-selected',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'h-8 px-2.5 text-ui',
        className,
      )}
    >
      {children}
      <ChevronDown className="size-3.5 text-fg-muted" aria-hidden />
    </button>
  );
}

/** Compact search field (table toolbars, audit log filters): 16px search icon, 13px text. */
export function SearchBox({
  placeholder,
  label,
  tone = 'paper',
  className,
}: {
  placeholder: string;
  label: string;
  tone?: 'paper' | 'surface';
  className?: string;
}) {
  return (
    <label
      className={cn(
        'flex h-8 items-center gap-2 rounded-md border border-line px-3 has-focus-visible:border-forest has-focus-visible:shadow-focus',
        tone === 'paper' ? 'bg-paper' : 'bg-surface',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-ui text-fg outline-none placeholder:text-fg-subtle"
      />
    </label>
  );
}

/** Admin card: surface, 1px border, radius 12, padding 20. */
export function AdminCard({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('flex flex-col gap-4 rounded-lg border border-line bg-surface p-5', className)}
      {...props}
    />
  );
}

export function AdminCardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 className={cn('text-title font-semibold text-fg', className)} {...props} />;
}

/** eye-off privacy footer used on admin tables and panels. */
export function PrivacyNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('flex items-start gap-1.5 text-xs text-fg-muted', className)}>
      <EyeOff className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </span>
  );
}

/** Kobo → "₦6.9M", "₦1.28M", "₦184.2M", "₦120k" (admin tables and charts). */
export function formatKoboCompact(kobo: number, unit?: 'M'): string {
  const naira = kobo / 100;
  const abs = Math.abs(naira);
  const sign = naira < 0 ? '−' : '';
  const trim = (n: number, d: number) => {
    const s = n.toFixed(d);
    return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
  };
  if (unit === 'M' || abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}₦${trim(m, m >= 100 ? 1 : 2)}M`;
  }
  if (abs >= 1_000) return `${sign}₦${trim(abs / 1_000, 1)}k`;
  return `${sign}₦${trim(abs, 0)}`;
}
