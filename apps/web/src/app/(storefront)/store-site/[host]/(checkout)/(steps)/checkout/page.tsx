import { formatKobo } from '@ojara/shared';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  Hash,
  Landmark,
  Lock,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  StickyBar,
  StoreField,
  storeButton,
  storeInput,
  Thumb,
} from '@/components/storefront/primitives';
import { QuantityStepper } from '@/components/storefront/quantity-stepper';
import { getStore, type HostParams } from '@/components/storefront/store';
import { cn } from '@/lib/utils';
import {
  CART_COUNT,
  CART_SUBTOTAL,
  cartLines,
  DELIVERY,
  DELIVERY_AREAS,
  ORDER,
  STATES,
  STORE,
} from '@/mock/storefront';

export const metadata: Metadata = { title: 'Checkout' };

function Section({
  n,
  title,
  mobileTitle = title,
  sub,
  children,
}: {
  n: number;
  title: string;
  /** 05.15 uses shorter section titles; null hides the heading on mobile. */
  mobileTitle?: string | null;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5 md:gap-4" aria-labelledby={`step-${n}`}>
      <div className={cn('flex flex-col gap-1', mobileTitle === null && 'max-md:hidden')}>
        <h2 id={`step-${n}`} className="flex items-center gap-2.5">
          <span className="hidden size-6 items-center justify-center rounded-full bg-store-ink text-xs font-bold text-white md:flex">
            {n}
          </span>
          <span className="font-serif text-lg font-medium text-store-ink md:text-[22px]">
            {mobileTitle ? <span className="md:hidden">{mobileTitle}</span> : null}
            <span className="hidden md:inline">{title}</span>
          </span>
        </h2>
        {sub ? <p className="hidden text-ui text-store-body md:block">{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SelectBox({
  id,
  name,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <span className="relative flex items-center">
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className={cn(storeInput, 'appearance-none pr-10')}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 size-4 text-store-body"
        aria-hidden
      />
    </span>
  );
}

function MethodOption({
  value,
  defaultChecked,
  icon,
  title,
  mobileTitle,
  sub,
  mobileSub,
  price,
}: {
  value: string;
  defaultChecked?: boolean;
  icon: ReactNode;
  title: string;
  mobileTitle: string;
  sub: string;
  mobileSub: string;
  price: string;
}) {
  return (
    <label className="group/opt flex flex-1 cursor-pointer items-center gap-2.5 rounded-[10px] border border-store-border bg-store-card p-3 has-checked:border-store-primary has-checked:shadow-[inset_0_0_0_0.5px_var(--store-primary)] has-focus-visible:outline-2 has-focus-visible:outline-store-primary md:items-start md:gap-3 md:p-4 md:not-has-checked:bg-transparent">
      <input
        type="radio"
        name="method"
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="size-4 shrink-0 rounded-full border-[1.5px] border-store-muted/60 bg-store-card peer-checked:border-[5px] peer-checked:border-store-primary md:size-[18px] md:peer-checked:border-[5.5px]"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-px md:gap-[3px]">
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-ui font-semibold text-store-ink md:text-sm">
            <span className="hidden md:inline">{icon}</span>
            <span className="md:hidden">{mobileTitle}</span>
            <span className="hidden md:inline">{title}</span>
          </span>
          <span className="hidden text-ui font-semibold text-store-ink group-has-checked/opt:text-store-primary md:inline">
            {price}
          </span>
        </span>
        <span className="text-2xs text-store-body md:text-xs">
          <span className="md:hidden">{mobileSub}</span>
          <span className="hidden md:inline">{sub}</span>
        </span>
      </span>
      <span className="text-ui font-bold text-store-ink group-has-checked/opt:text-store-primary md:hidden">
        {price}
      </span>
    </label>
  );
}

/** 05.05 Checkout / 05.15 Mobile – Checkout (static sample state, no payment). */
export default async function CheckoutPage({ params }: { params: HostParams }) {
  const store = await getStore(params);
  const lines = cartLines();
  const total = formatKobo(ORDER.total);
  const formId = 'checkout';

  return (
    <div className="flex flex-col gap-14 px-4 pt-4 pb-[130px] md:px-8 md:pt-10 md:pb-20 lg:flex-row lg:items-start xl:px-[120px]">
      <form
        id={formId}
        action="/checkout/confirmed"
        className="flex min-w-0 flex-1 flex-col gap-4 md:gap-9"
      >
        <Link
          href="/cart"
          className="hidden items-center gap-1.5 self-start text-ui font-medium text-store-body hover:text-store-ink md:flex"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back to cart
        </Link>

        <Section
          n={1}
          title="Contact"
          sub="We’ll send your receipt and delivery updates here. No account needed."
        >
          <div className="grid gap-3.5 md:grid-cols-2">
            <StoreField label="Phone number" htmlFor="phone">
              <span className="flex items-center gap-2 rounded-md border border-store-border bg-store-card px-3 py-3 focus-within:border-store-primary md:px-3.5">
                <span className="flex items-center gap-1.5 text-sm text-store-body md:border-r md:border-store-border md:pr-2.5">
                  <span className="hidden md:inline" aria-hidden>
                    🇳🇬
                  </span>
                  +234
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel-national"
                  defaultValue={ORDER.phone}
                  className="min-w-0 flex-1 bg-transparent text-sm text-store-ink outline-none"
                />
              </span>
            </StoreField>
            <StoreField label="Email (optional)" htmlFor="email" className="hidden md:flex">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={ORDER.email}
                className={storeInput}
              />
            </StoreField>
          </div>
          <label className="hidden cursor-pointer items-center gap-2.5 text-ui text-store-ink md:flex">
            <span className="relative flex size-[18px]">
              <input
                type="checkbox"
                name="whatsappUpdates"
                defaultChecked
                className="peer size-full appearance-none rounded-xs border-[1.5px] border-store-muted/60 bg-store-card checked:border-store-primary checked:bg-store-primary focus-visible:outline-2 focus-visible:outline-store-primary"
              />
              <Check
                className="pointer-events-none absolute inset-0 m-auto size-3 text-store-primary-fg opacity-0 peer-checked:opacity-100"
                aria-hidden
              />
            </span>
            Send me order updates on WhatsApp
          </label>
        </Section>

        <Section n={2} title="How would you like to get it?" mobileTitle="Delivery">
          <div className="flex flex-col gap-2.5 md:flex-row md:gap-3.5">
            <MethodOption
              value="delivery"
              defaultChecked
              icon={<Truck className="size-4" aria-hidden />}
              title="Delivery"
              mobileTitle={`Delivery · ${DELIVERY.area}`}
              sub="Lagos 1–2 days · other states 3–5 days"
              mobileSub="1–2 days"
              price={`From ${formatKobo(DELIVERY.fee)}`}
            />
            <MethodOption
              value="pickup"
              icon={<Store className="size-4" aria-hidden />}
              title="Pickup"
              mobileTitle="Pickup · Surulere studio"
              sub="Surulere studio · ready in 24 hours"
              mobileSub="Ready in 24 h"
              price="Free"
            />
          </div>
        </Section>

        <Section n={3} title="Delivery address" mobileTitle={null}>
          <div className="flex flex-col gap-4">
            <StoreField label="Full name" htmlFor="name" className="hidden md:flex">
              <input
                id="name"
                name="name"
                autoComplete="name"
                defaultValue={ORDER.fullName}
                className={storeInput}
              />
            </StoreField>
            <StoreField label="Street address" htmlFor="street">
              <input
                id="street"
                name="street"
                autoComplete="street-address"
                defaultValue={ORDER.street}
                className={storeInput}
              />
            </StoreField>
            <div className="hidden gap-3.5 md:flex">
              <StoreField
                label="Delivery area"
                htmlFor="area"
                hint={`Delivery charges are set by ${store.name}.`}
                className="flex-1"
              >
                <SelectBox id="area" name="area" defaultValue="lekki">
                  {DELIVERY_AREAS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label} — {formatKobo(a.fee)}
                    </option>
                  ))}
                </SelectBox>
              </StoreField>
              <StoreField label="State" htmlFor="state" className="w-[200px]">
                <SelectBox id="state" name="state" defaultValue={ORDER.state}>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </SelectBox>
              </StoreField>
            </div>
            <StoreField
              label="Note for the rider (optional)"
              htmlFor="note"
              className="hidden md:flex"
            >
              <input id="note" name="note" defaultValue={ORDER.riderNote} className={storeInput} />
            </StoreField>
          </div>
        </Section>

        {/* Mobile totals (05.15) */}
        <dl className="flex flex-col gap-1.5 rounded-[10px] border border-store-border bg-store-card p-3.5 text-ui md:hidden">
          <div className="flex justify-between">
            <dt className="text-store-body">{CART_COUNT} items</dt>
            <dd className="text-store-ink">{formatKobo(CART_SUBTOTAL)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-store-body">Delivery</dt>
            <dd className="text-store-ink">{formatKobo(DELIVERY.fee)}</dd>
          </div>
          <div className="flex items-center justify-between pt-1.5">
            <dt className="text-sm font-semibold text-store-ink">Total</dt>
            <dd className="font-serif text-xl font-semibold text-store-ink">{total}</dd>
          </div>
        </dl>

        <div className="hidden md:contents">
          <Section n={4} title="Payment">
            <div className="flex flex-col gap-3.5 rounded-[10px] border border-store-border bg-store-card p-[18px]">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-success-soft text-success">
                  <ShieldCheck className="size-[18px]" aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-store-ink">
                    You’ll pay securely on Paystack
                  </span>
                  <span className="text-xs text-store-body">
                    Your card details never touch this store.
                  </span>
                </span>
              </div>
              <ul className="flex flex-wrap gap-2">
                {[
                  { icon: CreditCard, label: 'Card' },
                  { icon: Landmark, label: 'Bank transfer' },
                  { icon: Hash, label: 'USSD' },
                  { icon: Smartphone, label: 'Opay / mobile money' },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-1.5 rounded-sm bg-store-band px-2.5 py-1.5 text-xs font-medium text-store-ink"
                  >
                    <Icon className="size-3.5 text-store-body" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </Section>
          <button
            type="submit"
            className={storeButton('primary', 'w-full rounded-[10px] py-[17px] text-base')}
          >
            <Lock className="size-4" aria-hidden />
            Pay {total}
          </button>
          <p className="text-center text-xs text-store-body">
            By paying you agree to {store.name}’ 7-day returns policy. Ojara never charges you a fee
            at checkout.
          </p>
        </div>
      </form>

      {/* Order summary (desktop) */}
      <aside className="hidden flex-col gap-4 md:flex lg:sticky lg:top-6 lg:w-[400px] lg:shrink-0 xl:w-[420px]">
        <div className="flex flex-col gap-[18px] rounded-[14px] border border-store-border bg-store-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-[22px] font-medium text-store-ink">Your order</h2>
            <span className="text-ui text-store-body">{CART_COUNT} items</span>
          </div>
          <ul className="flex flex-col gap-[18px]">
            {lines.map((line) => (
              <li key={line.slug} className="flex items-center gap-3.5">
                <Thumb src={line.product.image} alt={line.product.name} className="h-[72px] w-16" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="text-sm font-semibold text-store-ink">{line.product.name}</span>
                  <span className="text-xs text-store-body">{line.variant}</span>
                  <QuantityStepper size="xs" initial={line.qty} className="self-start" />
                </div>
                <span className="text-sm font-semibold text-store-ink">
                  {formatKobo(line.total)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="flex flex-col gap-2.5 border-t border-store-border pt-4 text-ui">
            <div className="flex justify-between">
              <dt className="text-store-body">Subtotal</dt>
              <dd className="font-medium text-store-ink">{formatKobo(CART_SUBTOTAL)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-store-body">Delivery · {DELIVERY.area}</dt>
              <dd className="font-medium text-store-ink">{formatKobo(DELIVERY.fee)}</dd>
            </div>
            <div className="flex items-center justify-between pt-2">
              <dt className="text-sm font-semibold text-store-ink">Total</dt>
              <dd className="font-serif text-[28px] font-semibold text-store-ink">{total}</dd>
            </div>
          </dl>
        </div>
        <ul className="flex flex-col gap-3 px-2 py-1 text-xs text-store-body">
          <li className="flex items-center gap-2.5">
            <RotateCcw className="size-[15px]" aria-hidden />
            Returns and exchanges within 7 days
          </li>
          <li className="flex items-center gap-2.5">
            <MessageCircle className="size-[15px]" aria-hidden />
            <a href={STORE.whatsappHref}>Questions? WhatsApp {STORE.whatsapp}</a>
          </li>
        </ul>
      </aside>

      <StickyBar className="flex-col gap-2">
        <button
          type="submit"
          form={formId}
          className={storeButton('primary', 'h-[50px] w-full rounded-[10px] py-0')}
        >
          <Lock className="size-[15px]" aria-hidden />
          Pay {total} with Paystack
        </button>
        <p className="text-center text-2xs text-store-body">
          Secure payment by Paystack · no account needed
        </p>
      </StickyBar>
    </div>
  );
}
