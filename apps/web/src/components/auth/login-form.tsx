'use client';

import { Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { ApiRequestError } from '@/lib/api/client';
import { signInWithEmail } from '@/lib/api/browser';
import { altButtonClass, OrDivider } from './auth-shell';
import { textField } from './form-data';
import { FormField } from './form-field';
import { PasswordInput } from './password-input';

/**
 * 02.01 sign-in against Better Auth (POST /v1/auth/sign-in/email). The SMS one-time-code button
 * is visual only until an SMS provider is wired up.
 */
export function LoginForm({
  redirectTo = '/',
  showSmsOption = true,
}: {
  redirectTo?: string;
  showSmsOption?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(undefined);
    setNotice(undefined);
    try {
      await signInWithEmail(textField(data, 'email').trim(), textField(data, 'password'));
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.status === 403
          ? 'Please confirm your email first. We sent you a link.'
          : 'That email and password don’t match. Try again or reset your password.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-[18px]" noValidate>
      <FormField id="email" label="Email or phone number">
        <Input
          id="email"
          name="email"
          type="email"
          size="lg"
          autoComplete="username"
          required
          placeholder="you@business.com"
        />
      </FormField>
      <FormField
        id="password"
        label="Password"
        error={error}
        aside={
          <Link href="/reset-password" className="text-xs font-semibold text-fg hover:underline">
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'password-error' : undefined}
        />
      </FormField>
      <label className="flex cursor-pointer items-center gap-2.5 text-ui text-fg-muted">
        <Checkbox size={18} name="remember" defaultChecked />
        Keep me logged in on this device
      </label>
      <Button type="submit" size="lg" className="w-full text-[15px]" disabled={pending}>
        {pending ? 'Logging in…' : 'Log in'}
      </Button>
      {showSmsOption ? (
        <>
          <OrDivider />
          <button
            type="button"
            className={altButtonClass}
            onClick={() =>
              setNotice('Log in with a code by SMS is coming soon. Use your email for now.')
            }
          >
            <Smartphone className="size-[17px]" aria-hidden /> Send me a one-time code by SMS
          </button>
          {notice ? (
            <p className="text-center text-xs text-fg-muted" role="status">
              {notice}
            </p>
          ) : null}
        </>
      ) : null}
    </form>
  );
}
