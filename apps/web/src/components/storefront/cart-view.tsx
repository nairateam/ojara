'use client';

import { formatKobo, type StorefrontDeliveryDto } from '@ojara/shared';
import { ArrowLeft, Lock, MessageCircle, ShoppingBag, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { type CartLine, useCart } from './cart';
import {
  FreeDeliveryProgress,
  MobileSubHeader,
  StickyBar,
  StoreLinkButton,
  StorePhoto,
  storeButton,
} from './primitives';
import { QuantityStepper } from './quantity-stepper';

function LineThumb({ line, className }: { line: CartLine; className: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden bg-store-band ${className}`}>
      <StorePhoto publicId={line.publicId} alt={line.name} sizes="160px" />
    </span>
  );
}

/** WhatsApp order message: one line per item plus the total. */
function orderMessage(lines: CartLine[], subtotalKobo: number): string {
  const items = lines
    .map(
      (l) =>
        `• ${l.qty} × ${l.name}${l.label ? ` (${l.label})` : ''} — ${formatKobo(l.priceKobo * l.qty)}`,
    )
    .join('\n');
  return `Hello! I’d like to order:\n${items}\nTotal: ${formatKobo(subtotalKobo)} (before delivery)`;
}

/**
 * 05.04 Cart / 05.14 Mobile – Cart, from the cart saved in this browser. Online checkout waits
 * for payments; until then shoppers can send the order to the store on WhatsApp.
 */
/** Short delivery summary for the cart, from the store's zones and pickup. */
function deliveryText(delivery: StorefrontDeliveryDto): string {
  const fees = delivery.zones.map((z) => z.feeKobo);
  const from = fees.length ? `From ${formatKobo(Math.min(...fees))}` : null;
  if (from && delivery.pickup) return `${from} · free pickup`;
  if (from) return `${from} · at checkout`;
  if (delivery.pickup) return 'Free pickup';
  return 'Agreed with the store';
}

export function CartView({
  whatsappHref,
  delivery,
  acceptsPayments,
}: {
  whatsappHref: string | null;
  delivery: StorefrontDeliveryDto;
  /** The store can take payment online (Paystack payout account linked). */
  acceptsPayments: boolean;
}) {
  const { lines, count, subtotalKobo, setQty, remove } = useCart();
  const total = formatKobo(subtotalKobo);
  const freeOver = delivery.zones.length ? delivery.freeDeliveryOverKobo : null;
  const orderHref = whatsappHref
    ? `${whatsappHref}?text=${encodeURIComponent(orderMessage(lines, subtotalKobo))}`
    : null;
  const note = acceptsPayments
    ? 'Delivery is added at checkout. Pay securely by card, transfer or USSD.'
    : 'Online payment is coming soon. Send your order to the store to arrange payment.';

  if (lines.length === 0) {
    return (
      <>
        <MobileSubHeader backHref="/shop" title="Your cart" />
        <section className="flex flex-col items-center gap-4 px-4 py-24 text-center">
          <ShoppingBag className="size-8 text-store-muted" aria-hidden />
          <h1 className="font-serif text-3xl font-medium text-store-ink">Your cart is empty</h1>
          <p className="text-sm text-store-body">Find something you love, then add it here.</p>
          <StoreLinkButton href="/shop">Start shopping</StoreLinkButton>
        </section>
      </>
    );
  }

  const cta = acceptsPayments ? (
    <Link
      href="/checkout"
      className={storeButton('primary', 'h-[52px] w-full rounded-[10px] py-0')}
    >
      <Lock className="size-[15px]" aria-hidden />
      Checkout · {total}
    </Link>
  ) : orderHref ? (
    <a href={orderHref} className={storeButton('primary', 'h-[52px] w-full rounded-[10px] py-0')}>
      <MessageCircle className="size-[17px]" aria-hidden />
      Order on WhatsApp · {total}
    </a>
  ) : (
    <button
      type="button"
      disabled
      className={storeButton('primary', 'h-[52px] w-full rounded-[10px] py-0')}
    >
      Checkout coming soon
    </button>
  );

  return (
    <>
      <MobileSubHeader backHref="/shop" title={`Your cart (${count})`} />

      {/* Mobile (05.14) */}
      <div className="flex flex-col gap-3.5 p-4 md:hidden">
        {freeOver ? <FreeDeliveryProgress subtotal={subtotalKobo} threshold={freeOver} /> : null}
        <ul className="flex flex-col gap-3.5">
          {lines.map((line) => (
            <li
              key={line.variantId}
              className="flex gap-3 rounded-lg border border-store-border bg-store-card p-3"
            >
              <LineThumb line={line} className="h-[90px] w-[76px] rounded-md" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/products/${line.slug}`}
                    className="text-sm font-semibold text-store-ink"
                  >
                    {line.name}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => remove(line.variantId)}
                  >
                    <X className="size-4 text-store-body" aria-hidden />
                  </button>
                </div>
                {line.label ? <span className="text-xs text-store-body">{line.label}</span> : null}
                <div className="mt-auto flex items-center justify-between">
                  <QuantityStepper
                    size="sm"
                    max={99}
                    value={line.qty}
                    onChange={(qty) => setQty(line.variantId, qty)}
                  />
                  <span className="text-sm font-semibold text-store-ink">
                    {formatKobo(line.priceKobo * line.qty)}
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
            <dd className="font-medium text-store-ink">{deliveryText(delivery)}</dd>
          </div>
        </dl>
      </div>
      <StickyBar className="flex-col gap-2">
        {cta}
        <p className="text-center text-2xs text-store-body">{note}</p>
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
              <li
                key={line.variantId}
                className="flex gap-5 border-t border-store-border py-[22px]"
              >
                <LineThumb line={line} className="h-[140px] w-[120px] rounded-[10px]" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      href={`/products/${line.slug}`}
                      className="font-serif text-xl font-medium text-store-ink"
                    >
                      {line.name}
                    </Link>
                    <span className="text-base font-semibold text-store-ink">
                      {formatKobo(line.priceKobo * line.qty)}
                    </span>
                  </div>
                  {line.label ? (
                    <span className="text-sm text-store-body">{line.label}</span>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between">
                    <QuantityStepper
                      size="md"
                      max={99}
                      value={line.qty}
                      onChange={(qty) => setQty(line.variantId, qty)}
                    />
                    <button
                      type="button"
                      onClick={() => remove(line.variantId)}
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
            {freeOver ? (
              <FreeDeliveryProgress subtotal={subtotalKobo} threshold={freeOver} />
            ) : null}
            <dl className="flex flex-col gap-[18px] text-sm">
              <div className="flex justify-between">
                <dt className="text-store-body">
                  Subtotal ({count} {count === 1 ? 'item' : 'items'})
                </dt>
                <dd className="font-medium text-store-ink">{total}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-store-body">Delivery</dt>
                <dd className="font-medium text-store-ink">{deliveryText(delivery)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-store-border pt-[18px]">
                <dt className="text-title font-semibold text-store-ink">Total</dt>
                <dd className="font-serif text-[26px] font-semibold text-store-ink">{total}</dd>
              </div>
            </dl>
            {cta}
            <p className="text-center text-xs text-store-body">{note}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
