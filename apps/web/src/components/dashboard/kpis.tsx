import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DashKpi {
  label: string;
  value: string;
  valueTone?: 'default' | 'warning' | 'danger';
  /** Delta: up = green + trending-up, down = red + trending-down, muted = grey, no icon. */
  delta?: { value: string; tone: 'up' | 'down' | 'muted'; icon?: boolean; weight?: 'normal' };
  context?: string;
  /** Mobile (04.01) delta text, e.g. "2.5% convert". */
  mobileDelta?: string;
}

const VALUE_TONE = { default: 'text-fg', warning: 'text-warning', danger: 'text-danger' };
const DELTA_TONE = { up: 'text-success', down: 'text-danger', muted: 'text-fg-muted' };

/**
 * KPI strip (03.01 / 03.06 / 03.08): one card split into cells with 1px dividers. `size="lg"` is
 * the home strip (padding 18/22, label 13, value 28); `md` is Inventory/Reports (16/20, 12, 24).
 * Cells wrap to 2 columns below lg.
 */
export function KpiStripCard({
  items,
  size = 'lg',
  className,
}: {
  items: DashKpi[];
  size?: 'lg' | 'md';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 overflow-hidden rounded-lg border border-line bg-surface lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none',
        className,
      )}
    >
      {items.map((kpi, i) => (
        <div
          key={kpi.label}
          className={cn(
            'flex min-w-0 flex-col border-line',
            i % 2 === 0 && 'border-r',
            i < items.length - 2 && 'border-b',
            'lg:border-b-0 lg:not-last:border-r lg:last:border-r-0',
            size === 'lg' ? 'gap-2 px-[22px] py-[18px]' : 'gap-1.5 px-5 py-4',
          )}
        >
          <span className={cn('text-fg-muted', size === 'lg' ? 'text-[13px]/[19px]' : 'text-xs')}>
            {kpi.label}
          </span>
          <span
            className={cn(
              'truncate font-display font-semibold',
              size === 'lg' ? 'text-[28px]/[34px] tracking-display' : 'text-[24px]/[30px]',
              VALUE_TONE[kpi.valueTone ?? 'default'],
            )}
          >
            {kpi.value}
          </span>
          {kpi.delta || kpi.context ? (
            <span className="flex flex-wrap items-center gap-x-1.5 text-xs">
              {kpi.delta ? (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    kpi.delta.weight === 'normal' ? 'font-normal' : 'font-semibold',
                    DELTA_TONE[kpi.delta.tone],
                  )}
                >
                  {kpi.delta.icon !== false && kpi.delta.tone === 'up' ? (
                    <TrendingUp className="size-3.5" aria-hidden />
                  ) : null}
                  {kpi.delta.icon !== false && kpi.delta.tone === 'down' ? (
                    <TrendingDown className="size-3.5" aria-hidden />
                  ) : null}
                  {kpi.delta.value}
                </span>
              ) : null}
              {kpi.context ? <span className="text-fg-subtle">{kpi.context}</span> : null}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** 04.01 mobile KPI grid: one radius-14 card, 2×2 cells (padding 14), value Bricolage 22/600. */
export function KpiGridCard({ items, className }: { items: DashKpi[]; className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 overflow-hidden rounded-[14px] border border-line bg-surface',
        className,
      )}
    >
      {items.map((kpi, i) => (
        <div
          key={kpi.label}
          className={cn(
            'flex min-w-0 flex-col gap-1 border-line p-3.5',
            i % 2 === 0 && 'border-r',
            i >= 2 && 'border-t',
          )}
        >
          <span className="text-xs text-fg-muted">{kpi.label}</span>
          <span className="truncate font-display text-[22px] font-semibold">{kpi.value}</span>
          {kpi.delta ? (
            <span className={cn('text-xs font-semibold', DELTA_TONE[kpi.delta.tone])}>
              {kpi.mobileDelta ?? kpi.delta.value}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
