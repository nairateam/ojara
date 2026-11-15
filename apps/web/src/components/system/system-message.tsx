import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';

/**
 * Full-page system message (404 / 503). Not in the designs: built from the Terra tokens and the
 * 00.07 "empty state" pattern (52px icon box on #E0E3D1, Bricolage title, 13px body).
 */
export function SystemMessage({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-paper px-4 py-16">
      <Wordmark size="lg" />
      <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-line bg-surface px-8 py-12 text-center">
        <span className="flex size-[52px] items-center justify-center rounded-[14px] bg-surface-muted">
          <Icon className="size-6 text-fg" aria-hidden />
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-display">{title}</h1>
        <div className="max-w-[320px] text-ui text-fg-muted">{body}</div>
        {action ? <div className="pt-2">{action}</div> : null}
      </section>
    </main>
  );
}
