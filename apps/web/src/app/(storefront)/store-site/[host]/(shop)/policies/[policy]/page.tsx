import { Calendar, RefreshCw, Wallet } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/storefront/primitives';
import { cn } from '@/lib/utils';
import { getPolicy, POLICIES } from '@/mock/storefront';

type Props = { params: Promise<{ policy: string }> };

const FACT_ICONS = { calendar: Calendar, refresh: RefreshCw, wallet: Wallet } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const policy = getPolicy((await params).policy);
  return policy ? { title: policy.title } : {};
}

/** 05.10 Returns Policy (and the other store policies in the same layout). */
export default async function PolicyPage({ params }: Props) {
  const policy = getPolicy((await params).policy);
  if (!policy) notFound();
  return (
    <section className="flex flex-col gap-8 px-4 pt-8 pb-16 md:flex-row md:gap-12 md:px-8 md:pt-14 md:pb-[88px] xl:gap-[72px] xl:px-[120px]">
      <nav
        aria-label="Policies"
        className="flex flex-col gap-1 md:w-[200px] md:shrink-0 xl:w-[240px]"
      >
        <span className="pb-1 text-2xs font-semibold tracking-[1.4px] text-store-body uppercase">
          Policies
        </span>
        <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-col">
          {POLICIES.map((p) => {
            const active = p.slug === policy.slug;
            return (
              <li key={p.slug} className="shrink-0">
                <Link
                  href={`/policies/${p.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm whitespace-nowrap',
                    active
                      ? 'bg-store-band font-semibold text-store-ink'
                      : 'text-store-body hover:text-store-ink',
                  )}
                >
                  {p.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <article className="flex max-w-[760px] min-w-0 flex-1 flex-col gap-[18px]">
        <PageTitle>{policy.title}</PageTitle>
        <p className="text-ui text-store-body">{policy.updated}</p>
        {policy.facts ? (
          <div className="grid gap-3 pt-1 pb-2 sm:grid-cols-3">
            {policy.facts.map((f) => {
              const Icon = FACT_ICONS[f.icon];
              return (
                <div
                  key={f.title}
                  className="flex flex-col gap-1.5 rounded-lg border border-store-border bg-store-card p-[18px]"
                >
                  <Icon className="size-[18px] text-store-primary" aria-hidden />
                  <span className="text-base font-semibold text-store-ink">{f.title}</span>
                  <span className="text-ui text-store-body">{f.sub}</span>
                </div>
              );
            })}
          </div>
        ) : null}
        {policy.sections.map((s) => (
          <div key={s.heading} className="flex flex-col gap-[18px]">
            <h2 className="text-lg font-semibold text-store-ink">{s.heading}</h2>
            <p className="text-title leading-[25px] text-store-body">{s.body}</p>
          </div>
        ))}
      </article>
    </section>
  );
}
