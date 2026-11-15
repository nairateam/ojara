import { Check, FileText, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PhonePreview, StorefrontHome } from '@/components/onboarding/phone-preview';
import { ONBOARDING_STORE, PUBLISH_CHECKLIST } from '@/mock/onboarding';

export const metadata: Metadata = { title: 'Set up your store · Preview & publish' };

/** 02.09 Onboarding 6 · Preview & publish. */
export default function OnboardingPublishPage() {
  return (
    <OnboardingShell
      step={6}
      title="Looking good. Ready to go live?"
      subtitle="Check the summary below. Anything you change later updates your store straight away."
      formClassName="gap-[18px]"
      preview={
        <PhonePreview caption={`Preview · ${ONBOARDING_STORE.host}`}>
          <StorefrontHome cta={`Preview · ${ONBOARDING_STORE.host}`} />
        </PhonePreview>
      }
    >
      <ul className="overflow-hidden rounded-lg border border-line bg-surface">
        {PUBLISH_CHECKLIST.map((item) => (
          <li
            key={item.title}
            className="flex items-center gap-3 border-line px-4 py-[13px] not-first:border-t"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
              <Check className="size-[13px]" strokeWidth={2.5} aria-label="Done" />
            </span>
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

      <div className="flex items-center gap-3 rounded-[10px] bg-attention-soft px-3.5 py-3 text-[#6E4A0E]">
        <FileText className="size-[18px] shrink-0" aria-hidden />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-ui font-semibold">Recommended: add a returns policy</span>
          <span className="text-xs">
            Customers trust stores that say how returns work. Start from our template.
          </span>
        </span>
        <button type="button" className="shrink-0 text-xs font-semibold hover:underline">
          Add policy
        </button>
      </div>

      <p className="flex items-center gap-2.5 text-xs text-fg-muted">
        <Info className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
        On the Free plan, your store footer shows &ldquo;Powered by Ojara&rdquo;. Starter removes
        it.
      </p>
    </OnboardingShell>
  );
}
