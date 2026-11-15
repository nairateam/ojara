'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * "• Unsaved changes" hint (03.05). Listens for edits on a server-rendered form by id, so the form
 * itself stays a Server Component.
 */
export function UnsavedIndicator({
  formId,
  initiallyDirty = false,
  className,
}: {
  formId: string;
  initiallyDirty?: boolean;
  className?: string;
}) {
  const [dirty, setDirty] = useState(initiallyDirty);
  useEffect(() => {
    const form = document.getElementById(formId);
    if (!form) return;
    const mark = () => setDirty(true);
    const reset = () => setDirty(false);
    form.addEventListener('input', mark);
    form.addEventListener('change', mark);
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[role="switch"]')) mark();
    };
    form.addEventListener('click', onClick);
    form.addEventListener('reset', reset);
    return () => {
      form.removeEventListener('input', mark);
      form.removeEventListener('change', mark);
      form.removeEventListener('reset', reset);
      form.removeEventListener('click', onClick);
    };
  }, [formId]);

  if (!dirty) return null;
  return (
    <span className={cn('flex items-center gap-1.5 text-[13px]/[19px] text-fg-muted', className)}>
      <span className="size-1.5 rounded-full bg-fg-muted" aria-hidden />
      Unsaved changes
    </span>
  );
}
