'use client';

import { Check, Copy, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { type FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { ApiRequestError } from '@/lib/api/client';
import { enableTwoFactor, verifyTwoFactorCode } from '@/lib/api/browser';
import { textField } from './form-data';
import { FormField } from './form-field';
import { PasswordInput } from './password-input';

type Step =
  | { kind: 'password' }
  | { kind: 'scan'; totpURI: string; backupCodes: string[] }
  | { kind: 'done' };

/** The secret from an otpauth:// URI, for people who can't scan the QR code. */
function secretFrom(uri: string): string {
  return new URL(uri).searchParams.get('secret') ?? '';
}

/**
 * Authenticator-app enrolment (Better Auth twoFactor plugin):
 * 1. confirm password → POST /two-factor/enable returns an otpauth URI + backup codes,
 * 2. scan the QR code and save the backup codes,
 * 3. enter a code → POST /two-factor/verify-totp turns two-factor on.
 * Required for platform admins; optional for merchants (settings page, later).
 */
export function TwoFactorSetup({ doneHref = '/' }: { doneHref?: string }) {
  const [step, setStep] = useState<Step>({ kind: 'password' });
  const [qrSvg, setQrSvg] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (step.kind !== 'scan') return;
    void QRCode.toString(step.totpURI, {
      type: 'svg',
      margin: 0,
      color: { dark: '#333A2F', light: '#F5F6EE' },
    }).then(setQrSvg);
  }, [step]);

  async function onPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      const res = await enableTwoFactor(textField(new FormData(event.currentTarget), 'password'));
      setStep({ kind: 'scan', totpURI: res.totpURI, backupCodes: res.backupCodes });
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.status === 401
          ? 'Please log in again, then retry.'
          : 'That password is not correct.',
      );
    } finally {
      setPending(false);
    }
  }

  async function onCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      await verifyTwoFactorCode(textField(new FormData(event.currentTarget), 'code'));
      setStep({ kind: 'done' });
    } catch {
      setError('That code didn’t work. Check the time on your phone and try the newest code.');
    } finally {
      setPending(false);
    }
  }

  if (step.kind === 'done') {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success" title="Two-step sign-in is on">
          From now on you’ll enter a code from your authenticator app after your password.
        </Alert>
        <Button asChild className="w-fit">
          <Link href={doneHref}>Continue</Link>
        </Button>
      </div>
    );
  }

  if (step.kind === 'password') {
    return (
      <form
        onSubmit={(e) => void onPassword(e)}
        className="flex max-w-[420px] flex-col gap-4"
        noValidate
      >
        <FormField id="password" label="Confirm your password" error={error}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            aria-invalid={error ? true : undefined}
          />
        </FormField>
        <Button type="submit" className="w-fit" disabled={pending}>
          <ShieldCheck /> {pending ? 'Starting…' : 'Set up authenticator app'}
        </Button>
      </form>
    );
  }

  const secret = secretFrom(step.totpURI);
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="flex flex-col gap-3">
        <div
          className="aspect-square w-full max-w-[240px] rounded-lg border border-line bg-surface p-4 [&_svg]:size-full"
          role="img"
          aria-label="QR code to add Ojara to your authenticator app"
          // QRCode.toString returns static SVG markup generated locally from the otpauth URI.
          dangerouslySetInnerHTML={qrSvg ? { __html: qrSvg } : undefined}
        />
        <p className="text-xs text-fg-muted">
          Can’t scan? Enter this key: <code className="font-mono break-all text-fg">{secret}</code>
        </p>
      </div>
      <div className="flex flex-col gap-5">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-ui text-fg-muted">
          <li>Open Google Authenticator, Microsoft Authenticator or 1Password.</li>
          <li>Scan the QR code (or type the key).</li>
          <li>Save the backup codes below somewhere safe, then enter the 6-digit code.</li>
        </ol>
        <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-ui font-semibold">Backup codes</span>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() =>
                void navigator.clipboard
                  .writeText(step.backupCodes.join('\n'))
                  .then(() => setCopied(true))
              }
            >
              {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <ul className="grid grid-cols-2 gap-1 font-mono text-ui">
            {step.backupCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <p className="text-xs text-fg-subtle">Each code works once. They won’t be shown again.</p>
        </div>
        <form
          onSubmit={(e) => void onCode(e)}
          className="flex max-w-[320px] flex-col gap-3"
          noValidate
        >
          <FormField id="code" label="6-digit code" error={error}>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              className="font-mono tracking-[0.2em]"
              aria-invalid={error ? true : undefined}
            />
          </FormField>
          <Button type="submit" className="w-fit" disabled={pending}>
            {pending ? 'Checking…' : 'Turn on two-step sign-in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
