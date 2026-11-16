'use client';

import { type DeliverySettingsDto, formatKobo } from '@ojara/shared';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CheckoutPhonePreview } from '@/components/dashboard-store/checkout-phone-preview';
import { Checkbox, Field, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ZoneState {
  id?: string | undefined;
  name: string;
  areas: string;
  fee: string;
  eta: string;
  isActive: boolean;
}

const toNaira = (kobo: number | null) =>
  kobo === null ? '' : (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 });

function toKobo(text: string): number {
  const n = Number(text.replace(/[₦,\s]/g, ''));
  return text.trim() === '' ? 0 : Number.isFinite(n) ? Math.round(n * 100) : Number.NaN;
}

function ErrorText({ children }: { children?: string | undefined }) {
  return children ? <p className="text-xs font-medium text-danger">{children}</p> : null;
}

/**
 * Delivery & pickup fields (03.11, onboarding 02.08). Keeps everything in client state and posts it
 * as one JSON `payload` field inside whichever form it sits in; the Server Action validates it with
 * the shared schema. `errors` are keyed by schema path (e.g. "zones.1.name", "pickupAddress").
 */
export function DeliveryFields({
  initial,
  errors = {},
  storeName,
  storeAddress,
  showPreview = true,
}: {
  initial: DeliverySettingsDto;
  errors?: Record<string, string> | undefined;
  storeName: string;
  storeAddress: string;
  showPreview?: boolean;
}) {
  const [deliveryEnabled, setDeliveryEnabled] = useState(initial.deliveryEnabled);
  const [zones, setZones] = useState<ZoneState[]>(() =>
    initial.zones.length
      ? initial.zones.map((z) => ({
          id: z.id,
          name: z.name,
          areas: z.areas.join(', '),
          fee: toNaira(z.feeKobo),
          eta: z.eta ?? '',
          isActive: z.isActive,
        }))
      : [{ name: '', areas: '', fee: '', eta: '1–2 days', isActive: true }],
  );
  const [freeOn, setFreeOn] = useState(initial.freeDeliveryOverKobo !== null);
  const [freeOver, setFreeOver] = useState(toNaira(initial.freeDeliveryOverKobo));
  const [pickupEnabled, setPickupEnabled] = useState(initial.pickupEnabled);
  const [pickupAddress, setPickupAddress] = useState(initial.pickupAddress ?? '');
  const [pickupHours, setPickupHours] = useState(initial.pickupHours ?? '');
  const [readyIn, setReadyIn] = useState(initial.orderReadyIn ?? '');
  const [cutoff, setCutoff] = useState(initial.sameDayCutoff ?? '');
  const [note, setNote] = useState(initial.orderConfirmationNote ?? '');

  const updateZone = (i: number, patch: Partial<ZoneState>) =>
    setZones((zs) => zs.map((z, j) => (j === i ? { ...z, ...patch } : z)));

  // Blank rows (nothing typed) are ignored rather than reported as errors.
  const filled = zones.filter((z) => z.name.trim() || z.areas.trim() || z.fee.trim());
  const payload = {
    deliveryEnabled,
    freeDeliveryOverKobo: freeOn ? toKobo(freeOver) || null : null,
    pickupEnabled,
    pickupAddress,
    pickupHours,
    orderReadyIn: readyIn,
    sameDayCutoff: cutoff,
    orderConfirmationNote: note,
    zones: filled.map((z) => ({
      ...(z.id ? { id: z.id } : {}),
      name: z.name,
      areas: z.areas
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      feeKobo: toKobo(z.fee),
      eta: z.eta,
      isActive: z.isActive,
    })),
  };

  const activeZones = deliveryEnabled ? filled.filter((z) => z.isActive && z.name.trim()) : [];
  const sampleSubtotal = 2_450_000;
  const previewOptions = [
    ...activeZones.slice(0, 2).map((z, i) => ({
      title: `Delivery · ${z.name}`,
      subtitle: z.eta || 'Delivery',
      priceKobo: Number.isFinite(toKobo(z.fee)) ? toKobo(z.fee) : 0,
      selected: i === 0,
    })),
    ...(pickupEnabled
      ? [
          {
            title: 'Pickup',
            subtitle: pickupHours || pickupAddress || 'Free',
            priceKobo: 0,
            selected: activeZones.length === 0,
          },
        ]
      : []),
  ];

  const zoneError = (i: number) =>
    Object.entries(errors).find(([k]) => k.startsWith(`zones.${i}.`))?.[1];

  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="delivery-title" className="text-title font-semibold">
              Delivery
            </h2>
            <Switch
              checked={deliveryEnabled}
              onCheckedChange={setDeliveryEnabled}
              aria-labelledby="delivery-title"
            />
          </div>
          <ErrorText>{errors.deliveryEnabled}</ErrorText>
          {deliveryEnabled ? (
            <>
              <ul className="flex flex-col gap-3">
                {zones.map((z, i) => (
                  <li
                    key={z.id ?? `new-${i}`}
                    className={cn(
                      'grid gap-2.5 rounded-[10px] border border-line p-3.5 sm:grid-cols-[1fr_120px_110px_auto]',
                      !z.isActive && 'opacity-60',
                    )}
                  >
                    <Field label="Zone" htmlFor={`zone-name-${i}`}>
                      <Input
                        id={`zone-name-${i}`}
                        value={z.name}
                        maxLength={60}
                        placeholder="e.g. Lagos Mainland"
                        onChange={(e) => updateZone(i, { name: e.target.value })}
                      />
                    </Field>
                    <Field label="Charge" htmlFor={`zone-fee-${i}`}>
                      <Input
                        id={`zone-fee-${i}`}
                        prefix="₦"
                        inputMode="decimal"
                        value={z.fee}
                        placeholder="0"
                        onChange={(e) => updateZone(i, { fee: e.target.value })}
                      />
                    </Field>
                    <Field label="Arrives" htmlFor={`zone-eta-${i}`}>
                      <Input
                        id={`zone-eta-${i}`}
                        value={z.eta}
                        maxLength={40}
                        placeholder="1–2 days"
                        onChange={(e) => updateZone(i, { eta: e.target.value })}
                      />
                    </Field>
                    <div className="flex items-end gap-3 pb-2">
                      <Switch
                        checked={z.isActive}
                        onCheckedChange={(on) => updateZone(i, { isActive: on })}
                        aria-label={`Offer ${z.name || 'this zone'}`}
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${z.name || 'this zone'}`}
                        onClick={() => setZones((zs) => zs.filter((_, j) => j !== i))}
                        className="text-fg-subtle hover:text-danger"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                    <Field
                      label="Covers (optional)"
                      htmlFor={`zone-areas-${i}`}
                      className="sm:col-span-4"
                    >
                      <Input
                        id={`zone-areas-${i}`}
                        value={z.areas}
                        placeholder="Areas or towns, separated by commas"
                        onChange={(e) => updateZone(i, { areas: e.target.value })}
                      />
                    </Field>
                    <div className="sm:col-span-4">
                      <ErrorText>{zoneError(i)}</ErrorText>
                    </div>
                  </li>
                ))}
              </ul>
              <ErrorText>{errors.zones}</ErrorText>
              <button
                type="button"
                onClick={() =>
                  setZones((zs) => [
                    ...zs,
                    { name: '', areas: '', fee: '', eta: '1–2 days', isActive: true },
                  ])
                }
                className="inline-flex items-center gap-1.5 self-start text-ui font-semibold"
              >
                <Plus className="size-3.5" aria-hidden /> Add delivery zone
              </button>
              <div className="flex flex-wrap items-center gap-2.5 rounded-md bg-paper px-3 py-2.5">
                <label className="flex items-center gap-2.5 text-ui">
                  <Checkbox checked={freeOn} onChange={(e) => setFreeOn(e.target.checked)} />
                  Free delivery when the order is over
                </label>
                <label className="flex items-center gap-1 rounded-sm border border-line bg-surface px-2.5 py-[5px] text-ui has-focus-visible:shadow-focus">
                  <span className="text-fg-subtle">₦</span>
                  <input
                    aria-label="Free delivery threshold in naira"
                    inputMode="numeric"
                    disabled={!freeOn}
                    value={freeOver}
                    placeholder="40,000"
                    onChange={(e) => setFreeOver(e.target.value)}
                    className="w-20 bg-transparent font-medium outline-none disabled:opacity-50"
                  />
                </label>
                <ErrorText>{errors.freeDeliveryOverKobo}</ErrorText>
              </div>
            </>
          ) : (
            <p className="text-ui text-fg-muted">
              Delivery is off. Customers can only collect their orders.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="pickup-title" className="text-title font-semibold">
              Pickup
            </h2>
            <Switch
              checked={pickupEnabled}
              onCheckedChange={setPickupEnabled}
              aria-labelledby="pickup-title"
            />
          </div>
          {pickupEnabled ? (
            <div className="grid gap-3.5 sm:grid-cols-[1fr_220px]">
              <Field label="Pickup address" htmlFor="pickup-address">
                <Input
                  id="pickup-address"
                  value={pickupAddress}
                  maxLength={200}
                  placeholder="Where customers collect their orders"
                  onChange={(e) => setPickupAddress(e.target.value)}
                  aria-invalid={errors.pickupAddress ? true : undefined}
                />
                <ErrorText>{errors.pickupAddress}</ErrorText>
              </Field>
              <Field label="Opening hours" htmlFor="opening-hours">
                <Input
                  id="opening-hours"
                  value={pickupHours}
                  maxLength={80}
                  placeholder="Mon–Sat, 10am – 6pm"
                  onChange={(e) => setPickupHours(e.target.value)}
                />
              </Field>
            </div>
          ) : (
            <p className="text-ui text-fg-muted">Pickup is off.</p>
          )}
        </section>

        <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-surface p-5">
          <h2 className="text-title font-semibold">Processing time &amp; instructions</h2>
          <div className="grid gap-3.5 sm:grid-cols-[220px_1fr]">
            <Field label="Orders are ready to send in" htmlFor="ready-in">
              <Input
                id="ready-in"
                value={readyIn}
                maxLength={60}
                placeholder="1 business day"
                onChange={(e) => setReadyIn(e.target.value)}
              />
            </Field>
            <Field label="Same-day cut-off" htmlFor="cut-off">
              <Input
                id="cut-off"
                value={cutoff}
                maxLength={80}
                placeholder="Orders paid before 2:00pm"
                onChange={(e) => setCutoff(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Message on order confirmation" htmlFor="confirmation-message">
            <Textarea
              id="confirmation-message"
              value={note}
              maxLength={500}
              placeholder="e.g. We pack every order by hand and send you the rider’s number."
              onChange={(e) => setNote(e.target.value)}
              className="min-h-16"
              rows={2}
            />
          </Field>
        </section>
      </div>

      {showPreview ? (
        <aside className="flex flex-col gap-3 xl:w-[320px] xl:shrink-0">
          <p className="text-center text-xs font-semibold text-fg-muted">
            What customers see at checkout
          </p>
          <CheckoutPhonePreview
            storeName={storeName}
            address={storeAddress}
            totalKobo={sampleSubtotal + (previewOptions.find((o) => o.selected)?.priceKobo ?? 0)}
            options={previewOptions}
          />
          {freeOn && toKobo(freeOver) > 0 ? (
            <p className="text-center text-xs text-fg-muted">
              Free delivery on orders over {formatKobo(toKobo(freeOver))}
            </p>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
