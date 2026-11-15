import { Ban, Download, Eye, Layers, LogIn, Megaphone, RotateCcw, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { FilterButton, SearchBox } from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AUDIT_LOG, type AuditIcon } from '@/mock/admin';

export const metadata: Metadata = { title: 'Audit log' };

const ICONS: Record<AuditIcon, { icon: typeof Eye; cls: string }> = {
  view: { icon: Eye, cls: 'text-info' },
  plan: { icon: Layers, cls: 'text-fg' },
  suspend: { icon: Ban, cls: 'text-danger' },
  announce: { icon: Megaphone, cls: 'text-fg' },
  refund: { icon: RotateCcw, cls: 'text-warning' },
  signin: { icon: LogIn, cls: 'text-fg' },
};

const CELL = 'h-auto px-[18px] py-3';

/** 06.09 Audit log — every admin action that touches a merchant, kept for 2 years. */
export default function AuditLogPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Audit log"
        subtitle="Every admin action that touches a merchant. Kept for 2 years and can’t be edited."
        actions={
          <Button variant="secondary">
            <Download /> Export
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          tone="surface"
          placeholder="Store, admin or action"
          label="Search the audit log"
          className="w-full sm:w-[300px]"
        />
        <FilterButton size="default">Admin: Anyone</FilterButton>
        <FilterButton size="default">Action: Any</FilterButton>
        <FilterButton size="default">Last 7 days</FilterButton>
      </div>
      <div className="flex flex-col gap-3.5">
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[900px] border-collapse text-ui">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[162px] px-[18px] py-2">When</TableHead>
                <TableHead className="w-[162px] px-[18px] py-2">Admin</TableHead>
                <TableHead className="px-[18px] py-2">Action</TableHead>
                <TableHead className="w-[182px] px-[18px] py-2">Store</TableHead>
                <TableHead className="w-[148px] px-[18px] py-2">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AUDIT_LOG.map((e) => {
                const { icon: Icon, cls } = ICONS[e.icon];
                return (
                  <TableRow key={`${e.when}-${e.action}`}>
                    <TableCell className={cn(CELL, 'text-fg-muted')}>{e.when}</TableCell>
                    <TableCell className={cn(CELL, 'font-semibold text-fg')}>{e.admin}</TableCell>
                    <TableCell className={CELL}>
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            'flex size-[26px] shrink-0 items-center justify-center rounded-full bg-surface-muted',
                            cls,
                          )}
                        >
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <span className="text-fg">{e.action}</span>
                      </span>
                    </TableCell>
                    <TableCell className={cn(CELL, 'text-fg')}>{e.store ?? '—'}</TableCell>
                    <TableCell className={cn(CELL, 'font-mono text-xs text-fg-muted')}>
                      {e.ip}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </table>
        </div>
        <p className="flex items-center gap-2 text-xs text-fg-muted">
          <ShieldCheck className="size-3.5 text-success" aria-hidden />
          Merchants get an email whenever Ojara staff view their account.
        </p>
      </div>
    </PageContainer>
  );
}
