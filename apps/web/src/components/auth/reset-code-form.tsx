'use client';

import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from './form-field';
import { PasswordInput } from './password-input';

const LENGTH = 6;

/**
 * 02.03 SMS reset code + new password. VISUAL ONLY: the SMS reset flow needs an SMS provider, so
 * submitting shows a notice instead of calling the API.
 */
export function ResetCodeForm() {
  const [digits, setDigits] = useState<string[]>(() => Array<string>(LENGTH).fill(''));
  const [seconds, setSeconds] = useState(42);
  const [notice, setNotice] = useState<string>();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function setDigit(i: number, value: string) {
    const d = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => prev.map((p, j) => (j === i ? d : p)));
    if (d && i < LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, j) => pasted[j] ?? ''));
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice(
      'Password reset by SMS isn’t available yet. Message us on WhatsApp and we’ll get you back in.',
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px]" noValidate>
      <fieldset className="flex gap-2.5">
        <legend className="sr-only">6-digit reset code</legend>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => setDigit(i, e.currentTarget.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={2}
            aria-label={`Digit ${i + 1}`}
            className="h-14 w-0 min-w-0 flex-1 rounded-[10px] border border-line bg-surface text-center font-display text-2xl font-semibold text-fg caret-fg outline-none focus:border-forest focus:shadow-[inset_0_0_0_0.5px_var(--ojara-forest)]"
          />
        ))}
      </fieldset>
      <p className="flex gap-1.5 text-ui">
        <span className="text-fg-muted">Didn’t get it?</span>
        {seconds > 0 ? (
          <span className="font-semibold text-fg-subtle">
            Resend in 0:{String(seconds).padStart(2, '0')}
          </span>
        ) : (
          <button
            type="button"
            className="font-semibold text-fg hover:underline"
            onClick={() => setSeconds(60)}
          >
            Resend code
          </button>
        )}
      </p>
      <FormField id="new-password" label="New password">
        <PasswordInput id="new-password" name="password" autoComplete="new-password" />
      </FormField>
      <Button type="submit" size="lg" className="w-full text-[15px]">
        Reset password and log in
      </Button>
      {notice ? (
        <p className="rounded-[10px] bg-attention-soft p-3 text-xs text-[#6E4A0E]" role="status">
          {notice}
        </p>
      ) : null}
    </form>
  );
}
