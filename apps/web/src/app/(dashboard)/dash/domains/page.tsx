import { formatKobo } from '@ojara/shared';
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  CircleCheck,
  Ellipsis,
  EyeOff,
  Globe,
  Hourglass,
  Link2,
  Loader,
  Lock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import type { Metadata } from 'next';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { CopyButton } from '@/components/dashboard-store/copy-button';
import { StatusPill } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DNS_GUIDES, DNS_RECORDS, STORE } from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Domains' };

const SETUP_FEE_KOBO = 500_000;

const STEPS = [
  { label: 'Domain added', state: 'done' },
  { label: 'Point DNS to Ojara', state: 'current' },
  { label: 'Verify & secure (HTTPS)', state: 'todo' },
] as const;

const th =
  'py-2 pr-3 text-left text-2xs font-semibold tracking-[0.6px] text-fg-subtle uppercase first:pl-3.5';
const code =
  'inline-flex items-center gap-2 rounded-sm bg-surface-muted px-2 py-1 font-mono text-xs';

function DomainIcon({ icon: Icon }: { icon: typeof Globe }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted">
      <Icon className="size-[18px] text-fg-muted" aria-hidden />
    </span>
  );
}

/** 03.13 Domains: free Ojara address + custom domain DNS set-up. */
export default function DomainsPage() {
  return (
    <PageContainer className="gap-6">
      <PageHeader
        title="Domains"
        subtitle="The web address customers type or tap to reach your store."
      />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface px-[22px] py-[18px] sm:flex-row sm:items-center">
            <DomainIcon icon={Globe} />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold">{STORE.ojaraAddress}</h2>
                <StatusPill tone="success">Active</StatusPill>
              </div>
              <p className="text-xs text-fg-muted">
                Free Ojara address · always on · will forward to {STORE.customDomain} once it’s
                connected
              </p>
            </div>
            <CopyButton
              value={`https://${STORE.ojaraAddress}`}
              label="Copy link"
              className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'w-fit')}
              iconClassName="size-4"
            >
              Copy link
            </CopyButton>
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="flex items-center gap-3.5 px-[22px] py-[18px]">
              <DomainIcon icon={Link2} />
              <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{STORE.customDomain}</h2>
                  <StatusPill tone="warning">Waiting for DNS</StatusPill>
                </div>
                <p className="text-xs text-fg-muted">
                  Added today at 10:02 · last checked 3 minutes ago
                </p>
              </div>
              <button
                type="button"
                aria-label="Domain options"
                className="flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-selected"
              >
                <Ellipsis className="size-[18px]" aria-hidden />
              </button>
            </div>

            <ol className="flex flex-col gap-3 bg-paper px-[22px] py-[18px] md:flex-row md:items-center">
              {STEPS.map((s, i) => (
                <li
                  key={s.label}
                  aria-current={s.state === 'current' ? 'step' : undefined}
                  className="flex items-center gap-3 md:flex-1 md:last:flex-none"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex size-[22px] shrink-0 items-center justify-center rounded-full text-2xs font-bold',
                        s.state === 'done' && 'bg-success text-white',
                        s.state === 'current' && 'bg-forest text-paper',
                        s.state === 'todo' &&
                          'border-[1.5px] border-line-strong bg-surface text-fg-subtle',
                      )}
                    >
                      {s.state === 'done' ? <Check className="size-3" aria-hidden /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        'text-ui whitespace-nowrap',
                        s.state === 'current' ? 'font-semibold' : 'font-medium',
                        s.state === 'todo' && 'text-fg-subtle',
                      )}
                    >
                      {s.label}
                    </span>
                  </span>
                  {i < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className={cn(
                        'hidden h-[1.5px] flex-1 md:block',
                        s.state === 'done' ? 'bg-success' : 'bg-line',
                      )}
                    />
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-4 px-[22px] py-5">
              <h3 className="text-title font-semibold">
                Add these {DNS_RECORDS.length} records where you bought your domain
              </h3>
              <p className="text-ui leading-5 text-fg-muted">
                Log in to your domain provider (for example Whogohost, Qservers or GoDaddy), open
                DNS settings, and add the records below exactly as shown.
              </p>
              <div className="overflow-x-auto rounded-[10px] border border-line">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead className="bg-paper">
                    <tr>
                      <th className={cn(th, 'w-[82px]')}>Type</th>
                      <th className={cn(th, 'w-[122px]')}>Name / Host</th>
                      <th className={th}>Value / Points to</th>
                      <th className={cn(th, 'w-[82px]')}>TTL</th>
                      <th className={cn(th, 'w-[142px]')}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DNS_RECORDS.map((r) => (
                      <tr key={r.type} className="border-t border-line">
                        <td className="py-3 pr-3 pl-3.5">
                          <span className={code}>{r.type}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <span className={code}>{r.host}</span>
                        </td>
                        <td className="py-3 pr-3">
                          <span className={code}>
                            {r.value}
                            <CopyButton
                              value={r.value}
                              label={`Copy ${r.type} value`}
                              className="text-fg-subtle hover:text-fg"
                              iconClassName="size-[13px]"
                            />
                          </span>
                        </td>
                        <td className="py-3 pr-3 pl-2 font-mono text-xs">{r.ttl}</td>
                        <td className="py-3 pr-3">
                          {r.found ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                              <CircleCheck className="size-3.5" aria-hidden /> Found
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                              <Loader className="size-3.5" aria-hidden /> Not found yet
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Button>
                  <RefreshCw /> Check again
                </Button>
                <Button variant="secondary">
                  <Mail /> Email steps to my web person
                </Button>
              </div>
              <p className="flex items-start gap-2 text-xs text-fg-muted">
                <Hourglass className="mt-px size-3.5 shrink-0" aria-hidden />
                Changes usually show up within an hour, but can take up to 48 hours. We’ll email you
                when it’s live.
              </p>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface px-[22px] py-[18px]">
            <h2 className="text-title font-semibold">Once it’s connected</h2>
            <ul className="flex flex-col gap-3 text-ui">
              <li className="flex items-center gap-2.5">
                <Lock className="size-4 shrink-0 text-success" aria-hidden />
                Free HTTPS certificate, renewed automatically
              </li>
              <li className="flex items-center gap-2.5">
                <ArrowLeftRight className="size-4 shrink-0 text-success" aria-hidden />
                {STORE.ojaraAddress} and links you already shared keep working
              </li>
              <li className="flex items-center gap-2.5">
                <EyeOff className="size-4 shrink-0 text-success" aria-hidden />
                No Ojara branding on your storefront (Starter)
              </li>
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-5 lg:w-[320px] lg:shrink-0">
          <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
            <h2 className="text-title font-semibold">Step-by-step guides</h2>
            <ul>
              {DNS_GUIDES.map((g) => (
                <li key={g} className="border-t border-line">
                  <a
                    href={`/help?q=${encodeURIComponent(`${g} DNS`)}`}
                    className="flex items-center justify-between py-3 text-ui font-medium hover:text-fg-muted"
                  >
                    {g}
                    <ArrowUpRight className="size-3.5 text-fg-muted" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-3 rounded-lg bg-forest p-5 text-paper">
            <h2 className="font-display text-lg font-semibold tracking-display">
              Rather we do it?
            </h2>
            <p className="text-ui leading-[19px] text-fg-on-dark">
              Share access to your domain account and our team connects it for you, usually the same
              day.
            </p>
            <Button variant="light" className="mt-1 w-full text-ui">
              Request setup · {formatKobo(SETUP_FEE_KOBO)} one-off
            </Button>
          </section>
        </aside>
      </div>
    </PageContainer>
  );
}
