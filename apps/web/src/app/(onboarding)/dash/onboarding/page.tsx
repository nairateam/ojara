import type { Metadata } from 'next';
import { FormField } from '@/components/auth/form-field';
import { OnboardingShell, PhonePreview } from '@/components/onboarding/onboarding-shell';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = { title: 'Set up your store' };

/** 02.04 Onboarding step 1 — SHELL ONLY; fields are not wired (store creation is POST /v1/stores). */
export default function OnboardingPage() {
  return (
    <OnboardingShell
      step={1}
      storeName="your store"
      title="Tell us about your business"
      subtitle="This helps us set up the right things for you."
      preview={<PhonePreview caption="Your store is taking shape" />}
    >
      <FormField id="business-name" label="Business name">
        <Input id="business-name" placeholder="e.g. Adùnní Threads" />
      </FormField>
      <FormField id="city" label="Where are you based?">
        <Input id="city" placeholder="City, e.g. Lagos" />
      </FormField>
    </OnboardingShell>
  );
}
