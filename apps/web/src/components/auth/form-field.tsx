import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

/** Label (13/600) + control + optional red error line with circle-alert (02.01 error state). */
export function FormField({
  id,
  label,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs text-danger">
          <CircleAlert className="size-3.5" aria-hidden /> {error}
        </p>
      ) : null}
    </div>
  );
}
