'use client';

import type { DeliverySettingsDto } from '@ojara/shared';
import { DeliveryFields } from '@/components/dashboard/delivery-fields';
import { useOnboardingForm } from './onboarding-form';

/** Delivery fields inside the onboarding form, showing that form's field errors. */
export function OnboardingDeliveryFields(props: {
  initial: DeliverySettingsDto;
  storeName: string;
  storeAddress: string;
}) {
  const { state } = useOnboardingForm();
  return <DeliveryFields {...props} errors={state.fieldErrors} />;
}
