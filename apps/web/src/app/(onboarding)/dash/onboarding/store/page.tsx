import { ImageUp } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OnbField } from '@/components/onboarding/fields';
import { FieldError, FormInput } from '@/components/onboarding/onboarding-form';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PhonePreview, StorefrontHome } from '@/components/onboarding/phone-preview';
import { BrandColourPicker, SlugField } from '@/components/onboarding/store-fields';
import { clientEnv } from '@/env';
import { requireOnboardingStep } from '@/lib/auth/guards';
import { previewStore } from '@/lib/onboarding/preview';
import { BRAND_SWATCHES } from '@/mock/onboarding';
import { saveStoreBrand } from '../actions';

export const metadata: Metadata = { title: 'Set up your store · Store address & brand' };

/**
 * 02.05 Onboarding 2 · Store address & brand: name, web address (live availability check) and
 * brand colour. Logo upload arrives with image uploads (needs Cloudinary); until then the store's
 * initial stands in.
 */
export default async function OnboardingStorePage() {
  const { store, reached } = await requireOnboardingStep(2);
  if (!store) redirect('/onboarding');
  const initial = store.name.trim().charAt(0).toUpperCase();

  return (
    <OnboardingShell
      step={2}
      reached={reached}
      store={store}
      action={saveStoreBrand}
      title="Name your store and give it a look"
      subtitle="Customers see this on every page and when you share your link. You can change it later."
      formClassName="gap-[26px]"
      previewClassName="min-[1340px]:w-[340px] min-[1340px]:max-w-none"
      preview={
        <PhonePreview caption="Live preview · mobile" store={previewStore(store)}>
          <StorefrontHome cta="Shop new in" />
        </PhonePreview>
      }
    >
      <OnbField label="Store name" htmlFor="store-name">
        <FormInput
          id="store-name"
          name="storeName"
          size="lg"
          required
          maxLength={80}
          defaultValue={store.name}
        />
        <FieldError name="storeName" />
      </OnbField>

      <OnbField label="Store web address" htmlFor="slug">
        <SlugField
          storeId={store.id}
          initialSlug={store.slug}
          rootDomain={clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}
        />
      </OnbField>

      <OnbField label="Logo">
        <div className="flex items-center gap-4 rounded-[10px] border border-line bg-surface p-3.5">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-store-accent font-display text-[28px] font-bold text-store-accent-ink"
          >
            {initial}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-ui font-semibold text-fg">Logo upload is coming soon</span>
            <span className="text-xs text-fg-muted">
              Your initial is used for now. You can add a logo later in Settings.
            </span>
          </span>
          <span
            aria-hidden
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line bg-paper px-[13px] py-2 text-ui font-medium text-fg-subtle"
          >
            <ImageUp className="size-4" /> Upload
          </span>
        </div>
      </OnbField>

      <fieldset>
        <legend className="mb-2 text-ui font-semibold text-fg">Brand colour</legend>
        <BrandColourPicker swatches={BRAND_SWATCHES} initial={store.primaryColor} />
        <FieldError name="brandColour" className="mt-2" />
        <p className="mt-2 text-xs text-fg-muted">Used for buttons and links on your store.</p>
      </fieldset>
    </OnboardingShell>
  );
}
