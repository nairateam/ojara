import { formatKobo } from '@ojara/shared';
import {
  Flame,
  MessageCircle,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Breadcrumb,
  CartIconLink,
  InStock,
  MobileSubHeader,
  ProductCard,
  SectionTitle,
  StickyBar,
  storeButton,
} from '@/components/storefront/primitives';
import { ProductGallery } from '@/components/storefront/product-gallery';
import { QuantityStepper } from '@/components/storefront/quantity-stepper';
import { cn } from '@/lib/utils';
import {
  DELIVERY,
  getCategory,
  getProduct,
  getProductDetail,
  getProducts,
  RELATED,
  STORE,
} from '@/mock/storefront';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name } : {};
}

function Accordion({
  title,
  open,
  children,
}: {
  title: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group border-t border-store-border py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-title font-semibold text-store-ink [&::-webkit-details-marker]:hidden">
        {title}
        <Plus className="size-4 group-open:hidden" aria-hidden />
        <Minus className="hidden size-4 group-open:block" aria-hidden />
      </summary>
      <div className="pt-2.5 text-sm leading-[22px] text-store-body">{children}</div>
    </details>
  );
}

function InfoRow({
  icon,
  title,
  sub,
  action,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-store-border px-4 py-3.5 first:border-t-0">
      <span className="text-store-primary">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-ui font-semibold text-store-ink">{title}</span>
        <span className="text-xs text-store-body">{sub}</span>
      </div>
      {action}
    </div>
  );
}

