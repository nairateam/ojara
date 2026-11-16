import {
  formatKobo,
  type PayoutAccountDto,
  payoutAccountSchema,
  payoutBankSchema,
} from '@ojara/shared';
import { Landmark, type LucideIcon, Receipt, ShieldCheck, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PayoutFields } from '@/components/onboarding/payout-fields';
import { ApiRequestError } from '@/lib/api/client';
import { apiGet } from '@/lib/api/session';
import { requireOnboardingStep } from '@/lib/auth/guards';
import { cn } from '@/lib/utils';
import { savePayoutAccount } from '../actions';

export const metadata: Metadata = { title: 'Set up your store · Get paid' };

/** Paystack's local card pricing: 1.5% + ₦100 (waived under ₦2,500), capped at ₦2,000. */
function paystackFeeKobo(amountKobo: number): number {
  const fee = Math.round(amountKobo * 0.015) + (amountKobo >= 250_000 ? 10_000 : 0);
  return Math.min(fee, 200_000);
}

const EXAMPLE_ORDER_KOBO = 2_700_000;

function PayoutLine({
  icon: Icon,
  label,
  sub,
  value,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  sub: string;
  value: string;
  tone?: 'default' | 'danger' | 'success';
}) {
  return (
    <li className="flex items-center gap-3 border-line py-3.5 not-last:border-b first:pt-0 last:pb-0">
      <span
        className={cn(
          'flex size-[34px] shrink-0 items-center justify-center rounded-full',
          tone === 'success' ? 'bg-success-soft text-success' : 'bg-surface-muted text-fg',
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ui font-semibold text-fg">{label}</span>
        <span className="text-xs text-fg-muted">{sub}</span>
      </span>
      <span
        className={cn(
          'shrink-0 font-display font-semibold',
          tone === 'success' ? 'text-xl text-success' : 'text-base',
          tone === 'danger' ? 'text-danger' : tone === 'default' ? 'text-fg' : undefined,
        )}
      >
        {value}
      </span>
    </li>
  );
}

function PayoutExample({ account }: { account: PayoutAccountDto }) {
  const fee = paystackFeeKobo(EXAMPLE_ORDER_KOBO);
  const platform = Math.round((EXAMPLE_ORDER_KOBO * account.platformFeePercent) / 100);
  const receive = EXAMPLE_ORDER_KOBO - fee - platform;
  return (
    <aside className="flex w-full flex-col gap-4" aria-label="Payout example">
      <h2 className="text-[11px] font-semibold tracking-[0.8px] text-fg-subtle uppercase">
        How a {formatKobo(EXAMPLE_ORDER_KOBO)} order is paid out
      </h2>
      <ul className="rounded-[14px] border border-line bg-surface p-5">
        <PayoutLine
          icon={ShoppingBag}
          label="Customer pays"
          sub="Card, transfer or USSD"
          value={formatKobo(EXAMPLE_ORDER_KOBO)}
        />
        <PayoutLine
          icon={Receipt}
          label="Paystack fee"
          sub="1.5% + ₦100, capped at ₦2,000"
          value={formatKobo(-fee)}
          tone="danger"
        />
        {platform > 0 ? (
          <PayoutLine
            icon={Receipt}
            label="Ojara fee"
            sub={`${account.platformFeePercent}% of each sale`}
            value={formatKobo(-platform)}
            tone="danger"
          />
        ) : null}
        <PayoutLine
          icon={Landmark}
          label="You receive"
          sub={
            account.connected
              ? `${account.bankName} ••${account.accountLast4} · usually next business day`
              : 'Your bank account · usually next business day'
          }
          value={formatKobo(receive)}
          tone="success"
        />
      </ul>
      <div className="flex flex-col gap-1.5 rounded-lg bg-surface-muted p-4 text-fg">
        <p className="text-ui font-semibold">Your Ojara plan is billed separately</p>
        <p className="text-xs leading-[18px]">
          {account.platformFeePercent > 0
            ? `Ojara keeps ${account.platformFeePercent}% of each sale. Paid plans are a flat monthly fee.`
            : 'Ojara takes no cut of your sales. Paid plans are a flat monthly fee, charged to a card you choose later.'}
        </p>
      </div>
      <p className="text-[11px] text-fg-subtle">
        Paystack sets its own fees and may change them. Example uses local card pricing.
      </p>
    </aside>
  );
}

/**
 * 02.07 Onboarding 4 · Get paid: link the bank account Paystack pays sales into (the store's
 * Paystack subaccount). Optional during onboarding ("Skip for now"); needed before customers can
 * pay online.
 */
export default async function OnboardingPaymentsPage() {
  const { store, reached } = await requireOnboardingStep(4);
  if (!store) redirect('/onboarding');
  const base = `/stores/${encodeURIComponent(store.id)}/payouts` as const;

  let banks: z.infer<typeof payoutBankSchema>[] = [];
  let unavailable: string | null = null;
  const account = await apiGet(`${base}/account`, payoutAccountSchema);
  try {
    banks = await apiGet(`${base}/banks`, z.array(payoutBankSchema));
  } catch (err) {
    if (!(err instanceof ApiRequestError)) throw err;
    unavailable = err.message;
  }

  return (
    <OnboardingShell
      step={4}
      reached={reached}
      store={store}
      action={savePayoutAccount}
      title="Where should we send your money?"
      subtitle="Customers pay with Paystack. Paystack sends the money straight to your bank account — Ojara never holds it."
      formClassName="gap-[26px]"
      previewClassName="max-w-[420px] min-[1340px]:w-[360px] min-[1340px]:max-w-none"
      preview={<PayoutExample account={account} />}
    >
      {account.testMode ? (
        <p className="rounded-[10px] bg-attention-soft px-3.5 py-3 text-xs leading-[17px] text-[#6E4A0E]">
          <span className="font-semibold">Test mode.</span> Paystack test keys are in use, so no
          real money moves. Paystack still needs a real bank account number to set up payouts.
        </p>
      ) : null}
      {unavailable ? (
        <p role="alert" className="rounded-[10px] bg-danger-soft px-3.5 py-3 text-ui text-danger">
          {unavailable}
        </p>
      ) : (
        <PayoutFields storeId={store.id} banks={banks} account={account} />
      )}

      <p className="flex items-center gap-1.5 text-xs text-fg-muted">
        <ShieldCheck className="size-[13px] text-fg-subtle" aria-hidden />
        Payments and payouts are handled by Paystack. Ojara stores only your bank name and the last
        4 digits of the account.
      </p>
    </OnboardingShell>
  );
}
