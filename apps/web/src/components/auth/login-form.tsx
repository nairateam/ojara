'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiRequestError } from '@/lib/api/client';
import { signInWithEmail } from '@/lib/api/browser';
import { textField } from './form-data';
import { FormField } from './form-field';

/** Email + password sign-in against Better Auth (POST /v1/auth/sign-in/email). */
export function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(undefined);
    try {
      await signInWithEmail(textField(data, 'email'), textField(data, 'password'));
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
      <FormField id="email" label="Email">
        <Input
          id="email"
          name="email"
          type="email"
          size="lg"
          autoComplete="email"
          required
          placeholder="you@business.com"
        />
      </FormField>
      <FormField
        id="password"
        label="Password"
        error={error}
        aside={
          <a href="/reset-password" className="text-xs font-semibold text-fg">
            Forgot password?
          </a>
        }
      >
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          size="lg"
          autoComplete="current-password"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'password-error' : undefined}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
      </FormField>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Logging in…' : 'Log in'}
      </Button>
    </form>
  );
}
