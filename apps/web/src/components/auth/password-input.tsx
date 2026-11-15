'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input, type InputProps } from '@/components/ui/input';

/** Auth password input (14px, 46 high) with the trailing eye toggle from 02.01–02.03. */
export function PasswordInput(props: Omit<InputProps, 'type' | 'size' | 'suffix'>) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      size="lg"
      className={visible ? undefined : 'tracking-[2px] placeholder:tracking-normal'}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="rounded-xs text-fg-subtle hover:text-fg focus-visible:shadow-focus"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

/** Rough 0–4 password score for the four-segment meter. */
export function scorePassword(value: string): number {
  if (value.length < 8) return value.length ? 1 : 0;
  let score = 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 14) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: '', bar: '', text: '' },
  { label: 'Too weak — use 8 or more characters', bar: 'bg-danger', text: 'text-danger' },
  { label: 'Fair password', bar: 'bg-warning', text: 'text-warning' },
  { label: 'Strong password', bar: 'bg-success', text: 'text-success' },
  { label: 'Very strong password', bar: 'bg-success', text: 'text-success' },
] as const;

/** Four 4px segments (gap 4, radius 2) + 12/500 hint (02.02). */
export function StrengthMeter({ score }: { score: number }) {
  const s = STRENGTH[score] ?? STRENGTH[0];
  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-[2px] ${i <= score ? s.bar : 'bg-line'}`} />
        ))}
      </div>
      {score ? <p className={`text-xs font-medium ${s.text}`}>{s.label}</p> : null}
    </div>
  );
}