/** 05.03 Product / 05.13 Mobile – Product. */
export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const detail = getProductDetail(product);
  const category = getCategory(product.category);
  const related = getProducts(RELATED.filter((s) => s !== product.slug)).slice(0, 4);
  const onSale = Boolean(product.compareAtPrice);
  const price = formatKobo(product.price);
  const formId = 'add-to-cart';

  return (
    <>
      <MobileSubHeader
        backHref={category ? `/shop/${category.slug}` : '/shop'}
        right={<CartIconLink />}
      />

      <section className="flex flex-col gap-6 pb-4 md:px-8 md:pt-6 md:pb-14 xl:px-16">
        <div className="hidden md:block">
          <Breadcrumb
            items={[
              { label: 'Shop all', href: '/shop' },
              ...(category ? [{ label: category.name, href: `/shop/${category.slug}` }] : []),
              { label: product.name },
            ]}
          />
        </div>
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 lg:flex lg:flex-row xl:gap-16">
          <ProductGallery images={detail.gallery} note={detail.imageNote} />

          <form
            id={formId}
            action="/cart"
            className="flex min-w-0 flex-1 flex-col gap-3.5 p-4 md:gap-6 md:p-0 md:pt-2"
          >
            {/* Title block */}
            <div className="flex flex-col gap-2.5">
              <p className="hidden text-xs font-semibold tracking-[1.4px] text-store-eyebrow uppercase md:block">
                {category?.name}
                {product.isNew ? ' · New in' : null}
              </p>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 md:gap-2.5">
                  <h1 className="font-serif text-[26px] font-medium tracking-[-0.4px] text-store-ink md:text-[44px] md:tracking-[-1px]">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={cn(
                        'text-lg font-semibold md:text-[22px]',
                        onSale ? 'text-store-eyebrow' : 'text-store-primary',
                      )}
                    >
                      {price}
                    </span>
                    {product.compareAtPrice ? (
                      <s className="text-sm text-store-muted">
                        {formatKobo(product.compareAtPrice)}
                      </s>
                    ) : null}
                    {product.soldOut ? (
                      <span className="rounded-pill bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger">
                        Sold out
                      </span>
                    ) : (
                      <InStock className="hidden rounded-pill bg-success-soft px-2.5 py-1 font-semibold md:inline-flex" />
                    )}
                  </div>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(product.name)}`}
                  aria-label="Share"
                  className="mt-1.5 text-store-ink md:hidden"
                >
                  <Share2 className="size-5" aria-hidden />
                </a>
              </div>
              <p className="hidden text-title leading-[23px] text-store-body md:block">
                {detail.short}
              </p>
            </div>

            {/* Colour */}
            <fieldset className="flex flex-col gap-2 md:gap-2.5">
              <legend className="mb-2 text-ui font-semibold text-store-ink md:mb-2.5">
                Colour: {detail.colours[0]?.name}
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {detail.colours.map((c, i) => (
                  <label key={c.name} className="cursor-pointer">
                    <input
                      type="radio"
                      name="colour"
                      value={c.name}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <span className="flex size-[34px] items-center gap-2 rounded-pill border-[1.5px] border-transparent p-[3px] peer-checked:border-store-ink peer-focus-visible:outline-2 peer-focus-visible:outline-store-primary md:size-auto md:border md:border-store-border md:bg-store-card md:py-1.5 md:pr-3.5 md:pl-1.5 md:peer-checked:border-store-ink md:peer-checked:shadow-[inset_0_0_0_0.5px_var(--store-ink)]">
                      <span
                        className="size-full rounded-full md:size-[22px]"
                        style={{ backgroundColor: c.swatch }}
                        aria-hidden
                      />
                      <span className="sr-only text-ui font-medium text-store-ink md:not-sr-only">
                        {c.name}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Size */}
            <fieldset className="flex flex-col gap-2 md:gap-2.5">
              <div className="flex items-center justify-between">
                <legend className="text-ui font-semibold text-store-ink">
                  Size: {detail.defaultSize}
                </legend>
                <Link href="/policies/size-guide" className="text-ui text-store-primary">
                  Size guide
                </Link>
              </div>
              <div className="flex gap-2 md:gap-2.5">
                {detail.sizes.map((s) => (
                  <label
                    key={s.label}
                    className={cn(
                      'min-w-0 flex-1 md:min-w-16 md:flex-none',
                      s.soldOut ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
                    )}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={s.label}
                      disabled={s.soldOut}
                      defaultChecked={s.label === detail.defaultSize}
                      className="peer sr-only"
                    />
                    <span className="flex h-11 items-center justify-center rounded-md border border-store-border bg-store-card px-3 text-sm font-semibold whitespace-nowrap text-store-ink peer-checked:border-store-ink peer-checked:bg-store-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-store-primary md:h-[46px]">
                      {s.label}
                      {s.soldOut ? <span className="sr-only"> (sold out)</span> : null}
                    </span>
                  </label>
                ))}
              </div>
              {detail.lowStock ? (
                <>
                  <p className="flex items-center gap-1.5 text-ui font-medium text-store-eyebrow max-md:hidden">
                    <Flame className="size-3.5" aria-hidden />
                    {detail.lowStock}
                  </p>
                  <p className="text-xs font-semibold text-store-eyebrow md:hidden">
                    {detail.lowStockShort}
                  </p>
                </>
              ) : null}
            </fieldset>

            {/* Actions (desktop) */}
            <div className="hidden gap-3 md:flex">
              <QuantityStepper size="lg" name="qty" />
              <button
                type="submit"
                disabled={product.soldOut}
                className={storeButton('primary', 'h-[52px] flex-1 px-4 py-0')}
              >
                <ShoppingBag className="size-[17px]" aria-hidden />
                {product.soldOut ? 'Sold out' : `Add to cart · ${price}`}
              </button>
              <a
                href={STORE.whatsappHref}
                aria-label="Ask about this on WhatsApp"
                className="flex size-[52px] shrink-0 items-center justify-center rounded-md border border-store-border bg-store-card text-store-ink"
              >
                <MessageCircle className="size-5" aria-hidden />
              </a>
            </div>

            {/* Delivery info */}
            <div className="hidden flex-col rounded-[10px] border border-store-border bg-store-card md:flex">
              <InfoRow
                icon={<Truck className="size-[18px]" aria-hidden />}
                title={`Delivery to ${DELIVERY.area} · ${formatKobo(DELIVERY.fee)}`}
                sub={`Arrives ${DELIVERY.eta} · Free in Lagos over ${formatKobo(STORE.freeDeliveryThreshold)}`}
                action={
                  <Link
                    href="/policies/delivery"
                    className="text-xs font-semibold text-store-primary"
                  >
                    Change area
                  </Link>
                }
              />
              <InfoRow
                icon={<Store className="size-[18px]" aria-hidden />}
                title="Free pickup in Surulere"
                sub={`Ready in 24 hours · ${STORE.hours}`}
              />
              <InfoRow
                icon={<ShieldCheck className="size-[18px]" aria-hidden />}
                title="Pay securely with Paystack"
                sub="Card, bank transfer or USSD · 7-day returns"
              />
            </div>
            <div className="flex items-center gap-2.5 rounded-[10px] border border-store-border bg-store-card p-3 md:hidden">
              <Truck className="size-4 shrink-0 text-store-primary" aria-hidden />
              <span className="text-xs text-store-ink">
                Lagos 1–2 days from {formatKobo(DELIVERY.fromFee)} · free pickup
              </span>
            </div>

            {/* Accordions */}
            <div className="flex flex-col">
              <p className="pb-3 text-sm leading-[22px] text-store-body md:hidden">
                {detail.short}
              </p>
              <Accordion title="Fabric & care" open>
                {detail.fabricCare}
              </Accordion>
              <Accordion title="Fit & size guide">{detail.fit}</Accordion>
              <Accordion title="Delivery & returns">
                Lagos delivery in 1–2 days from {formatKobo(DELIVERY.fromFee)}, other states in 3–5
                days. Free pickup from our Surulere studio. Returns and exchanges within 7 days —{' '}
                <Link href="/policies/returns" className="font-semibold text-store-primary">
                  read the policy
                </Link>
                .
              </Accordion>
            </div>
          </form>
        </div>
      </section>

      {related.length ? (
        <section className="flex flex-col gap-4 px-4 pt-4 pb-12 md:gap-6 md:px-8 md:pt-6 md:pb-[72px] xl:px-16">
          <SectionTitle>You may also like</SectionTitle>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <StickyBar className="gap-2.5">
        <a
          href={STORE.whatsappHref}
          aria-label="Ask about this on WhatsApp"
          className="flex size-[50px] shrink-0 items-center justify-center rounded-[10px] border border-store-border text-store-ink"
        >
          <MessageCircle className="size-5" aria-hidden />
        </a>
        <button
          type="submit"
          form={formId}
          disabled={product.soldOut}
          className={storeButton('primary', 'h-[50px] flex-1 rounded-[10px] px-4 py-0')}
        >
          {product.soldOut ? 'Sold out' : `Add to cart · ${price}`}
        </button>
      </StickyBar>
    </>
  );
}
