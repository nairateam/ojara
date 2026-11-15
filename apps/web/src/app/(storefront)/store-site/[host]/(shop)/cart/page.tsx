import { formatKobo } from '@ojara/shared';
import { ArrowLeft, Lock, Trash2, X } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FreeDeliveryProgress,
  InStock,
  MobileSubHeader,
  StickyBar,
  StoreLinkButton,
  Thumb,
} from '@/components/storefront/primitives';
import { QuantityStepper } from '@/components/storefront/quantity-stepper';
import { CART_COUNT, CART_SUBTOTAL, cartLines, DELIVERY, STORE } from '@/mock/storefront';

export const metadata: Metadata = { title: 'Your cart' };

const PAY_NOTE = 'Secure payment by Paystack · no account needed';

/** 05.04 Cart / 05.14 Mobile – Cart (static sample cart). */
export default function CartPage() {
  const lines = cartLines();
  const total = formatKobo(CART_SUBTOTAL);
  return (
    <>
      <MobileSubHeader backHref="/shop" title={`Your cart (${CART_COUNT})`} />

      {/* Mobile (05.14) */}
      <div className="flex flex-col gap-3.5 p-4 md:hidden">
        <FreeDeliveryProgress subtotal={CART_SUBTOTAL} threshold={STORE.freeDeliveryThreshold} />
        <ul className="flex flex-col gap-3.5">
          {lines.map((line) => (
            <li
              key={line.slug}
              className="flex gap-3 rounded-lg border border-store-border bg-store-card p-3"
            >
              <Thumb
                src={line.product.image}
                alt={line.product.name}
                className="h-[90px] w-[76px]"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/products/${line.slug}`}
                    className="text-sm font-semibold text-store-ink"
                  >
                    {line.product.name}
                  </Link>
                  <button type="button" aria-label={`Remove ${line.product.name}`}>
                    <X className="size-4 text-store-body" aria-hidden />
                  </button>
                </div>
                <span className="text-xs text-store-body">{line.variantShort}</span>
                <div className="mt-auto flex items-center justify-between">
                  <QuantityStepper size="sm" initial={line.qty} />
                  <span className="text-sm font-semibold text-store-ink">
                    {formatKobo(line.total)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 px-1 py-1.5 text-ui">
          <div className="flex justify-between">
            <dt className="text-store-body">Subtotal</dt>
            <dd className="font-medium text-store-ink">{total}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-store-body">Delivery</dt>
            <dd className="font-medium text-store-ink">At checkout</dd>
          </div>
        </dl>
      </div>
      <StickyBar className="flex-col gap-2">
        <StoreLinkButton href="/checkout" className="h-[50px] w-full rounded-[10px] py-0">
          <Lock className="size-[15px]" aria-hidden />
          Checkout · {total}
        </StoreLinkButton>
        <p className="text-center text-2xs text-store-body">{PAY_NOTE}</p>
      </StickyBar>

      {/* Desktop (05.04) */}
      <section className="hidden flex-col gap-7 px-8 pt-9 pb-[88px] md:flex xl:px-[120px]">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-[44px] font-medium tracking-[-1px] text-store-ink">
            Your cart
          </h1>
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-sm font-semibold text-store-primary"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Continue shopping
          </Link>
        </div>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start xl:gap-14">
          <ul className="flex min-w-0 flex-1 flex-col border-b border-store-border">
            {lines.map((line) => (
              <li key={line.slug} className="flex gap-5 border-t border-store-border py-[22px]">
                <Thumb
                  src={line.product.image}
                  alt={line.product.name}
                  className="h-[140px] w-[120px] rounded-[10px]"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/products/${line.slug}`}
                      className="font-serif text-xl font-medium text-store-ink"
                    >
                      {line.product.name}
                    </Link>
                    <span className="text-base font-semibold text-store-ink">
                      {formatKobo(line.total)}
                    </span>
                  </div>
                  <span className="text-sm text-store-body">{line.variant}</span>
                  <InStock />
                  <div className="mt-auto flex items-center justify-between">
                    <QuantityStepper size="md" initial={line.qty} />
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-ui text-store-body hover:text-store-ink"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="flex w-full flex-col gap-[18px] rounded-[14px] border border-store-border bg-store-card p-6 lg:w-[400px] lg:shrink-0">
            <h2 className="font-serif text-[22px] font-medium text-store-ink">Order summary</h2>
            <FreeDeliveryProgress
              subtotal={CART_SUBTOTAL}
              threshold={STORE.freeDeliveryThreshold}
            />
            <dl className="flex flex-col gap-[18px] text-sm">
              <div className="flex justify-between">
                <dt className="text-store-body">Subtotal ({CART_COUNT} items)</dt>
                <dd className="font-medium text-store-ink">{total}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-store-body">Delivery</dt>
                <dd className="font-medium text-store-ink">
                  From {formatKobo(DELIVERY.fromFee)} · at checkout
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-store-border pt-[18px]">
                <dt className="text-title font-semibold text-store-ink">Total</dt>
                <dd className="font-serif text-[26px] font-semibold text-store-ink">{total}</dd>
              </div>
            </dl>
            <StoreLinkButton
              href="/checkout"
              className="h-[52px] w-full rounded-[10px] py-0 text-base"
            >
              <Lock className="size-[15px]" aria-hidden />
              Checkout
            </StoreLinkButton>
            <div className="flex justify-center gap-1.5">
              {['Card', 'Transfer', 'USSD'].map((m) => (
                <span
                  key={m}
                  className="rounded-[5px] bg-store-band px-2 py-1 text-2xs font-semibold text-store-body"
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="text-center text-xs text-store-body">{PAY_NOTE}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
