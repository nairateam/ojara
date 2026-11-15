import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Empty state from 00.07 ("No orders yet"): centred on a surface, 52px icon box (#E0E3D1,
 * radius 14, 24px icon), Bricolage 18/600 title, 13/20 body (300 wide), optional action.
 */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-line bg-surface px-6 py-10 text-center',
        className,
      )}
    >
      <span className="flex size-[52px] items-center justify-center rounded-[14px] bg-surface-muted">
        <Icon className="size-6 text-fg" aria-hidden />
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="max-w-[300px] text-ui leading-5 text-fg-muted">{body}</div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
