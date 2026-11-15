'use client';

import { ArrowRight, MailCheck } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { ApiRequestError } from '@/lib/api/client';
import { signUpWithEmail } from '@/lib/api/browser';
import { altButtonClass, OrDivider } from './auth-shell';
import { textField } from './form-data';
import { FormField } from './form-field';
import { PasswordInput, scorePassword, StrengthMeter } from './password-input';

/**
 * 02.02 merchant sign-up (POST /v1/auth/sign-up/email). Better Auth sends the verification email
 * via the API's email queue; the merchant must verify before logging in.
 * The phone number and "Continue with Google" are visual only (the phone is not sent anywhere yet).
 */
export function SignupForm() {
  const [error, setError] = useState<string>();
  const [termsError, setTermsError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();
  const [pending, setPending] = useState(false);
  const [score, setScore] = useState(0);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.get('terms')) {
      setTermsError('Please agree to the Terms and Seller Policy to continue.');
      return;
    }
    const email = textField(data, 'email').trim();
    setPending(true);
    setError(undefined);
    setTermsError(undefined);
    try {
      await signUpWithEmail({
        name: textField(data, 'name').trim(),
        email,
        password: textField(data, 'password'),
      });
      setSentTo(email);
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.body
          ? String(err.message)
          : 'Something went wrong. Please try again.',
      );
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
          <p className="text-xs text-fg-muted">
            We sent a confirmation link to {sentTo}. Open it to finish setting up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-[18px]" noValidate>
      <FormField id="name" label="Your name">
        <Input
          id="name"
          name="name"
          size="lg"
          autoComplete="name"
          required
          placeholder="Adùnní Ogunleye"
        />
      </FormField>
      <FormField id="phone" label="Phone number">
        <Input
          id="phone"
          name="phone"
          type="tel"
          size="lg"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="803 555 0144"
          prefix={
            <span className="-mr-px flex items-center gap-1.5 border-r border-line pr-2.5 text-fg-muted">
              <span aria-hidden>🇳🇬</span> +234
            </span>
          }
        />
      </FormField>
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
      <FormField id="password" label="Password" error={error}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          placeholder="At least 8 characters"
          onChange={(e) => setScore(scorePassword(e.currentTarget.value))}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'password-error' : undefined}
        />
        <StrengthMeter score={score} />
      </FormField>
      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-2.5 text-ui leading-[19px] text-fg-muted">
          <Checkbox
            size={18}
            name="terms"
            className="mt-px"
            onChange={() => setTermsError(undefined)}
            aria-invalid={termsError ? true : undefined}
          />
          <span>
            I agree to Ojara’s{' '}
            <a href="https://ojara.store/terms" className="hover:text-fg hover:underline">
              Terms
            </a>
            ,{' '}
            <a href="https://ojara.store/seller-policy" className="hover:text-fg hover:underline">
              Seller Policy
            </a>{' '}
            and list of{' '}
            <a
              href="https://ojara.store/prohibited-products"
              className="hover:text-fg hover:underline"
            >
              prohibited products
            </a>
            .
          </span>
        </label>
        {termsError ? <p className="text-xs text-danger">{termsError}</p> : null}
      </div>
      <Button type="submit" size="lg" className="w-full text-[15px]" disabled={pending}>
        {pending ? (
          'Creating your store…'
        ) : (
          <>
            Create free account <ArrowRight />
          </>
        )}
      </Button>
      <OrDivider />
      <button
        type="button"
        className={altButtonClass}
        onClick={() => setNotice('Google sign-up is coming soon. Use your email for now.')}
      >
        <span
          aria-hidden
          className="flex size-[18px] items-center justify-center rounded-full bg-[#4285F4] text-[11px] font-bold text-surface"
        >
          G
        </span>
        Continue with Google
      </button>
      {notice ? (
        <p className="text-center text-xs text-fg-muted" role="status">
          {notice}
        </p>
      ) : null}
    </form>
  );
}
