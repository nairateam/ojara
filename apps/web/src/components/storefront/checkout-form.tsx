'use client';

import { formatKobo, NIGERIAN_STATES, type StorefrontDeliveryDto } from '@ojara/shared';
import { ArrowLeft, CircleAlert, Lock, ShieldCheck, Store, Truck } from 'lucide-react';
import Link from 'next/link';
import {
  type FormEvent,
  type ReactNode,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from 'react';
import {
  type CheckoutFormState,
  placeOrder,
  refreshCart,
} from '@/app/(storefront)/store-site/[host]/(checkout)/(steps)/checkout/actions';
import { cn } from '@/lib/utils';
import { type CartLine, useCart } from './cart';
import { StickyBar, StoreField, StorePhoto, storeButton, storeInput } from './primitives';

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 md:gap-4" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="flex items-center gap-2.5">
        <span className="hidden size-6 items-center justify-center rounded-full bg-store-ink text-xs font-bold text-white md:flex">
          {n}
        </span>
        <span className="font-serif text-lg font-medium text-store-ink md:text-[22px]">
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

function FieldError({ children }: { children?: string | undefined }) {
  return children ? <p className="text-xs font-medium text-danger">{children}</p> : null;
}

const select = cn(storeInput, 'appearance-none');

/**
 * 05.05 Checkout / 05.15 Mobile – Checkout. Refreshes the browser cart's prices and stock from the
 * store, collects contact and delivery details, and hands over to Paystack. The total shown is
 * sent as `expectedTotalKobo`, so the shopper never pays an amount they didn't see.
 */
export function CheckoutForm({
  storeName,
  delivery,
}: {
  storeName: string;
  delivery: StorefrontDeliveryDto;
}) {
  const cart = useCart();
  const [refreshed, setRefreshed] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [state, action, pending] = useActionState<CheckoutFormState, FormData>(placeOrder, {});
  const errors = state.fieldErrors ?? {};

  const canDeliver = delivery.zones.length > 0;
  const [method, setMethod] = useState<'delivery' | 'pickup'>(canDeliver ? 'delivery' : 'pickup');
  const [zoneId, setZoneId] = useState(delivery.zones[0]?.id ?? '');

  // Bring the saved cart up to date (prices, stock) once, before the shopper pays.
  const lineKey = cart.lines.map((l) => `${l.variantId}:${l.qty}`).join(',');
  useEffect(() => {
    if (refreshed || cart.lines.length === 0) return;
    let cancelled = false;
    refreshCart(cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })))
      .then(({ lines }) => {
        if (cancelled) return;
        const changes: string[] = [];
        const next: CartLine[] = [];
        for (const l of cart.lines) {
          const r = lines.find((x) => x.variantId === l.variantId);
          if (!r || r.status === 'gone' || r.status === 'sold-out' || r.maxQty === 0) {
            changes.push(`${l.name} is no longer available and was removed.`);
            continue;
          }
          const qty = Math.min(l.qty, r.maxQty);
          if (qty < l.qty) changes.push(`Only ${r.maxQty} of ${r.name} left; quantity updated.`);
          if (r.priceKobo !== l.priceKobo) changes.push(`The price of ${r.name} changed.`);
          next.push({
            variantId: l.variantId,
            slug: r.slug,
            name: r.name,
            label: r.label,
            priceKobo: r.priceKobo,
            compareAtKobo: r.compareAtKobo,
            publicId: r.publicId,
            qty,
          });
        }
        cart.replace(next);
        setNotice(changes.length ? changes.join(' ') : undefined);
        setRefreshed(true);
      })
      .catch(() => {
        if (!cancelled) setRefreshed(true);
      });
    return () => {
      cancelled = true;
    };
    // Only on first load (and when the cart's contents change before that finishes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineKey, refreshed]);

  const zone = delivery.zones.find((z) => z.id === zoneId);
  const subtotal = cart.subtotalKobo;
  const freeDelivery =
    delivery.freeDeliveryOverKobo !== null && subtotal >= delivery.freeDeliveryOverKobo;
  const deliveryFee = method === 'delivery' && zone && !freeDelivery ? zone.feeKobo : 0;
  const total = subtotal + deliveryFee;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const text = (k: string) => {
      const v = f.get(k);
      return typeof v === 'string' ? v : '';
    };
    const payload = {
      lines: cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
      customer: { name: text('name'), phone: text('phone'), email: text('email') },
      fulfilment:
        method === 'delivery'
          ? {
              type: 'delivery',
              zoneId,
              address: {
                line1: text('street'),
                city: text('city'),
                state: text('state'),
                landmark: text('landmark'),
              },
            }
          : { type: 'pickup' },
      note: text('note'),
      expectedTotalKobo: total,
    };
    const data = new FormData();
    data.set('payload', JSON.stringify(payload));
    startTransition(() => action(data));
  }

  if (cart.lines.length === 0 && refreshed) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="font-serif text-2xl text-store-ink">Your cart is empty</p>
        <Link href="/shop" className={storeButton('primary')}>
          Continue shopping
        </Link>
      </div>
    );
  }

  const message = state.message;
  const payLabel = pending ? 'Starting payment…' : `Pay ${formatKobo(total)}`;

  return (
    <div className="flex flex-col gap-14 px-4 pt-4 pb-[130px] md:px-8 md:pt-10 md:pb-20 lg:flex-row lg:items-start xl:px-[120px]">
      <form
        id="checkout"
        onSubmit={onSubmit}
        noValidate
        className="flex min-w-0 flex-1 flex-col gap-5 md:gap-9"
      >
        <Link
          href="/cart"
          className="hidden items-center gap-1.5 self-start text-ui font-medium text-store-body hover:text-store-ink md:flex"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to cart
        </Link>

        {notice ? (
          <p role="status" className="rounded-md bg-store-band px-3.5 py-3 text-ui text-store-ink">
            {notice}
          </p>
        ) : null}
        {message ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md bg-danger-soft px-3.5 py-3 text-ui text-danger"
          >
            <CircleAlert className="mt-px size-4 shrink-0" aria-hidden /> {message}
          </p>
        ) : null}

        <Section n={1} title="Contact">
          <div className="grid gap-3.5 md:grid-cols-2">
            <StoreField label="Full name" htmlFor="name">
              <input id="name" name="name" autoComplete="name" className={storeInput} />
              <FieldError>{errors['customer.name']}</FieldError>
            </StoreField>
            <StoreField label="Phone number" htmlFor="phone">
              <span className="flex items-center gap-2 rounded-md border border-store-border bg-store-card px-3 py-3 focus-within:border-store-primary md:px-3.5">
                <span className="text-sm text-store-body">+234</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="803 555 0144"
                  className="min-w-0 flex-1 bg-transparent text-sm text-store-ink outline-none"
                />
              </span>
              <FieldError>{errors['customer.phone']}</FieldError>
            </StoreField>
            <StoreField
              label="Email"
              htmlFor="email"
              hint="Your receipt and order confirmation go here."
              className="md:col-span-2"
            >
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={storeInput}
              />
              <FieldError>{errors['customer.email']}</FieldError>
            </StoreField>
          </div>
        </Section>

        <Section n={2} title="How would you like to get it?">
          <div className="flex flex-col gap-2.5 md:flex-row md:gap-3.5">
            {canDeliver ? (
              <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-[10px] border border-store-border bg-store-card p-3 has-checked:border-store-primary has-checked:shadow-[inset_0_0_0_0.5px_var(--store-primary)] md:p-4">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'delivery'}
                  onChange={() => setMethod('delivery')}
                  className="mt-1 accent-[var(--store-primary)]"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-store-ink">
                    <Truck className="size-4" aria-hidden /> Delivery
                  </span>
                  <span className="text-xs text-store-body">
                    From {formatKobo(Math.min(...delivery.zones.map((z) => z.feeKobo)))}
                    {delivery.freeDeliveryOverKobo !== null
                      ? ` · free over ${formatKobo(delivery.freeDeliveryOverKobo)}`
                      : ''}
                  </span>
                </span>
              </label>
            ) : null}
            {delivery.pickup ? (
              <label className="flex flex-1 cursor-pointer items-start gap-3 rounded-[10px] border border-store-border bg-store-card p-3 has-checked:border-store-primary has-checked:shadow-[inset_0_0_0_0.5px_var(--store-primary)] md:p-4">
                <input
                  type="radio"
                  name="method"
                  checked={method === 'pickup'}
                  onChange={() => setMethod('pickup')}
                  className="mt-1 accent-[var(--store-primary)]"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-store-ink">
                    <Store className="size-4" aria-hidden /> Pickup · free
                  </span>
                  <span className="text-xs text-store-body">
                    {delivery.pickup.address}
                    {delivery.pickup.hours ? ` · ${delivery.pickup.hours}` : ''}
                  </span>
                </span>
              </label>
            ) : null}
          </div>
        </Section>

        {method === 'delivery' ? (
          <Section n={3} title="Delivery address">
            <div className="flex flex-col gap-4">
              <StoreField
                label="Delivery area"
                htmlFor="zone"
                hint={`Delivery charges are set by ${storeName}.`}
              >
                <select
                  id="zone"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className={select}
                >
                  {delivery.zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} — {formatKobo(z.feeKobo)}
                      {z.eta ? ` · ${z.eta}` : ''}
                    </option>
                  ))}
                </select>
                {zone && zone.areas.length ? (
                  <span className="text-xs text-store-body">Covers {zone.areas.join(', ')}</span>
                ) : null}
              </StoreField>
              <StoreField label="Street address" htmlFor="street">
                <input
                  id="street"
                  name="street"
                  autoComplete="street-address"
                  className={storeInput}
                />
                <FieldError>{errors['fulfilment.address.line1']}</FieldError>
              </StoreField>
              <div className="grid gap-3.5 md:grid-cols-2">
                <StoreField label="City or area" htmlFor="city">
                  <input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    className={storeInput}
                  />
                </StoreField>
                <StoreField label="State" htmlFor="state">
                  <select id="state" name="state" defaultValue="" className={select}>
                    <option value="">Choose a state</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </StoreField>
              </div>
              <StoreField label="Landmark or note for the rider (optional)" htmlFor="landmark">
                <input id="landmark" name="landmark" className={storeInput} />
              </StoreField>
            </div>
          </Section>
        ) : null}

        <StoreField label="Order note (optional)" htmlFor="note">
          <input id="note" name="note" maxLength={300} className={storeInput} />
        </StoreField>

        <div className="hidden flex-col gap-3 md:flex">
          <div className="flex items-center gap-3 rounded-[10px] border border-store-border bg-store-card p-[18px]">
            <span className="flex size-9 items-center justify-center rounded-md bg-success-soft text-success">
              <ShieldCheck className="size-[18px]" aria-hidden />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-store-ink">
                You’ll pay securely on Paystack
              </span>
              <span className="text-xs text-store-body">
                Card, bank transfer or USSD. Your card details never touch this store.
              </span>
            </span>
          </div>
          <button
            type="submit"
            disabled={pending || !refreshed}
            className={storeButton('primary', 'w-full rounded-[10px] py-[17px] text-base')}
          >
            <Lock className="size-4" aria-hidden />
            {payLabel}
          </button>
        </div>
      </form>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:w-[400px] lg:shrink-0 xl:w-[420px]">
        <div className="flex flex-col gap-[18px] rounded-[14px] border border-store-border bg-store-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-[22px] font-medium text-store-ink">Your order</h2>
            <span className="text-ui text-store-body">
              {cart.count} {cart.count === 1 ? 'item' : 'items'}
            </span>
          </div>
          <ul className="flex flex-col gap-[18px]">
            {cart.lines.map((l) => (
              <li key={l.variantId} className="flex items-center gap-3.5">
                <span className="relative block h-[72px] w-16 shrink-0 overflow-hidden rounded-md bg-store-band">
                  <StorePhoto publicId={l.publicId} alt={l.name} sizes="160px" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-semibold text-store-ink">{l.name}</span>
                  <span className="text-xs text-store-body">
                    {l.label ? `${l.label} · ` : ''}Qty {l.qty}
                  </span>
                </span>
                <span className="text-sm font-semibold text-store-ink">
                  {formatKobo(l.priceKobo * l.qty)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-2.5 border-t border-store-border pt-4 text-ui">
            <div className="flex justify-between">
              <dt className="text-store-body">Subtotal</dt>
              <dd className="font-medium text-store-ink">{formatKobo(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-store-body">
                {method === 'pickup' ? 'Pickup' : `Delivery${zone ? ` · ${zone.name}` : ''}`}
              </dt>
              <dd className="font-medium text-store-ink">
                {deliveryFee === 0 ? 'Free' : formatKobo(deliveryFee)}
              </dd>
            </div>
            <div className="flex items-center justify-between pt-2">
              <dt className="text-sm font-semibold text-store-ink">Total</dt>
              <dd className="font-serif text-[28px] font-semibold text-store-ink">
                {formatKobo(total)}
              </dd>
            </div>
          </dl>
        </div>
      </aside>

      <StickyBar className="flex-col gap-2">
        <button
          type="submit"
          form="checkout"
          disabled={pending || !refreshed}
          className={storeButton('primary', 'h-[50px] w-full rounded-[10px] py-0')}
        >
          <Lock className="size-[15px]" aria-hidden />
          {payLabel}
        </button>
        <p className="text-center text-2xs text-store-body">
          Secure payment by Paystack · no account needed
        </p>
      </StickyBar>
    </div>
  );
}
