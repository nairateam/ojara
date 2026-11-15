import { Ban, ShieldAlert, ShieldCheck, UserPlus } from 'lucide-react';
import type { Metadata } from 'next';
import { AdminCard, AdminCardTitle } from '@/components/admin/primitives';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { StatusPill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/feedback';
import { Select } from '@/components/ui/form-controls';
import { Switch } from '@/components/ui/switch';
import {
  ADMIN_ROLES,
  ADMIN_TEAM,
  PAYMENT_PROVIDER,
  PROHIBITED_CATEGORIES,
  SECURITY_RULES,
} from '@/mock/admin';

export const metadata: Metadata = { title: 'Admin settings' };

/** 06.10 Admin settings — admin team and roles, security rules, payment provider, prohibited categories. */
export default function AdminSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Admin settings"
        subtitle="Who can run Ojara, and the rules every store follows."
      />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <AdminCardTitle>Admin team · {ADMIN_TEAM.length}</AdminCardTitle>
              <Button variant="secondary">
                <UserPlus /> Invite admin
              </Button>
            </div>
            <ul>
              {ADMIN_TEAM.map((a) => (
                <li
                  key={a.email}
                  className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line px-5 py-3"
                >
                  <Avatar name={a.name} size={34} />
                  <span className="flex min-w-0 flex-1 flex-col gap-px">
                    <span className="text-ui font-semibold text-fg">{a.name}</span>
                    <span className="truncate text-xs text-fg-muted">
                      {a.email} · {a.team}
                    </span>
                  </span>
                  {a.twoFactor ? (
                    <span className="flex w-[150px] items-center gap-1.5 text-xs text-fg-muted">
                      <ShieldCheck className="size-3.5 text-success" aria-hidden />
                      {a.twoFactor}
                    </span>
                  ) : (
                    <span className="flex w-[150px] items-center gap-1.5 text-xs font-semibold text-danger">
                      <ShieldAlert className="size-3.5" aria-hidden />
                      Not set up
                    </span>
                  )}
                  <Select
                    defaultValue={a.role}
                    aria-label={`Role for ${a.name}`}
                    className="w-[132px] [&_select]:h-8 [&_select]:text-xs"
                  >
                    {ADMIN_ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </li>
              ))}
            </ul>
          </section>

          <AdminCard className="gap-0">
            <AdminCardTitle className="mb-3.5">Security rules</AdminCardTitle>
            <ul>
              {SECURITY_RULES.map((r) => (
                <li
                  key={r.title}
                  className="flex items-center justify-between gap-4 border-t border-line py-3 last:pb-0"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-ui font-semibold text-fg">{r.title}</span>
                    <span className="text-xs text-fg-muted">{r.body}</span>
                  </span>
                  <Switch defaultChecked={r.on} aria-label={r.title} />
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>

        <div className="flex flex-col gap-5">
          <AdminCard className="gap-3.5">
            <AdminCardTitle>Payment provider</AdminCardTitle>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#0BA4DB] font-display text-[17px] font-bold text-white"
              >
                P
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="text-ui font-semibold text-fg">{PAYMENT_PROVIDER.name}</span>
                <span className="truncate font-mono text-2xs text-fg-muted">
                  {PAYMENT_PROVIDER.key}
                </span>
              </span>
              <StatusPill tone="success">{PAYMENT_PROVIDER.status}</StatusPill>
            </div>
            <p className="text-xs text-fg-muted">{PAYMENT_PROVIDER.note}</p>
          </AdminCard>

          <AdminCard className="gap-3.5">
            <div className="flex items-center justify-between">
              <AdminCardTitle>Prohibited categories</AdminCardTitle>
              <Button variant="ghost" className="text-xs">
                Edit
              </Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {PROHIBITED_CATEGORIES.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-1.5 rounded-pill bg-danger-soft px-2.5 py-1 text-xs font-medium text-danger"
                >
                  <Ban className="size-3" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-xs text-fg-muted">
              New listings are auto-checked against these. Matches go to Reports &amp; abuse.
            </p>
          </AdminCard>
        </div>
      </div>
    </PageContainer>
  );
}
