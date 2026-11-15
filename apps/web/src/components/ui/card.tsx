import { TrendingDown, TrendingUp } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

/** Card (§2): surface, 1px border, radius 12, padding 22, no shadow. `tone="dark"` = forest promo card. */
function Card({
  className,
  tone = 'default',
  ...props
}: React.ComponentProps<'div'> & { tone?: 'default' | 'dark' }) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-4 rounded-lg p-[22px]',
        tone === 'dark' ? 'bg-forest text-paper' : 'border border-line bg-surface text-fg',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    />
  );
}

/** Inter 15/600. On dark cards the title uses Bricolage. */
function CardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3 data-slot="card-title" className={cn('text-title font-semibold', className)} {...props} />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p data-slot="card-description" className={cn('text-xs text-fg-muted', className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn(className)} {...props} />;
}

export interface Kpi {
  label: string;
  value: string;
  delta?: { value: string; direction: 'up' | 'down' };
  context?: string;
}

/** KPI strip: one card split into cells with 1px dividers; value Bricolage 28/600 (admin 24). */
function KpiStrip({
  items,
  compact = false,
  className,
}: {
  items: Kpi[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid overflow-hidden rounded-lg border border-line bg-surface sm:grid-flow-col sm:auto-cols-fr',
        className,
      )}
    >
      {items.map((kpi) => (
        <div
          key={kpi.label}
          className={cn(
            'flex flex-col gap-1 border-line not-last:border-b sm:not-last:border-r sm:not-last:border-b-0',
            compact ? 'px-5 py-4' : 'px-[22px] py-[18px]',
          )}
        >
          <span className={cn('text-fg-muted', compact ? 'text-xs' : 'text-ui')}>{kpi.label}</span>
          <span
            className={cn(
              'font-display font-semibold tracking-display',
              compact ? 'text-h-panel' : 'text-h-page',
            )}
          >
            {kpi.value}
          </span>
          {kpi.delta || kpi.context ? (
            <span className="flex items-center gap-1.5 text-xs">
              {kpi.delta ? (
                <span
                  className={cn(
                    'flex items-center gap-1 font-semibold',
                    kpi.delta.direction === 'up' ? 'text-success' : 'text-danger',
                  )}
                >
                  {kpi.delta.direction === 'up' ? (
                    <TrendingUp className="size-3.5" />
                  ) : (
                    <TrendingDown className="size-3.5" />
                  )}
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

export { Card, CardContent, CardDescription, CardHeader, CardTitle, KpiStrip };
