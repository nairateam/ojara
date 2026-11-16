import { Check, CircleDashed, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { categoryLabel, OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PhonePreview, StorefrontHome } from '@/components/onboarding/phone-preview';
import { getStoreSummary } from '@/lib/api/session';
import { requireOnboardingStep } from '@/lib/auth/guards';
import { previewStore, storeHost } from '@/lib/onboarding/preview';
import { publishStore } from '../actions';

export const metadata: Metadata = { title: 'Set up your store · Preview & publish' };

interface ChecklistItem {
  title: string;
  summary: string;
  href: string;
  done: boolean;
}

/**
 * 02.09 Onboarding 6 · Preview & publish. The checklist reflects what is actually set up;
 * publishing (owner only) makes the store public and finishes onboarding.
 */
export default async function OnboardingPublishPage() {
  const { store, reached } = await requireOnboardingStep(6);
  if (!store) redirect('/onboarding');
  const { productCount } = await getStoreSummary(store.id);
  const host = storeHost(store.slug);
  const live = store.status === 'PUBLISHED';

  const checklist: ChecklistItem[] = [
    {
      title: 'Business details',
      summary:
        [categoryLabel(store.category), store.state].filter(Boolean).join(' · ') || 'Add details',
      href: '/onboarding',
      done: Boolean(store.category && store.state),
    },
    { title: 'Store address & brand', summary: host, href: '/onboarding/store', done: true },
    {
      title: 'Products',
      summary:
        productCount > 0
          ? `${productCount} product${productCount === 1 ? '' : 's'}`
          : 'None yet — add them from your dashboard after publishing',
      href: '/onboarding/products',
      done: productCount > 0,
    },
    {
      title: 'Payments',
      summary: 'Not connected yet — needed before customers can pay',
      href: '/onboarding/payments',
      done: false,
    },
    {
      title: 'Delivery & pickup',
      summary: 'Not set up yet',
      href: '/onboarding/delivery',
      done: false,
    },
  ];

  return (
    <OnboardingShell
      step={6}
      reached={reached}
      store={store}
      action={publishStore}
      title={live ? 'Your store is live' : 'Looking good. Ready to go live?'}
      subtitle="Check the summary below. Anything you change later updates your store straight away."
      formClassName="gap-[18px]"
      preview={
        <PhonePreview caption={`Preview · ${host}`} store={previewStore(store)}>
          <StorefrontHome cta="Shop now" />
        </PhonePreview>
      }
    >
      <ul className="overflow-hidden rounded-lg border border-line bg-surface">
        {checklist.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-3 border-line px-4 py-[13px] not-first:border-t"
          >
            {item.done ? (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                <Check className="size-[13px]" strokeWidth={2.5} aria-label="Done" />
              </span>
            ) : (
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-attention-soft text-warning">
                <CircleDashed className="size-[13px]" strokeWidth={2.5} aria-label="Not done yet" />
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-ui font-semibold text-fg">{item.title}</span>
              <span className="text-xs text-fg-muted">{item.summary}</span>
            </span>
            <Link
              href={item.href}
              className="shrink-0 text-xs font-semibold text-fg hover:underline"
              aria-label={`Edit ${item.title.toLowerCase()}`}
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-2.5 text-xs text-fg-muted">
        <Info className="mt-px size-3.5 shrink-0 text-fg-subtle" aria-hidden />
        Publishing makes {host} visible to anyone with the link. Customers can browse, but can’t pay
        until payments are connected. On the Free plan, your store footer shows “Powered by Ojara”.
      </p>
    </OnboardingShell>
  );
}
