import { NIGERIAN_STATES, STORE_CATEGORIES, type StoreCategory } from '@ojara/shared';
import {
  Info,
  type LucideIcon,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Utensils,
} from 'lucide-react';
import type { Metadata } from 'next';
import { choiceClass, LockedValue, OnbField } from '@/components/onboarding/fields';
import { FieldError, FormInput, FormSelect } from '@/components/onboarding/onboarding-form';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PhonePreview, SkeletonStore } from '@/components/onboarding/phone-preview';
import { requireOnboardingStep } from '@/lib/auth/guards';
import { previewStore, withStore } from '@/lib/onboarding/preview';
import { saveBusinessDetails } from './actions';

export const metadata: Metadata = { title: 'Set up your store · Business details' };

const ICONS: Record<StoreCategory, LucideIcon> = {
  fashion: Shirt,
  beauty: Sparkles,
  food: Utensils,
  electronics: Smartphone,
  home: Sofa,
  general: ShoppingBasket,
};

/** "+2348035550144" -> "803 555 0144" for the +234-prefixed input. */
function localNumber(e164: string | null): string {
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(e164 ?? '');
  return m ? `${m[1]} ${m[2]} ${m[3]}` : '';
}

/**
 * 02.04 Onboarding 1 · Business details. Saving creates the store as a draft on the Free plan
 * (POST /v1/stores, address generated from the name) or updates it on later visits.
 */
export default async function OnboardingBusinessPage() {
  const { store, reached } = await requireOnboardingStep(1);
  const preview = previewStore(store);

  return (
    <OnboardingShell
      step={1}
      reached={reached}
      store={store}
      action={saveBusinessDetails}
      title="Tell us about your business"
      subtitle="We’ll use this to set up your store, currency and delivery options."
      preview={
        <PhonePreview caption="Your store is taking shape" {...withStore(store)}>
          <SkeletonStore whatsapp={preview ? preview.whatsapp : undefined} />
        </PhonePreview>
      }
    >
      <OnbField label="Business name" htmlFor="business-name">
        <FormInput
          id="business-name"
          name="businessName"
          size="lg"
          required
          maxLength={80}
          autoComplete="organization"
          defaultValue={store?.name ?? ''}
          placeholder="e.g. Adùnní Threads"
        />
        <FieldError name="businessName" />
      </OnbField>

      <fieldset aria-describedby="category-error">
        <legend className="mb-2 text-ui font-semibold text-fg">What do you sell?</legend>
        <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3">
          {STORE_CATEGORIES.map((c) => {
            const Icon = ICONS[c.id];
            return (
              <label
                key={c.id}
                className={`${choiceClass} flex items-center gap-2 px-3 py-2.5 text-ui font-medium text-fg has-checked:font-semibold`}
              >
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  defaultChecked={store?.category === c.id}
                  className="sr-only"
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{c.label}</span>
              </label>
            );
          })}
        </div>
        <FieldError name="category" className="mt-2" />
      </fieldset>

      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_1fr_160px]">
          <OnbField label="Country" htmlFor="country">
            <LockedValue id="country" value="Nigeria" />
          </OnbField>
          <OnbField label="State" htmlFor="state">
            <FormSelect id="state" name="state" required defaultValue={store?.state ?? ''}>
              <option value="" disabled>
                Choose a state
              </option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </FormSelect>
            <FieldError name="state" />
          </OnbField>
          <OnbField label="Currency" htmlFor="currency">
            <LockedValue id="currency" value="NGN (₦)" />
          </OnbField>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-fg-muted">
          <Info className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
          Ojara is available in Nigeria for now. More countries are coming.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <OnbField label="WhatsApp number for customers" htmlFor="whatsapp">
          <FormInput
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            size="lg"
            prefix="+234"
            required
            placeholder="803 555 0144"
            defaultValue={localNumber(store?.whatsappNumber ?? null)}
          />
          <FieldError name="whatsapp" />
        </OnbField>
        <OnbField label="Instagram (optional)" htmlFor="instagram">
          <FormInput
            id="instagram"
            name="instagram"
            size="lg"
            prefix="@"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="yourbusiness"
            defaultValue={store?.instagramHandle ?? ''}
          />
          <FieldError name="instagram" />
        </OnbField>
      </div>
    </OnboardingShell>
  );
}
