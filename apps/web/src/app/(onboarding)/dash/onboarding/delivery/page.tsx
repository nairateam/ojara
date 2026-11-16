import { formatKobo } from '@ojara/shared';
import { Info, Pencil, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { ComingSoonNote } from '@/components/onboarding/coming-soon-note';
import { OnbField, SectionToggle } from '@/components/onboarding/fields';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { CheckoutOptions, PhonePreview } from '@/components/onboarding/phone-preview';
import { Checkbox } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { requireOnboardingStep } from '@/lib/auth/guards';
import { withStore } from '@/lib/onboarding/preview';
import { DELIVERY_ZONES, PICKUP } from '@/mock/onboarding';
import { continueFromDelivery } from '../actions';

export const metadata: Metadata = { title: 'Set up your store · Delivery & pickup' };

const th = 'text-[11px] font-semibold tracking-[0.6px] text-fg-subtle uppercase';

/** 02.08 Onboarding 5 · Delivery & pickup (visual form; saving arrives with the delivery feature). */
export default async function OnboardingDeliveryPage() {
  const { store, reached } = await requireOnboardingStep(5);
  return (
    <OnboardingShell
      step={5}
      reached={reached}
      store={store}
      action={continueFromDelivery}
      notice={
        <ComingSoonNote>
          Delivery zones and pickup can be saved soon. The zones below are examples — continue for
          now.
        </ComingSoonNote>
      }
      title="How will customers get their orders?"
      subtitle="Customers see these options and charges at checkout, before they pay."
      preview={
        <PhonePreview caption="What customers see at checkout" {...withStore(store)}>
          <CheckoutOptions />
        </PhonePreview>
      }
    >
      <section className="flex flex-col gap-3">
        <SectionToggle title="Delivery">
          <Switch defaultChecked aria-label="Offer delivery" />
        </SectionToggle>
        <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
          <div className="flex items-center gap-3 bg-paper px-3.5 py-2" aria-hidden>
            <span className={`${th} w-[136px] shrink-0 max-sm:flex-1`}>Zone</span>
            <span className={`${th} hidden flex-1 sm:block`}>Covers</span>
            <span className={`${th} w-[70px] shrink-0`}>Charge</span>
            <span className={`${th} w-[70px] shrink-0`}>Arrives</span>
            <span className="w-4 shrink-0" />
          </div>
          <ul>
            {DELIVERY_ZONES.map((z) => (
              <li
                key={z.zone}
                className="flex items-center gap-3 border-t border-line px-3.5 py-[11px] text-ui"
              >
                <span className="flex w-[136px] shrink-0 flex-col max-sm:flex-1">
                  <span className="font-semibold text-fg">{z.zone}</span>
                  <span className="text-xs text-fg-muted sm:hidden">{z.covers}</span>
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-fg-muted sm:block">
                  {z.covers}
                </span>
                <span className="w-[70px] shrink-0 font-semibold text-fg">
                  {formatKobo(z.chargeKobo)}
                </span>
                <span className="w-[70px] shrink-0 text-fg-muted">{z.arrives}</span>
                <button
                  type="button"
                  aria-label={`Edit ${z.zone}`}
                  className="shrink-0 text-fg-subtle hover:text-fg"
                >
                  <Pencil className="size-4" />
                </button>
              </li>
            ))}
            <li className="border-t border-line">
              <button
                type="button"
                className="flex w-full items-center gap-1.5 px-3.5 py-[11px] text-ui font-semibold text-fg hover:bg-selected"
              >
                <Plus className="size-3.5" aria-hidden /> Add delivery zone
              </button>
            </li>
          </ul>
        </div>
        <label className="flex flex-wrap items-center gap-2.5 rounded-md bg-paper px-3 py-2.5 text-ui text-fg">
          <Checkbox defaultChecked name="freeDelivery" />
          <span className="min-w-0 sm:flex-initial max-sm:flex-1">
            Free delivery in Lagos zones when the order is over
          </span>
          <span className="flex items-center gap-1 rounded-sm border border-line bg-surface px-2.5 py-[5px]">
            <span className="text-fg-subtle">₦</span>
            <input
              name="freeDeliveryOver"
              defaultValue={PICKUP.freeDeliveryOver}
              inputMode="numeric"
              aria-label="Minimum order for free delivery"
              className="w-[52px] bg-transparent font-medium text-fg outline-none"
            />
          </span>
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <SectionToggle title="Pickup">
          <Switch defaultChecked aria-label="Offer pickup" />
        </SectionToggle>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_220px]">
          <OnbField label="Pickup address" htmlFor="pickup-address">
            <Input
              id="pickup-address"
              name="pickupAddress"
              className="h-[42px] px-3.5"
              defaultValue={PICKUP.address}
            />
          </OnbField>
          <OnbField label="Opening hours" htmlFor="pickup-hours">
            <Input
              id="pickup-hours"
              name="pickupHours"
              className="h-[42px] px-3.5"
              defaultValue={PICKUP.hours}
            />
          </OnbField>
        </div>
      </section>

      <p className="flex items-center gap-2.5 rounded-[10px] bg-attention-soft px-3.5 py-3 text-xs leading-[17px] text-[#6E4A0E]">
        <Info className="size-4 shrink-0 text-warning" aria-hidden />
        You arrange the rider or courier. Ojara shows the delivery details on each order and texts
        customers when you update the status.
      </p>
    </OnboardingShell>
  );
}
