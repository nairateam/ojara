'use client';

import { KeyRound, ShieldCheck, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { ApiRequestError } from '@/lib/api/client';
import { fetchCurrentUser, signInWithEmail, verifyTwoFactorCode } from '@/lib/api/browser';
import { altButtonClass, OrDivider } from './auth-shell';
import { textField } from './form-data';
import { FormField } from './form-field';
import { GoogleButton } from './google-button';
import { PasswordInput } from './password-input';

function signInErrorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    if (err.status === 429) return 'Too many attempts. Please wait a minute and try again.';
    if (err.code === 'EMAIL_NOT_VERIFIED' || err.status === 403) {
      return 'Please confirm your email first. We’ve sent you a new link.';
    }
  }
  return 'That email and password don’t match. Try again or reset your password.';
}

function codeErrorMessage(err: unknown): string {
  if (err instanceof ApiRequestError && err.status === 429) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  return 'That code didn’t work. Check your authenticator app and try again.';
}

/**
 * 02.01 sign-in against Better Auth (POST /v1/auth/sign-in/email), then — for accounts with
 * two-factor — a second step for the authenticator (or backup) code.
 * `variant="admin"`: no Google or SMS (admins sign in with password + 2FA only); admins without
 * 2FA yet are sent to /security to set it up.
 */
export function LoginForm({
  redirectTo = '/',
  variant = 'merchant',
  googleSignIn = false,
  initialError,
}: {
  redirectTo?: string;
  variant?: 'merchant' | 'admin';
  googleSignIn?: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'code'>('password');
  const [codeKind, setCodeKind] = useState<'totp' | 'backup'>('totp');
  const [error, setError] = useState<string | undefined>(initialError);
  const [notice, setNotice] = useState<string>();
  const [pending, setPending] = useState(false);

  async function finish() {
    if (variant === 'admin') {
      const user = await fetchCurrentUser().catch(() => null);
      if (user && !user.twoFactorEnabled) {
        router.push('/security');
        return;
      }
    }
    router.push(redirectTo);
    router.refresh();
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const { twoFactorRequired } = await signInWithEmail(
        textField(data, 'email').trim(),
        textField(data, 'password'),
        data.get('remember') !== null,
      );
      if (twoFactorRequired) setStep('code');
      else await finish();
    } catch (err) {
      setError(signInErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function onCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(undefined);
    try {
      await verifyTwoFactorCode(textField(data, 'code'), codeKind);
      await finish();
    } catch (err) {
      setError(codeErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  if (step === 'code') {
    const isBackup = codeKind === 'backup';
    return (
      <form onSubmit={(e) => void onCodeSubmit(e)} className="flex flex-col gap-[18px]" noValidate>
        <div className="flex items-start gap-3 rounded-[10px] bg-surface-muted p-3.5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-fg" aria-hidden />
          <p className="text-ui leading-[19px] text-fg-muted">
            {isBackup
              ? 'Enter one of the backup codes you saved when you set up two-step sign-in.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>
        <FormField id="code" label={isBackup ? 'Backup code' : 'Authentication code'} error={error}>
          <Input
            id="code"
            name="code"
            size="lg"
            required
            autoFocus
            autoComplete="one-time-code"
            inputMode={isBackup ? 'text' : 'numeric'}
            pattern={isBackup ? undefined : '[0-9]{6}'}
            maxLength={isBackup ? 32 : 6}
            placeholder={isBackup ? 'xxxxx-xxxxx' : '123456'}
            className="font-mono tracking-[0.2em]"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'code-error' : undefined}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full text-[15px]" disabled={pending}>
          {pending ? 'Checking…' : 'Verify and log in'}
        </Button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 text-ui font-semibold text-fg hover:underline"
          onClick={() => {
            setCodeKind(isBackup ? 'totp' : 'backup');
            setError(undefined);
          }}
        >
          <KeyRound className="size-3.5" aria-hidden />
          {isBackup ? 'Use your authenticator app instead' : 'Use a backup code instead'}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => void onPasswordSubmit(e)}
      className="flex flex-col gap-[18px]"
      noValidate
    >
      <FormField id="email" label="Email">
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
      {variant === 'merchant' ? (
        <label className="flex cursor-pointer items-center gap-2.5 text-ui text-fg-muted">
          <Checkbox size={18} name="remember" defaultChecked />
          Keep me logged in on this device
        </label>
      ) : null}
      <Button type="submit" size="lg" className="w-full text-[15px]" disabled={pending}>
        {pending ? 'Logging in…' : 'Log in'}
      </Button>
      {variant === 'merchant' ? (
        <>
          <OrDivider />
          {googleSignIn ? <GoogleButton /> : null}
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
