import { PLANS } from '@ojara/shared';
import { Eye, Info, Upload } from 'lucide-react';
import type { Metadata } from 'next';
import { AdminCardTitle } from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form-controls';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  PLAN_COLUMNS,
  PLAN_HISTORY,
  PLAN_MATRIX,
  PLAN_UNPUBLISHED,
  type PlanCell,
} from '@/mock/admin';

export const metadata: Metadata = { title: 'Plans' };

const GRID = 'grid grid-cols-[minmax(170px,1fr)_repeat(3,minmax(150px,182px))] items-center';

function Cell({ cell, label }: { cell: PlanCell; label: string }) {
  if (cell.kind === 'toggle') {
    return <Switch defaultChecked={cell.on} aria-label={label} className="mx-auto" />;
  }
  if (cell.kind === 'select') {
    return (
      <Select
        defaultValue={cell.value}
        aria-label={label}
        className="mx-auto w-[140px] [&_select]:h-8"
      >
        {cell.options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </Select>
    );
  }
  return (
    <input
      defaultValue={cell.value}
      aria-label={label}
      className={cn(
        'mx-auto block h-8 w-[120px] rounded-md bg-surface text-center text-ui text-fg outline-none focus-visible:border-forest focus-visible:shadow-focus',
        cell.changed
          ? 'border-[1.5px] border-forest shadow-[0_0_0_2px_var(--ojara-selected)]'
          : 'border border-line',
      )}
    />
  );
}

/** 06.05 Plans — plan/feature matrix editor; price changes apply to new subscribers only. */
export default function PlansPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Plans"
        subtitle="What each plan includes. Price changes apply to new subscribers only."
        actions={
          <>
            <Button variant="secondary">
              <Eye /> Preview pricing page
            </Button>
            <Button>
              <Upload /> Publish changes
            </Button>
          </>
        }
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-line bg-surface">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]" role="table" aria-label="Plan features">
              <div role="row" className={cn(GRID, 'bg-paper px-5 py-3')}>
                <span
                  role="columnheader"
                  className="text-2xs font-semibold tracking-[0.6px] text-fg-subtle uppercase"
                >
                  Feature
                </span>
                {PLAN_COLUMNS.map((c) => (
                  <span key={c.plan} role="columnheader" className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-fg">{PLANS[c.plan].name}</span>
                    <span className="text-2xs text-fg-subtle">{c.stores}</span>
                  </span>
                ))}
              </div>
              {PLAN_MATRIX.map((row) => (
                <div
                  key={row.feature}
                  role="row"
                  className={cn(
                    GRID,
                    'border-t border-line px-5',
                    row.cells[0].kind === 'toggle' ? 'py-2.5' : 'py-[11px]',
                  )}
                >
                  <span role="rowheader" className="text-ui text-fg">
                    {row.feature}
                  </span>
                  {row.cells.map((cell, i) => (
                    <span key={PLAN_COLUMNS[i]!.plan} role="cell" className="flex justify-center">
                      <Cell
                        cell={cell}
                        label={`${row.feature} · ${PLANS[PLAN_COLUMNS[i]!.plan].name}`}
                      />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-2 border-t border-line bg-paper px-5 py-3 text-xs text-fg-muted">
            <Info className="size-3.5 shrink-0" aria-hidden />
            *Unlimited under fair use: up to 5,000 products. Highlighted fields have unpublished
            edits.
          </p>
        </section>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-2 rounded-lg bg-attention-soft p-[18px]">
            <h2 className="text-title font-semibold text-[#6E4A0E]">{PLAN_UNPUBLISHED.title}</h2>
            <p className="text-xs leading-[18px] text-warning">{PLAN_UNPUBLISHED.body}</p>
          </section>
          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-[18px]">
            <AdminCardTitle>Change history</AdminCardTitle>
            <ul className="flex flex-col">
              {PLAN_HISTORY.map((h) => (
                <li
                  key={h.change}
                  className="flex flex-col gap-0.5 border-t border-line py-3 last:pb-0"
                >
                  <span className="text-ui font-medium text-fg">{h.change}</span>
                  <span className="text-xs text-fg-subtle">{h.by}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
