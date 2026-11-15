import { ChevronLeft, ChevronRight } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

/**
 * Table (§7): sits inside a radius-12 card. Header row on paper with 11/600 uppercase labels;
 * rows separated by 1px borders, ~58px high; selected row #E4E7D6 + 3px forest left border.
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto rounded-lg border border-line bg-surface">
      <table data-slot="table" className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('bg-paper', className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn(className)} {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-t border-line first:border-t-0 data-[state=selected]:bg-selected data-[state=selected]:shadow-[inset_3px_0_0_var(--ojara-forest)]',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'px-5 py-[9px] text-left align-middle text-2xs font-semibold tracking-[0.6px] whitespace-nowrap text-fg-subtle uppercase',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={cn('h-[58px] px-5 py-3 align-middle', className)} {...props} />;
}

/** Pagination footer: "Showing 1–10 of 86 orders" + Previous / Next. */
function TablePagination({
  summary,
  hasPrevious,
  hasNext,
  className,
}: {
  summary: string;
  hasPrevious: boolean;
  hasNext: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between border-t border-line px-[18px] py-3', className)}>
      <span className="text-ui text-fg-muted">{summary}</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={!hasPrevious}>
          <ChevronLeft /> Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={!hasNext}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export { Table, TableBody, TableCell, TableHead, TableHeader, TablePagination, TableRow };
