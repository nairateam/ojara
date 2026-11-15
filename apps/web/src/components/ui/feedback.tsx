import { Check, CircleX, Info, type LucideIcon, TriangleAlert } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Alerts (§7): error (#FBE4DF, circle-x, title red 13/600, body #7A2A1E), upsell (amber
 * #FBEFD8), info (#E0E3D1 + info), success (#E2F1E8). Radius 10, padding 14.
 */
const TONES = {
  error: {
    wrap: 'bg-danger-soft',
    icon: CircleX,
    iconCls: 'text-danger',
    title: 'text-danger',
    body: 'text-danger-ink',
  },
  upsell: {
    wrap: 'bg-attention-soft',
    icon: TriangleAlert,
    iconCls: 'text-warning',
    title: 'text-warning',
    body: 'text-fg-muted',
  },
  info: {
    wrap: 'bg-surface-muted',
    icon: Info,
    iconCls: 'text-fg',
    title: 'text-fg',
    body: 'text-fg-muted',
  },
  success: {
    wrap: 'bg-success-soft',
    icon: Check,
    iconCls: 'text-success',
    title: 'text-success',
    body: 'text-fg-muted',
  },
} satisfies Record<
  string,
  { wrap: string; icon: LucideIcon; iconCls: string; title: string; body: string }
>;

export function Alert({
  tone = 'info',
  title,
  icon,
  action,
  className,
  children,
}: {
  tone?: keyof typeof TONES;
  title?: React.ReactNode;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const t = TONES[tone];
  const Icon = icon ?? t.icon;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-[10px] p-3.5', t.wrap, className)}
    >
      <Icon className={cn('mt-0.5 size-[18px] shrink-0', t.iconCls)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? <p className={cn('text-ui font-semibold', t.title)}>{title}</p> : null}
        {children ? <div className={cn('text-xs leading-[18px]', t.body)}>{children}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Dark toast (00.07 success): #1C1B18, radius 10, green check circle, title, body, action. */
export function Toast({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-3 rounded-[10px] bg-toast px-3.5 py-3 shadow-toast',
        className,
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success">
        <Check className="size-3.5 text-white" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-ui font-semibold text-surface">{title}</span>
        {body ? <span className="text-xs text-fg-on-dark">{body}</span> : null}
      </span>
      {action ? <span className="text-ui font-semibold text-paper">{action}</span> : null}
    </div>
  );
}

/** Usage / progress bar (plan usage, free-delivery progress). */
export function ProgressBar({
  value,
  max = 100,
  tone = 'forest',
  className,
}: {
  value: number;
  max?: number;
  tone?: 'forest' | 'warning' | 'success' | 'store';
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = {
    forest: 'bg-forest',
    warning: 'bg-warning',
    success: 'bg-success',
    store: 'bg-store-primary',
  }[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-1.5 overflow-hidden rounded-[3px] bg-surface-muted', className)}
    >
      <div className={cn('h-full rounded-[3px]', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Initials avatar: #E0E3D1 circle, forest initials (28 in tables, 34 in the top bar). */
export function Avatar({
  name,
  size = 28,
  className,
}: {
  name: string;
  size?: 24 | 28 | 32 | 34 | 40 | 48;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: size <= 28 ? 11 : 13 }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-semibold text-fg',
        className,
      )}
    >
      {initials}
    </span>
  );
}

/** Coloured round icon (notifications, activity feeds): 34px circle with a tinted background. */
export function IconCircle({
  icon: Icon,
  tone = 'neutral',
  size = 34,
  className,
}: {
  icon: LucideIcon;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
  size?: 28 | 32 | 34 | 40;
  className?: string;
}) {
  const cls = {
    neutral: 'bg-surface-muted text-fg',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    warning: 'bg-attention-soft text-warning',
    info: 'bg-info-soft text-info',
    dark: 'bg-forest text-paper',
  }[tone];
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        cls,
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
    </span>
  );
}
