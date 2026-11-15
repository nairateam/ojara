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
import { choiceClass, LockedValue, OnbField, NativeSelect } from '@/components/onboarding/fields';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PhonePreview, SkeletonStore } from '@/components/onboarding/phone-preview';
import { Input } from '@/components/ui/input';
import {
  BUSINESS_CATEGORIES,
  type BusinessCategoryIcon,
  NIGERIAN_STATES,
  ONBOARDING_SELLER,
  ONBOARDING_STORE,
} from '@/mock/onboarding';

export const metadata: Metadata = { title: 'Set up your store · Business details' };

const ICONS: Record<BusinessCategoryIcon, LucideIcon> = {
  shirt: Shirt,
  sparkles: Sparkles,
  utensils: Utensils,
  smartphone: Smartphone,
  sofa: Sofa,
  'shopping-basket': ShoppingBasket,
};

/** 02.04 Onboarding 1 · Business details (visual form; store creation is POST /v1/stores). */
export default function OnboardingBusinessPage() {
  return (
    <OnboardingShell
      step={1}
      title="Tell us about your business"
      subtitle="We’ll use this to set up your store, currency and delivery options."
      preview={
        <PhonePreview caption="Your store is taking shape">
          <SkeletonStore />
        </PhonePreview>
      }
    >
      <OnbField label="Business name" htmlFor="business-name">
        <Input
          id="business-name"
          name="businessName"
          size="lg"
          defaultValue={ONBOARDING_STORE.name}
          placeholder="e.g. Adùnní Threads"
        />
      </OnbField>

      <fieldset>
        <legend className="mb-2 text-ui font-semibold text-fg">What do you sell?</legend>
        <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3">
          {BUSINESS_CATEGORIES.map((c, i) => {
            const Icon = ICONS[c.icon];
            return (
              <label
                key={c.id}
                className={`${choiceClass} flex items-center gap-2 px-3 py-2.5 text-ui font-medium text-fg has-checked:font-semibold`}
              >
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  defaultChecked={i === 0}
                  className="sr-only"
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{c.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_1fr_160px]">
          <OnbField label="Country" htmlFor="country">
            <LockedValue id="country" value="Nigeria" />
          </OnbField>
          <OnbField label="State" htmlFor="state">
            <NativeSelect id="state" name="state" defaultValue={ONBOARDING_STORE.state}>
              {NIGERIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </NativeSelect>
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
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            size="lg"
            prefix="+234"
            defaultValue={ONBOARDING_SELLER.phone}
          />
        </OnbField>
        <OnbField label="Instagram (optional)" htmlFor="instagram">
          <Input
            id="instagram"
            name="instagram"
            size="lg"
            prefix="@"
            defaultValue={ONBOARDING_STORE.instagram}
          />
        </OnbField>
      </div>
    </OnboardingShell>
  );
}
