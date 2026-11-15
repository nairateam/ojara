'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Tiny clipboard button ("Copy" → "Copied") used on the share-your-store cards. */
export function CopyButton({
  value,
  className,
  label = 'Copy',
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cn('text-xs font-semibold', className)}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
    >
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}
