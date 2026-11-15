'use client';

import { Minus, Plus } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { StatusPill } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { InventoryRow } from '@/mock/dashboard';
import { Thumb } from './thumb';

function stockStatus(stock: number, alertAt: number) {
  if (stock === 0) return <StatusPill tone="danger">Sold out</StatusPill>;
  if (stock <= alertAt) return <StatusPill tone="warning">Low</StatusPill>;
  return <StatusPill tone="success">In stock</StatusPill>;
}

/**
 * 03.06 stock table with +/- steppers. Edited rows show "was N" and a tinted background; the dark
 * bar at the bottom saves or discards all edits at once.
 * TODO(inventory): PATCH /v1/inventory with the edited levels.
 */
export function InventoryTable({
  rows,
  note,
  toolbar,
}: {
  rows: InventoryRow[];
  /** Context for the pending batch, e.g. "restock arrived from Abeokuta". */
  note?: string;
  toolbar: ReactNode;
}) {
  const [saved, setSaved] = useState(() => Object.fromEntries(rows.map((r) => [r.sku, r.stock])));
  const [levels, setLevels] = useState(() =>
    Object.fromEntries(rows.map((r) => [r.sku, r.draft ?? r.stock])),
  );
  const changed = rows.filter((r) => levels[r.sku] !== saved[r.sku]);
  const set = (sku: string, value: number) =>
    setLevels((l) => ({ ...l, [sku]: Math.max(0, Math.min(9999, value)) }));

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      {toolbar}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="bg-paper">
            <tr className="text-left text-[11px]/[14px] font-semibold tracking-[0.6px] text-fg-subtle uppercase">
              <th className="px-4 py-[9px] font-semibold">Variant</th>
              <th className="px-3 py-[9px] font-semibold">SKU</th>
              <th className="px-3 py-[9px] font-semibold">In stock</th>
              <th className="px-3 py-[9px] font-semibold">Alert at</th>
              <th className="px-4 py-[9px] font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const value = levels[r.sku] ?? r.stock;
              const was = saved[r.sku] ?? r.stock;
              const dirty = value !== was;
              const label = `${r.product} ${r.variant}`;
              return (
                <tr key={r.sku} className={cn('border-t border-line', dirty && 'bg-[#F8F5E9]')}>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <Thumb src={r.image} size={34} className="rounded-sm" />
                      <span className="flex min-w-0 flex-col">
                        <span className="text-[13px]/[19px] font-semibold whitespace-nowrap">
                          {r.product}
                        </span>
                        <span className="text-xs text-fg-muted">{r.variant}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px]/[14px] whitespace-nowrap text-fg-muted">
                    {r.sku}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex h-8 items-center rounded-md bg-surface',
                          dirty ? 'border-[1.5px] border-forest' : 'border border-line',
                        )}
                      >
                        <button
                          type="button"
                          aria-label={`Decrease ${label}`}
                          onClick={() => set(r.sku, value - 1)}
                          className="flex h-full w-7 items-center justify-center text-fg-subtle hover:text-fg"
                        >
                          <Minus className="size-3" aria-hidden />
                        </button>
                        <input
                          aria-label={`Stock for ${label}`}
                          inputMode="numeric"
                          value={value}
                          onChange={(e) =>
                            set(r.sku, Number(e.target.value.replace(/\D/g, '')) || 0)
                          }
                          className="w-8 bg-transparent text-center text-[13px]/[19px] font-medium outline-none"
                        />
                        <button
                          type="button"
                          aria-label={`Increase ${label}`}
                          onClick={() => set(r.sku, value + 1)}
                          className="flex h-full w-7 items-center justify-center text-fg-subtle hover:text-fg"
                        >
                          <Plus className="size-3" aria-hidden />
                        </button>
                      </span>
                      {dirty ? (
                        <span className="text-[11px]/[14px] text-warning">was {was}</span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs whitespace-nowrap text-fg-subtle">
                    ≤ {r.alertAt}
                  </td>
                  <td className="px-4 py-2.5">{stockStatus(value, r.alertAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {changed.length ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-toast px-4 py-2.5 text-[13px]/[19px] text-surface">
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="size-1.5 shrink-0 rounded-full bg-paper" aria-hidden />
            <span>
              {changed.length} unsaved stock change{changed.length === 1 ? '' : 's'}
              {note ? <span className="max-sm:hidden"> · {note}</span> : null}
            </span>
          </span>
          <button
            type="button"
            className="font-medium text-surface hover:text-paper"
            onClick={() => setLevels({ ...saved })}
          >
            Discard
          </button>
          <button
            type="button"
            className="rounded-md bg-paper px-3.5 py-1.5 font-semibold text-forest"
            onClick={() => setSaved({ ...levels })}
          >
            Save stock
          </button>
        </div>
      ) : null}
    </section>
  );
}
