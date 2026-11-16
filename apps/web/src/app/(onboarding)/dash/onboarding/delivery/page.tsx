import { deliverySettingsSchema } from '@ojara/shared';
import { Info } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OnboardingDeliveryFields } from '@/components/onboarding/onboarding-delivery-fields';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { apiGet } from '@/lib/api/session';
import { requireOnboardingStep } from '@/lib/auth/guards';
import { storeHost } from '@/lib/onboarding/preview';
import { saveDeliveryStep } from '../actions';

export const metadata: Metadata = { title: 'Set up your store · Delivery & pickup' };

/** 02.08 Onboarding 5 · Delivery & pickup: the same editor as Settings → Delivery (03.11). */
export default async function OnboardingDeliveryPage() {
  const { store, reached } = await requireOnboardingStep(5);
  if (!store) redirect('/onboarding');
  const settings = await apiGet(
    `/stores/${encodeURIComponent(store.id)}/delivery`,
    deliverySettingsSchema,
  );
  return (
    <OnboardingShell
      step={5}
      reached={reached}
      store={store}
      action={saveDeliveryStep}
      title="How will customers get their orders?"
      subtitle="Customers see these options and charges at checkout, before they pay."
    >
      <OnboardingDeliveryFields
        initial={settings}
        storeName={store.name}
        storeAddress={storeHost(store.slug)}
      />
      <p className="flex items-center gap-2.5 rounded-[10px] bg-attention-soft px-3.5 py-3 text-xs leading-[17px] text-[#6E4A0E]">
        <Info className="size-4 shrink-0 text-warning" aria-hidden />
        You arrange the rider or courier. Ojara shows the delivery details on each order.
      </p>
    </OnboardingShell>
  );
}
