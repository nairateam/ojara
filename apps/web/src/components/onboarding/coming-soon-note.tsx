import { Hourglass } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * For onboarding steps whose feature isn't built yet: says so plainly, so the sample content
 * below isn't mistaken for the merchant's data. Continue still records progress.
 */
export function ComingSoonNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-[10px] border border-line bg-surface-muted px-3.5 py-3"
    >
      <Hourglass className="mt-0.5 size-[18px] shrink-0 text-fg-muted" aria-hidden />
      <p className="text-ui text-fg">
        <span className="font-semibold">Coming soon. </span>
        {children}
      </p>
    </div>
  );
}
