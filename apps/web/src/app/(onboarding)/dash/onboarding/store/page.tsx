import { Check, CircleCheck, Pipette, Upload } from 'lucide-react';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { OnbField } from '@/components/onboarding/fields';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PhonePreview, StorefrontHome } from '@/components/onboarding/phone-preview';
import { Input } from '@/components/ui/input';
import { BRAND_SWATCHES, ONBOARDING_STORE } from '@/mock/onboarding';

export const metadata: Metadata = { title: 'Set up your store · Store address & brand' };

/** 02.05 Onboarding 2 · Store address & brand (visual form). */
export default function OnboardingStorePage() {
  return (
    <OnboardingShell
      step={2}
      title="Name your store and give it a look"
      subtitle="Customers see this on every page and when you share your link. You can change it later."
      formClassName="gap-[26px]"
      previewClassName="min-[1340px]:w-[340px] min-[1340px]:max-w-none"
      preview={
        <PhonePreview caption="Live preview · mobile">
          <StorefrontHome cta="Shop new in" />
        </PhonePreview>
      }
    >
      <OnbField label="Store name" htmlFor="store-name">
        <Input id="store-name" name="storeName" size="lg" defaultValue={ONBOARDING_STORE.name} />
      </OnbField>

      <OnbField label="Store web address" htmlFor="slug">
        <div className="flex h-[46px] items-stretch overflow-hidden rounded-md border-[1.5px] border-success bg-surface">
          <div className="flex min-w-0 flex-1 items-center gap-2 px-3.5">
            <input
              id="slug"
              name="slug"
              defaultValue={ONBOARDING_STORE.slug}
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby="slug-status"
              className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none"
            />
            <CircleCheck className="size-4 shrink-0 text-success" aria-label="Available" />
          </div>
          <span className="flex items-center border-l border-line bg-paper px-3.5 text-sm text-fg-muted">
            .ojara.store
          </span>
        </div>
        <p id="slug-status" className="flex flex-wrap gap-x-1.5 text-xs">
          <span className="font-medium text-success">{ONBOARDING_STORE.host} is available.</span>
          <span className="text-fg-muted">
            Use your own domain (e.g. adunnithreads.com) on Starter.
          </span>
        </p>
      </OnbField>

      <OnbField label="Logo" htmlFor="logo">
        <div className="flex items-center gap-4 rounded-[10px] border border-line bg-surface p-3.5">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-store-accent font-display text-[28px] font-bold text-store-accent-ink"
          >
            {ONBOARDING_STORE.initial}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="truncate text-ui font-semibold text-fg">
              {ONBOARDING_STORE.logoFile.name}
            </span>
            <span className="text-xs text-fg-muted">{ONBOARDING_STORE.logoFile.meta}</span>
          </span>
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-line bg-surface px-[13px] py-2 text-ui font-medium text-fg hover:bg-selected has-focus-visible:shadow-focus">
            <Upload className="size-4 text-fg-muted" aria-hidden />
            Replace
            <input id="logo" type="file" accept="image/*" className="sr-only" />
          </label>
        </div>
      </OnbField>

      <fieldset>
        <legend className="mb-2 text-ui font-semibold text-fg">Brand colour</legend>
        <div className="flex flex-wrap items-center gap-2.5">
          {BRAND_SWATCHES.map((s, i) => (
            <label
              key={s.name}
              title={s.name}
              style={{ '--sw': s.hex } as CSSProperties}
              className="flex size-10 cursor-pointer rounded-full border-2 border-transparent p-[3px] has-checked:border-(--sw) has-focus-visible:shadow-focus"
            >
              <input
                type="radio"
                name="brandColour"
                value={s.hex}
                defaultChecked={i === 0}
                aria-label={s.name}
                className="peer sr-only"
              />
              <span className="flex flex-1 items-center justify-center rounded-full bg-(--sw) [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                <Check className="size-4 text-white" strokeWidth={2.5} aria-hidden />
              </span>
            </label>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-[9px] text-ui font-medium text-fg hover:bg-selected"
          >
            <Pipette className="size-3.5 text-fg-muted" aria-hidden /> Custom
          </button>
        </div>
        <p className="mt-2 text-xs text-fg-muted">
          Used for buttons and links. We check that text on it stays readable.
        </p>
      </fieldset>
    </OnboardingShell>
  );
}
