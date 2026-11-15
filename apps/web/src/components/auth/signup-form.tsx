'use client';

import { MailCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiRequestError } from '@/lib/api/client';
import { signUpWithEmail } from '@/lib/api/browser';
import { textField } from './form-data';
import { FormField } from './form-field';

/**
 * Merchant sign-up (POST /v1/auth/sign-up/email). Better Auth sends the verification email via
 * the API's email queue; the merchant must verify before logging in.
 * Phone, terms checkbox, password strength and Google from 02.02 are not built yet.
 */
export function SignupForm() {
  const [error, setError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = textField(data, 'email');
    setPending(true);
    setError(undefined);
    try {
      await signUpWithEmail({ name: textField(data, 'name'), email, password: textField(data, 'password') });
      setSentTo(email);
    } catch (err) {
      setError(err instanceof ApiRequestError && err.body ? String(err.message) : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <div className="flex items-start gap-3 rounded-[10px] bg-success-soft p-3.5">
        <MailCheck className="mt-0.5 size-5 text-success" aria-hidden />
        <div className="flex flex-col gap-0.5">
          <p className="text-ui font-semibold text-success">Check your email</p>
          <p className="text-xs text-fg-muted">We sent a confirmation link to {sentTo}. Open it to finish setting up.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-[18px]" noValidate>
      <FormField id="name" label="Your name">
        <Input id="name" name="name" size="lg" autoComplete="name" required placeholder="Adùnní Ogunleye" />
      </FormField>
      <FormField id="email" label="Email">
        <Input id="email" name="email" type="email" size="lg" autoComplete="email" required placeholder="you@business.com" />
      </FormField>
      <FormField id="password" label="Password" error={error}>
        <Input
          id="password"
          name="password"
          type="password"
          size="lg"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="At least 8 characters"
          aria-invalid={error ? true : undefined}
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Creating your store…' : 'Create free store'}
      </Button>
    </form>
  );
}
