'use client';

import type { PayoutAccountDto, PayoutBankDto } from '@ojara/shared';
import { BadgeCheck, CircleAlert, LoaderCircle } from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { continueFromPayments } from '@/app/(onboarding)/dash/onboarding/actions';
import { Input } from '@/components/ui/input';
import { resolvePayoutAccount } from '@/lib/api/browser';
import { ApiRequestError } from '@/lib/api/client';
import { NativeSelect, OnbField } from './fields';
import { FieldError } from './onboarding-form';

type Lookup =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'found'; name: string }
  | { kind: 'error'; message: string };

/**
 * "Get paid" fields (02.07): bank + 10-digit account number, with the account name looked up by
 * Paystack as soon as both are filled in. The server looks the name up again when saving.
 */
export function PayoutFields({
  storeId,
  banks,
  account,
}: {
  storeId: string;
  banks: PayoutBankDto[];
  account: PayoutAccountDto;
}) {
  const [editing, setEditing] = useState(!account.connected);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [result, setResult] = useState<{ key: string; lookup: Lookup } | null>(null);

  const digits = accountNumber.replace(/\D/g, '');
  const key = `${bankCode}:${digits}`;
  const ready = Boolean(bankCode) && digits.length === 10;
  const lookup: Lookup = !ready
    ? { kind: 'idle' }
    : result?.key === key
      ? result.lookup
      : { kind: 'checking' };

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      resolvePayoutAccount(storeId, bankCode, digits, controller.signal)
        .then((r) => setResult({ key, lookup: { kind: 'found', name: r.accountName } }))
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setResult({
            key,
            lookup: {
              kind: 'error',
              message:
                err instanceof ApiRequestError
                  ? err.message
                  : 'Couldn’t check the account. Try again.',
            },
          });
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [ready, storeId, bankCode, digits, key]);

  if (!editing) {
    return (
      <div
        className="flex items-center gap-3 rounded-[10px] bg-success-soft px-3.5 py-3 text-success"
        role="status"
      >
        <input type="hidden" name="connected" value="1" />
        <BadgeCheck className="size-[18px] shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-ui font-bold tracking-[0.3px]">{account.accountName}</span>
          <span className="text-xs">
            {account.bankName} ••{account.accountLast4} · payouts are set up.
          </span>
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="shrink-0 text-xs font-semibold hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <>
      {account.connected ? <input type="hidden" name="connected" value="1" /> : null}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <OnbField label="Bank" htmlFor="bank">
          <NativeSelect
            id="bank"
            name="bankCode"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
          >
            <option value="" disabled>
              Choose your bank
            </option>
            {banks.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </NativeSelect>
          <FieldError name="bankCode" />
        </OnbField>
        <OnbField label="Account number" htmlFor="account-number">
          <Input
            id="account-number"
            name="accountNumber"
            size="lg"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            placeholder="10 digits"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            className="tracking-[0.5px]"
            aria-invalid={lookup.kind === 'error' || undefined}
          />
          <FieldError name="accountNumber" />
        </OnbField>
      </div>

      {lookup.kind === 'checking' ? (
        <p className="flex items-center gap-2 text-ui text-fg-muted" aria-live="polite">
          <LoaderCircle className="size-4 animate-spin" aria-hidden /> Checking the account name…
        </p>
      ) : lookup.kind === 'found' ? (
        <div
          className="flex items-center gap-3 rounded-[10px] bg-success-soft px-3.5 py-3 text-success"
          role="status"
        >
          <BadgeCheck className="size-[18px] shrink-0" aria-hidden />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-ui font-bold tracking-[0.3px]">{lookup.name}</span>
            <span className="text-xs">
              Account name from your bank. If this isn’t you, check the number.
            </span>
          </span>
        </div>
      ) : lookup.kind === 'error' ? (
        <p role="alert" className="flex items-center gap-2 text-ui text-danger">
          <CircleAlert className="size-4 shrink-0" aria-hidden /> {lookup.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {account.connected ? (
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setBankCode('');
              setAccountNumber('');
            }}
            className="text-ui font-semibold text-fg hover:underline"
          >
            Keep {account.bankName} ••{account.accountLast4}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => startTransition(() => void continueFromPayments())}
            className="text-ui font-semibold text-fg-muted hover:text-fg hover:underline"
          >
            Skip for now — I’ll add my bank later
          </button>
        )}
      </div>
    </>
  );
}
