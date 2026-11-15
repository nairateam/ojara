import {
  ArrowUpRight,
  Bold,
  Check,
  FileText,
  Italic,
  Link as LinkIcon,
  List,
  type LucideIcon,
  RotateCcw,
  Shield,
  Truck,
  WandSparkles,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/form-controls';
import { cn } from '@/lib/utils';
import {
  PLATFORM_POLICIES,
  type PolicyKey,
  POLICIES,
  RETURN_SETTINGS,
  STORE,
} from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Settings · Policies' };

const ICONS: Record<PolicyKey, LucideIcon> = {
  returns: RotateCcw,
  delivery: Truck,
  privacy: Shield,
  terms: FileText,
};

const TOOLBAR: { icon: LucideIcon; label: string }[] = [
  { icon: Bold, label: 'Bold' },
  { icon: Italic, label: 'Italic' },
  { icon: List, label: 'Bulleted list' },
  { icon: LinkIcon, label: 'Link' },
];

type Props = { searchParams: Promise<{ policy?: string }> };

/** 03.19 Settings – Policies: policy list on the left, editor on the right (?policy=…). */
export default async function PoliciesPage({ searchParams }: Props) {
  const { policy: requested } = await searchParams;
  const policy = POLICIES.find((p) => p.key === requested) ?? POLICIES[0]!;
  const quick = [
    { id: 'return-window', label: 'Return window', options: RETURN_SETTINGS.window },
    { id: 'who-pays', label: 'Who pays return delivery', options: RETURN_SETTINGS.whoPays },
    { id: 'refund-method', label: 'Refund method', options: RETURN_SETTINGS.refundMethod },
  ];

  return (
    <div className="flex flex-col gap-[22px] lg:flex-row lg:items-start">
      <div className="flex flex-col gap-2.5 lg:w-[320px] lg:shrink-0">
        <nav aria-label="Store policies" className="flex flex-col gap-2.5">
          {POLICIES.map((p) => {
            const Icon = ICONS[p.key];
            const active = p.key === policy.key;
            return (
              <Link
                key={p.key}
                href={
                  p.key === 'returns' ? '/settings/policies' : `/settings/policies?policy=${p.key}`
                }
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-[10px] p-3.5',
                  active
                    ? 'border-[1.5px] border-forest bg-selected p-[13.5px]'
                    : 'border border-line bg-surface hover:bg-selected',
                )}
              >
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-md bg-surface-muted">
                  <Icon className="size-4 text-fg-muted" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-ui font-semibold">{p.title}</span>
                  <span
                    className={cn(
                      'text-xs',
                      p.statusTone === 'warning' ? 'text-warning' : 'text-fg-muted',
                    )}
                  >
                    {p.status}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-2 rounded-[10px] bg-surface-muted p-3.5">
          <p className="text-xs font-semibold">Ojara rules you agreed to</p>
          {PLATFORM_POLICIES.map((name) => (
            <a
              key={name}
              href={`https://ojara.store/legal/${name.toLowerCase().replace(/\s+/g, '-')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-xs text-fg hover:underline"
            >
              {name}
              <ArrowUpRight className="size-3" aria-hidden />
            </a>
          ))}
        </div>
      </div>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="text-title font-semibold">{policy.title}</h2>
            <p className="text-xs text-fg-muted">
              Shown at checkout and at {STORE.ojaraAddress}/policies/{policy.key}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <WandSparkles /> Use template
            </Button>
            <Button>
              <Check /> Save
            </Button>
          </div>
        </div>

        {policy.key === 'returns' ? (
          <div className="grid gap-3.5 border-t border-line bg-paper px-5 py-4 sm:grid-cols-3">
            {quick.map((q) => (
              <div key={q.id} className="flex flex-col gap-1.5">
                <label htmlFor={q.id} className="text-xs font-semibold">
                  {q.label}
                </label>
                <Select id={q.id} defaultValue={q.options[0]}>
                  {q.options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        ) : null}

        <div
          role="toolbar"
          aria-label="Formatting"
          className="flex items-center gap-1.5 border-y border-line px-4 py-1"
        >
          {TOOLBAR.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              className="flex size-7 items-center justify-center rounded-sm text-fg-muted hover:bg-selected hover:text-fg"
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 px-5 py-[18px]">
          <h3 className="text-base font-semibold">{policy.title}</h3>
          {policy.paragraphs.length > 0 ? (
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-multiline="true"
              aria-label={`${policy.title} policy text`}
              className="flex flex-col gap-3 rounded-sm text-sm leading-[22px] text-fg-muted outline-none focus-visible:shadow-focus"
            >
              {policy.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-[22px] text-fg-subtle">
              You haven’t written your terms of sale yet. Start from the Ojara template and edit it
              to fit how you sell.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
