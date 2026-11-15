'use client';

import { Check, Copy } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

/** Copies `value` to the clipboard and briefly swaps the icon for a check. */
export function CopyButton({
  value,
  label,
  className,
  iconClassName,
  children,
}: {
  value: string;
  label: string;
  className?: string;
  iconClassName?: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      aria-label={children ? undefined : label}
      title={label}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className={className}
    >
      <Icon className={cn('shrink-0', iconClassName)} aria-hidden />
      {children}
    </button>
  );
}
