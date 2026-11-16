'use client';

import {
  formatKobo,
  type StorefrontProductDto,
  type StorefrontVariantDto,
  variantLabel,
} from '@ojara/shared';
import { Check, Flame, MessageCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCart } from './cart';
import { InStock, StickyBar, storeButton } from './primitives';
import { QuantityStepper } from './quantity-stepper';

type BuyProduct = Omit<StorefrontProductDto, 'related'>;

function matches(v: StorefrontVariantDto, selection: Record<string, string>) {
  return Object.entries(selection).every(([k, val]) => v.options[k] === val);
}

/**
 * 05.03 / 05.13 product buy box: option pickers (values that can't be bought are struck through),
 * price for the chosen variant, quantity and Add to cart (saved in this browser), plus a WhatsApp
 * question link. Includes the mobile sticky bar.
 */
export function ProductBuyBox({
  product,
  whatsappHref,
}: {
  product: BuyProduct;
  whatsappHref: string | null;
}) {
  const cart = useCart();
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [selection, setSelection] = useState<Record<string, string>>(firstAvailable?.options ?? {});
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) =>
    product.options.every((o) => v.options[o.name] === selection[o.name]),
  );
  const canBuy = Boolean(variant?.available);
  const price = variant ?? firstAvailable;
  const onSale = price?.compareAtKobo != null;
  const label = variant ? variantLabel(variant.options, product.options) : '';

  function choose(option: string, value: string) {
    const next = { ...selection, [option]: value };
    // If that combination can't be bought, jump to one that can with this value.
    const exact = product.variants.find((v) => matches(v, next) && v.available);
    const fallback = product.variants.find((v) => v.options[option] === value && v.available);
    setSelection(exact ? next : (fallback?.options ?? next));
    setAdded(false);
  }

  function addToCart() {
    if (!variant || !variant.available) return;
    cart.add(
      {
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        label,
        priceKobo: variant.priceKobo,
        compareAtKobo: variant.compareAtKobo,
        publicId: product.images[0]?.publicId ?? null,
      },
      qty,
    );
    setAdded(true);
  }

  const ask = whatsappHref
    ? `${whatsappHref}?text=${encodeURIComponent(`Hello! I have a question about ${product.name}${label ? ` (${label})` : ''}.`)}`
    : null;
  const buttonText = !canBuy
    ? 'Sold out'
    : `Add to cart · ${formatKobo((price?.priceKobo ?? 0) * qty)}`;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'text-lg font-semibold md:text-[22px]',
            onSale ? 'text-store-eyebrow' : 'text-store-primary',
          )}
        >
          {price ? formatKobo(price.priceKobo) : ''}
        </span>
        {onSale && price?.compareAtKobo != null ? (
          <s className="text-sm text-store-muted">{formatKobo(price.compareAtKobo)}</s>
        ) : null}
        {product.soldOut || (variant && !variant.available) ? (
          <span className="rounded-pill bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger">
            Sold out
          </span>
        ) : (
          <InStock className="rounded-pill bg-success-soft px-2.5 py-1 font-semibold" />
        )}
      </div>

      {product.options.map((o) => (
        <fieldset key={o.name} className="flex flex-col gap-2 md:gap-2.5">
          <legend className="mb-2 text-ui font-semibold text-store-ink md:mb-2.5">
            {o.name}: {selection[o.name]}
          </legend>
          <div className="flex flex-wrap gap-2 md:gap-2.5">
            {o.values.map((value) => {
              const others = { ...selection, [o.name]: value };
              const buyable = product.variants.some((v) => matches(v, others) && v.available);
              const exists = product.variants.some((v) => v.options[o.name] === value);
              if (!exists) return null;
              const checked = selection[o.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => choose(o.name, value)}
                  className={cn(
                    'flex h-11 min-w-12 items-center justify-center rounded-md border px-3 text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-store-primary md:h-[46px]',
                    checked
                      ? 'border-store-ink bg-store-ink text-white'
                      : 'border-store-border bg-store-card text-store-ink',
                    !buyable && !checked && 'text-store-muted line-through',
                  )}
                >
                  {value}
                  {!buyable ? <span className="sr-only"> (sold out)</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {variant?.available && variant.lowStock ? (
        <p className="flex items-center gap-1.5 text-ui font-medium text-store-eyebrow">
          <Flame className="size-3.5" aria-hidden />
          Only a few left{label ? ` in ${label}` : ''}
        </p>
      ) : null}

      {/* Actions (desktop) */}
      <div className="hidden gap-3 md:flex">
        <QuantityStepper size="lg" value={qty} onChange={setQty} />
        <button
          type="button"
          onClick={addToCart}
          disabled={!canBuy}
          className={storeButton('primary', 'h-[52px] flex-1 px-4 py-0')}
        >
          <ShoppingBag className="size-[17px]" aria-hidden />
          {buttonText}
        </button>
        {ask ? (
          <a
            href={ask}
            aria-label="Ask about this on WhatsApp"
            className="flex size-[52px] shrink-0 items-center justify-center rounded-md border border-store-border bg-store-card text-store-ink"
          >
            <MessageCircle className="size-5" aria-hidden />
          </a>
        ) : null}
      </div>
      {added ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md bg-success-soft px-3.5 py-2.5 text-ui text-success"
        >
          <Check className="size-4" aria-hidden />
          Added to your cart.
          <Link href="/cart" className="ml-auto font-semibold underline">
            View cart
          </Link>
        </p>
      ) : null}

      <StickyBar className="gap-2.5">
        {ask ? (
          <a
            href={ask}
            aria-label="Ask about this on WhatsApp"
            className="flex size-[50px] shrink-0 items-center justify-center rounded-[10px] border border-store-border text-store-ink"
          >
            <MessageCircle className="size-5" aria-hidden />
          </a>
        ) : null}
        <button
          type="button"
          onClick={addToCart}
          disabled={!canBuy}
          className={storeButton('primary', 'h-[50px] flex-1 rounded-[10px] px-4 py-0')}
        >
          {added ? 'Added ✓' : buttonText}
        </button>
      </StickyBar>
    </>
  );
}
