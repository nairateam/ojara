import { formatKobo } from '@ojara/shared';
import {
  BadgeCheck,
  Building2,
  Landmark,
  Lock,
  type LucideIcon,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  User,
} from 'lucide-react';
import type { Metadata } from 'next';
import { choiceClass, OnbField, NativeSelect } from '@/components/onboarding/fields';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { NIGERIAN_BANKS, PAYOUT, PAYOUT_EXAMPLE } from '@/mock/onboarding';

export const metadata: Metadata = { title: 'Set up your store · Get paid' };

const PAYEE_TYPES = [
  { id: 'individual', title: 'Just me', sub: 'Individual or sole trader', icon: User },
  {
    id: 'business',
    title: 'Registered business',
    sub: 'Have a CAC BN or RC number',
    icon: Building2,
  },
] as const;

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

function PayoutExample() {
  return (
    <aside className="flex w-full flex-col gap-4" aria-label="Payout example">
      <h2 className="text-[11px] font-semibold tracking-[0.8px] text-fg-subtle uppercase">
        How a {formatKobo(PAYOUT_EXAMPLE.orderKobo)} order is paid out
      </h2>
      <ul className="rounded-[14px] border border-line bg-surface p-5">
        <PayoutLine
          icon={ShoppingBag}
          label="Customer pays"
          sub="Card, transfer or USSD"
          value={formatKobo(PAYOUT_EXAMPLE.orderKobo)}
        />
        <PayoutLine
          icon={Receipt}
          label="Paystack fee"
          sub="1.5% + ₦100, capped at ₦2,000"
          value={formatKobo(-PAYOUT_EXAMPLE.feeKobo)}
          tone="danger"
        />
        <PayoutLine
          icon={Landmark}
          label="You receive"
          sub={`${PAYOUT.bank} ••${PAYOUT.accountLast4} · next business day`}
          value={formatKobo(PAYOUT_EXAMPLE.receiveKobo)}
          tone="success"
        />
      </ul>
      <div className="flex flex-col gap-1.5 rounded-lg bg-surface-muted p-4 text-fg">
        <p className="text-ui font-semibold">Your Ojara plan is billed separately</p>
        <p className="text-xs leading-[18px]">
          Ojara takes no cut of your sales. Paid plans are a flat monthly fee, charged to a card you
          choose later.
        </p>
      </div>
      <p className="text-[11px] text-fg-subtle">
        Paystack sets its own fees and may change them. Example uses local card pricing.
      </p>
    </aside>
  );
}

/** 02.07 Onboarding 4 · Get paid with Paystack (visual form). */
export default function OnboardingPaymentsPage() {
  return (
    <OnboardingShell
      step={4}
      title="Where should we send your money?"
      subtitle="Customers pay with Paystack. Paystack sends the money straight to your bank account — Ojara never holds it."
      formClassName="gap-[26px]"
      previewClassName="max-w-[420px] min-[1340px]:w-[360px] min-[1340px]:max-w-none"
      preview={<PayoutExample />}
    >
      <fieldset>
        <legend className="mb-2 text-ui font-semibold text-fg">Who receives the payouts?</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAYEE_TYPES.map((t, i) => (
            <label
              key={t.id}
              className={cn(choiceClass, 'flex items-center gap-3 rounded-[10px] p-3.5')}
            >
              <input
                type="radio"
                name="payee"
                value={t.id}
                defaultChecked={i === 0}
                className="peer sr-only"
              />
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-md bg-surface-muted text-fg">
                <t.icon className="size-4" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-ui font-semibold text-fg">{t.title}</span>
                <span className="text-xs text-fg-muted">{t.sub}</span>
              </span>
              <span
                aria-hidden
                className="size-4 shrink-0 rounded-full border-[1.5px] border-line-strong bg-surface peer-checked:border-[5px] peer-checked:border-forest"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <OnbField label="Bank" htmlFor="bank">
          <NativeSelect
            id="bank"
            name="bank"
            defaultValue={PAYOUT.bank}
            leading={
              <span className="flex size-[22px] items-center justify-center rounded-[5px] bg-[#DD4F05] text-[11px] font-bold text-surface">
                {PAYOUT.bankInitial}
              </span>
            }
          >
            {NIGERIAN_BANKS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </NativeSelect>
        </OnbField>
        <OnbField label="Account number" htmlFor="account-number">
          <Input
            id="account-number"
            name="accountNumber"
            size="lg"
            inputMode="numeric"
            autoComplete="off"
            defaultValue={PAYOUT.accountNumber}
            className="tracking-[0.5px]"
          />
        </OnbField>
      </div>

      <div
        className="flex items-center gap-3 rounded-[10px] bg-success-soft px-3.5 py-3 text-success"
        role="status"
      >
        <BadgeCheck className="size-[18px] shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-ui font-bold tracking-[0.3px]">{PAYOUT.accountName}</span>
          <span className="text-xs">
            Account name confirmed by your bank. Payouts arrive the next business day.
          </span>
        </span>
        <button type="button" className="shrink-0 text-xs font-semibold hover:underline">
          Change
        </button>
      </div>

      <OnbField label="BVN (last 4 digits)" htmlFor="bvn">
        <div className="w-[200px] max-w-full">
          <Input
            id="bvn"
            name="bvnLast4"
            size="lg"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            prefix={<span className="tracking-[1px] whitespace-nowrap">•••• •••</span>}
            defaultValue={PAYOUT.bvnLast4}
          />
        </div>
        <p className="text-xs text-fg-muted">
          Paystack needs this to verify payouts. We never see or store your full BVN.
        </p>
      </OnbField>

      <ul className="flex flex-wrap gap-x-[18px] gap-y-2 text-xs text-fg-muted">
        <li className="flex items-center gap-1.5">
          <Lock className="size-[13px] text-fg-subtle" aria-hidden /> Bank-grade encryption
        </li>
        <li className="flex items-center gap-1.5">
          <ShieldCheck className="size-[13px] text-fg-subtle" aria-hidden /> Licensed by the CBN via
          Paystack
        </li>
      </ul>
    </OnboardingShell>
  );
}
