import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageTitle } from '@/components/storefront/primitives';
import { getShop, whatsappLink } from '@/components/storefront/store';
import { POLICY_SLUGS, storePolicy } from '@/lib/storefront/policies';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ host: string; policy: string }> };

async function load(params: Props['params']) {
  const [{ store }, { policy: slug }] = await Promise.all([getShop(params), params]);
  const details = {
    name: store.name,
    whatsapp: whatsappLink(store.whatsappNumber)?.label ?? null,
    email: store.contactEmail,
  };
  return { details, policy: storePolicy(slug, details) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { policy } = await load(params);
  return policy ? { title: policy.title } : {};
}

/** 05.10 store policies layout (returns, delivery, privacy, terms). */
export default async function PolicyPage({ params }: Props) {
  const { details, policy } = await load(params);
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
          {POLICY_SLUGS.map((slug) => {
            const p = storePolicy(slug, details);
            if (!p) return null;
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
