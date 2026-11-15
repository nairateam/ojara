import { formatKobo } from '@ojara/shared';
import { Check, Pencil, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { CheckoutPhonePreview } from '@/components/dashboard-store/checkout-phone-preview';
import { Button } from '@/components/ui/button';
import { Checkbox, Field, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DELIVERY_SETTINGS, DELIVERY_ZONES, STORE } from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Delivery & pickup' };

const head =
  'px-3.5 py-2 text-left text-2xs font-semibold tracking-[0.6px] text-fg-subtle uppercase';
const cell = 'px-3.5 py-[11px] text-ui';

/** 03.11 Delivery & pickup. */
export default function DeliveryPage() {
  const lekki = DELIVERY_ZONES[1]!;
  const mainland = DELIVERY_ZONES[0]!;
  return (
    <PageContainer>
      <PageHeader
        title="Delivery & pickup"
        subtitle="Shown to customers at checkout. You arrange the rider or courier."
        actions={
          <Button>
            <Check /> Save changes
          </Button>
        }
      />
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="delivery-title" className="text-title font-semibold">
                Delivery
              </h2>
              <Switch defaultChecked aria-labelledby="delivery-title" />
            </div>
            <div className="overflow-x-auto rounded-[10px] border border-line">
              <table className="w-full min-w-[560px] border-collapse">
                <thead className="bg-paper">
                  <tr>
                    <th className={`${head} w-[150px]`}>Zone</th>
                    <th className={head}>Covers</th>
                    <th className={`${head} w-[82px]`}>Charge</th>
                    <th className={`${head} w-[82px]`}>Arrives</th>
                    <th className="w-[44px]">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DELIVERY_ZONES.map((z) => (
                    <tr key={z.name} className="border-t border-line">
                      <td className={`${cell} font-semibold`}>{z.name}</td>
                      <td className={`${cell} text-fg-muted`}>{z.covers}</td>
                      <td className={`${cell} font-semibold`}>{formatKobo(z.chargeKobo)}</td>
                      <td className={`${cell} whitespace-nowrap text-fg-muted`}>{z.arrives}</td>
                      <td className="px-3.5">
                        <button
                          type="button"
                          aria-label={`Edit ${z.name}`}
                          className="flex text-fg-subtle hover:text-fg"
                        >
                          <Pencil className="size-3.5" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-line">
                    <td colSpan={5} className="px-3.5 py-[11px]">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-ui font-semibold"
                      >
                        <Plus className="size-3.5" aria-hidden /> Add delivery zone
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 rounded-md bg-paper px-3 py-2.5">
              <label className="flex items-center gap-2.5 text-ui">
                <Checkbox defaultChecked name="freeDelivery" />
                Free delivery in Lagos zones when the order is over
              </label>
              <label className="flex items-center gap-1 rounded-sm border border-line bg-surface px-2.5 py-[5px] text-ui has-focus-visible:shadow-focus">
                <span className="text-fg-subtle">₦</span>
                <input
                  aria-label="Free delivery threshold in naira"
                  inputMode="numeric"
                  defaultValue={(DELIVERY_SETTINGS.freeOverKobo / 100).toLocaleString('en-NG')}
                  className="w-14 bg-transparent font-medium outline-none"
                />
              </label>
            </div>
          </section>

          <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="pickup-title" className="text-title font-semibold">
                Pickup
              </h2>
              <Switch defaultChecked aria-labelledby="pickup-title" />
            </div>
            <div className="grid gap-3.5 sm:grid-cols-[1fr_220px]">
              <Field label="Pickup address" htmlFor="pickup-address">
                <Input id="pickup-address" defaultValue={DELIVERY_SETTINGS.pickupAddress} />
              </Field>
              <Field label="Opening hours" htmlFor="opening-hours">
                <Input id="opening-hours" defaultValue={DELIVERY_SETTINGS.openingHours} />
              </Field>
            </div>
          </section>

          <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
            <h2 className="text-title font-semibold">Processing time &amp; instructions</h2>
            <div className="grid gap-3.5 sm:grid-cols-[220px_1fr]">
              <Field label="Orders are ready to send in" htmlFor="ready-in">
                <Input id="ready-in" defaultValue={DELIVERY_SETTINGS.readyIn} />
              </Field>
              <Field label="Same-day cut-off" htmlFor="cut-off">
                <Input id="cut-off" defaultValue={DELIVERY_SETTINGS.cutOff} />
              </Field>
            </div>
            <Field label="Message on order confirmation" htmlFor="confirmation-message">
              <Textarea
                id="confirmation-message"
                defaultValue={DELIVERY_SETTINGS.confirmationMessage}
                className="min-h-16"
                rows={2}
              />
            </Field>
          </section>
        </div>

        <aside className="flex flex-col gap-3 xl:w-[320px] xl:shrink-0">
          <p className="text-center text-xs font-semibold text-fg-muted">
            What customers see at checkout
          </p>
          <CheckoutPhonePreview
            storeName={STORE.name}
            address={STORE.ojaraAddress}
            totalKobo={DELIVERY_SETTINGS.checkoutSubtotalKobo + lekki.chargeKobo}
            options={[
              {
                title: `Delivery · ${lekki.name}`,
                subtitle: lekki.arrives,
                priceKobo: lekki.chargeKobo,
                selected: true,
              },
              {
                title: `Delivery · ${mainland.name}`,
                subtitle: mainland.arrives,
                priceKobo: mainland.chargeKobo,
              },
              {
                title: 'Pickup · Surulere studio',
                subtitle: 'Mon–Sat, 10am–6pm',
                priceKobo: 0,
              },
            ]}
          />
        </aside>
      </div>
    </PageContainer>
  );
}
