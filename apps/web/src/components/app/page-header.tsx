import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * App page header (§2): Bricolage 28/600 title, Inter 14 subtitle, actions on the right
 * (gap 10). Optional back link above the title and badge next to it.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  back,
  badge,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        {back ? (
          <Link
            href={back.href}
            className="mb-1 inline-flex items-center gap-1.5 text-ui text-fg-muted"
          >
            <ArrowLeft className="size-3.5" aria-hidden /> {back.label}
          </Link>
        ) : null}
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[22px] font-semibold tracking-display md:text-h-page">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}
