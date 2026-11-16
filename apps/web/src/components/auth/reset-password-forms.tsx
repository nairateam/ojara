'use client';

import { MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiRequestError } from '@/lib/api/client';
import { requestPasswordReset, resetPassword } from '@/lib/api/browser';
import { BREACHED_PASSWORD_MESSAGE, textField } from './form-data';
import { FormField } from './form-field';
import { PasswordInput, scorePassword, StrengthMeter } from './password-input';

/**
 * Step 1: ask for a reset link by email. The response is identical whether or not the account
 * exists, so this page can't be used to discover which emails have Ojara accounts.
 */
export function ResetRequestForm() {
  const [sentTo, setSentTo] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = textField(new FormData(event.currentTarget), 'email').trim();
    setPending(true);
    setError(undefined);
    try {
      await requestPasswordReset(email, `${window.location.origin}/reset-password/new`);
      setSentTo(email);
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.status === 429
          ? 'Too many requests. Please wait a few minutes and try again.'
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <div className="flex items-start gap-3 rounded-[10px] bg-success-soft p-3.5" role="status">
        <MailCheck className="mt-0.5 size-5 text-success" aria-hidden />
        <div className="flex flex-col gap-0.5">
          <p className="text-ui font-semibold text-success">Check your email</p>
          <p className="text-xs text-fg-muted">
            If {sentTo} has an Ojara account, we’ve sent a link to reset the password. It expires in
            one hour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-[18px]" noValidate>
      <FormField id="email" label="Email" error={error}>
        <Input
          id="email"
          name="email"
          type="email"
          size="lg"
          autoComplete="email"
          required
          placeholder="you@business.com"
          aria-invalid={error ? true : undefined}
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full text-[15px]" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  );
}

/** Step 2: the link from the email lands here with ?token=…; set a new password. */
export function NewPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [score, setScore] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = textField(data, 'password');
    if (password !== textField(data, 'confirm')) {
      setError('The two passwords don’t match.');
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      await resetPassword(token, password);
      router.push('/login?reset=done');
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === 'PASSWORD_COMPROMISED') {
        setError(BREACHED_PASSWORD_MESSAGE);
      } else if (err instanceof ApiRequestError && err.code === 'INVALID_TOKEN') {
        setError('This reset link has expired or was already used. Request a new one.');
      } else {
        setError('We couldn’t change your password. Please try again.');
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-[18px]" noValidate>
      <FormField id="password" label="New password">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="At least 8 characters"
          onChange={(e) => setScore(scorePassword(e.currentTarget.value))}
        />
        <StrengthMeter score={score} />
      </FormField>
      <FormField id="confirm" label="Confirm new password" error={error}>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'confirm-error' : undefined}
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full text-[15px]" disabled={pending}>
        {pending ? 'Saving…' : 'Save new password'}
      </Button>
      <p className="text-center text-xs text-fg-subtle">
        Changing your password signs you out on every other device.
      </p>
    </form>
  );
}
