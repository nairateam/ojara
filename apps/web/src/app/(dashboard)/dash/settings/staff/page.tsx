import { formatKobo, PLANS } from '@ojara/shared';
import { Check, Lock, Minus, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusPill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/feedback';
import { BILLING, ROLE_MATRIX, TEAM } from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Settings · Staff' };

function Allowed({ yes, label }: { yes: boolean; label: string }) {
  return yes ? (
    <Check className="mx-auto size-3.5 text-success" aria-label={`${label}: yes`} />
  ) : (
    <Minus className="mx-auto size-3.5 text-line-strong" aria-label={`${label}: no`} />
  );
}

/** 03.17 Settings – Staff (Starter: 1 seat, Professional upsell). */
export default function StaffPage() {
  const seats = PLANS[BILLING.currentPlan].limits.staffAccounts;
  const pro = PLANS.PROFESSIONAL;
  return (
    <div className="flex flex-col gap-[22px]">
      <section className="flex flex-col gap-4 rounded-[14px] bg-forest p-5 text-paper md:flex-row md:items-center md:gap-6 md:p-6">
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-[12px] bg-paper/10">
          <Users className="size-6" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="font-display text-xl font-semibold tracking-display">
            Bring your team in with {pro.name}
          </h2>
          <p className="text-ui text-fg-on-dark">
            Give staff their own logins so they can pack orders and update stock — without seeing
            your payouts or bank details.
          </p>
        </div>
        <Button variant="light" className="h-auto px-[18px] py-[11px]" asChild>
          <Link href="/settings/billing">Upgrade · {formatKobo(pro.priceKobo)}/mo</Link>
        </Button>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-title font-semibold">
            Team · {TEAM.length} of {seats} seat{seats === 1 ? '' : 's'} used
          </h2>
          <Button variant="secondary" disabled className="disabled:opacity-60">
            <Lock /> Invite staff
          </Button>
        </div>
        <ul>
          {TEAM.map((m) => (
            <li key={m.email} className="flex items-center gap-3 px-5 py-3.5">
              <Avatar name={m.name} size={34} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-ui font-semibold">
                  {m.name}
                  {m.you ? ' (you)' : ''}
                </span>
                <span className="truncate text-xs text-fg-muted">{m.email}</span>
              </div>
              <StatusPill tone="strong" dot={false}>
                {m.role}
              </StatusPill>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-title font-semibold">What each role can do</h2>
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[520px] border-collapse text-ui">
            <thead className="bg-paper">
              <tr>
                <th className="px-3.5 py-[9px] text-left">
                  <span className="sr-only">Permission</span>
                </th>
                {['Owner', 'Manager', 'Packer'].map((r) => (
                  <th
                    key={r}
                    scope="col"
                    className="w-[110px] px-3.5 py-[9px] text-center text-2xs font-semibold tracking-[0.6px] text-fg-subtle"
                  >
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLE_MATRIX.map((row) => (
                <tr key={row.action} className="border-t border-line">
                  <th scope="row" className="px-3.5 py-[9px] text-left font-normal">
                    {row.action}
                  </th>
                  <td className="px-3.5 py-[9px]">
                    <Allowed yes={row.owner} label="Owner" />
                  </td>
                  <td className="px-3.5 py-[9px]">
                    <Allowed yes={row.manager} label="Manager" />
                  </td>
                  <td className="px-3.5 py-[9px]">
                    <Allowed yes={row.packer} label="Packer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
