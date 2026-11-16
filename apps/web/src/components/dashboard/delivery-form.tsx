'use client';

import type { DeliverySettingsDto } from '@ojara/shared';
import { Check, CircleAlert, CircleCheck } from 'lucide-react';
import { type FormEvent, startTransition, useActionState } from 'react';
import { saveDelivery } from '@/app/(dashboard)/dash/delivery/actions';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import type { DeliveryFormState } from '@/lib/delivery/save';
import { DeliveryFields } from './delivery-fields';
import { UnsavedIndicator } from './unsaved-indicator';

/** 03.11 Delivery & pickup page body: header with Save, feedback, and the delivery fields. */
export function DeliveryForm({
  initial,
  storeName,
  storeAddress,
  saved,
}: {
  initial: DeliverySettingsDto;
  storeName: string;
  storeAddress: string;
  saved: boolean;
}) {
  const [state, action, pending] = useActionState<DeliveryFormState, FormData>(saveDelivery, {});
  const formId = 'delivery-form';

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <>
      <PageHeader
        title="Delivery & pickup"
        subtitle="Shown to customers at checkout. You arrange the rider or courier."
        actions={
          <>
            <UnsavedIndicator formId={formId} className="hidden sm:flex" />
            <Button type="submit" form={formId} disabled={pending}>
              <Check /> {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      />
      {state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md bg-danger-soft px-3.5 py-3 text-ui text-danger"
        >
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      ) : saved ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md bg-success-soft px-3.5 py-3 text-ui text-success"
        >
          <CircleCheck className="size-4 shrink-0" aria-hidden /> Delivery settings saved.
        </p>
      ) : null}
      <form id={formId} onSubmit={onSubmit} noValidate>
        <DeliveryFields
          initial={initial}
          errors={state.fieldErrors}
          storeName={storeName}
          storeAddress={storeAddress}
        />
      </form>
    </>
  );
}
