import { formatKobo, type StorefrontProductCardDto } from '@ojara/shared';
import { ChevronLeft, ChevronRight, MessageCircle, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { CartCount } from './cart';

/* ---------------------------------------------------------------------------------------------
 * Buttons (merchant colour). Primary: store-primary, Inter 15/600, radius 8, padding 14 24.
 * Secondary: transparent with a 1px ink border.
 * ------------------------------------------------------------------------------------------- */

const BUTTON = {
  base: 'inline-flex items-center justify-center gap-2 text-title font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-primary disabled:opacity-50',
  primary: 'bg-store-primary text-store-primary-fg',
  secondary: 'border border-store-ink text-store-ink',
  ink: 'bg-store-ink text-white',
} as const;

export function storeButton(
  variant: 'primary' | 'secondary' | 'ink' = 'primary',
  className?: string,
): string {
  return cn(BUTTON.base, BUTTON[variant], 'rounded-md px-6 py-3.5', className);
}

export function StoreLinkButton({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: 'primary' | 'secondary' | 'ink' }) {
  return <Link className={storeButton(variant, className)} {...props} />;
}

/* ---------------------------------------------------------------------------------------------
 * Typography
 * ------------------------------------------------------------------------------------------- */

export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'text-xs font-semibold tracking-eyebrow text-store-eyebrow uppercase',
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'font-serif text-xl font-medium text-store-ink md:text-[30px] md:tracking-[-0.5px]',
        className,
      )}
      {...props}
    />
  );
}

export function PageTitle({ className, ...props }: ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'font-serif text-[32px] leading-tight font-medium tracking-[-0.8px] text-store-ink md:text-[44px] md:tracking-[-1px]',
        className,
      )}
      {...props}
    />
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-ui">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 ? <ChevronRight className="size-3 text-store-muted" aria-hidden /> : null}
            {item.href ? (
              <Link href={item.href} className="text-store-body hover:text-store-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-store-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Product card + tags
 * ------------------------------------------------------------------------------------------- */

/** "New" indigo; "Sold out" ink; "Sale" rust. */
export function ProductTag({ product }: { product: StorefrontProductCardDto }) {
  const base = 'rounded-sm px-[9px] py-1 text-2xs font-bold';
  if (product.soldOut) return <span className={cn(base, 'bg-store-ink text-white')}>Sold out</span>;
  if (product.compareAtKobo !== null)
    return <span className={cn(base, 'bg-store-eyebrow text-white')}>Sale</span>;
  return null;
}

/** Product photo from a Cloudinary public_id, or the store's colour band with the initial. */
export function StorePhoto({
  publicId,
  alt,
  sizes,
  priority,
  className,
}: {
  publicId: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return publicId ? (
    <Image
      src={publicId}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn('object-cover', className)}
    />
  ) : (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center font-serif text-5xl text-store-muted"
    >
      {alt.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function ProductCard({
  product,
  variant = 'home',
  className,
}: {
  product: StorefrontProductCardDto;
  /** `home`: 360 image + options line; `listing`: 400 image, New tag; `mobile`: compact. */
  variant?: 'home' | 'listing' | 'mobile';
  className?: string;
}) {
  const onSale = product.compareAtKobo !== null;
  let tag: ReactNode = <ProductTag product={product} />;
  if (variant === 'listing' && !product.soldOut && !onSale && product.isNew) {
    tag = (
      <span className="rounded-sm bg-store-primary px-[9px] py-1 text-2xs font-bold text-store-primary-fg">
        New
      </span>
    );
  }
  const imageHeight =
    variant === 'listing'
      ? 'aspect-[4/5] md:aspect-auto md:h-[400px]'
      : variant === 'mobile'
        ? 'h-[210px]'
        : 'aspect-[4/5] md:aspect-auto md:h-[360px]';
  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group flex min-w-0 flex-col',
        variant === 'mobile' ? 'gap-1.5' : 'gap-2.5 md:gap-3',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden rounded-[10px] bg-store-band', imageHeight)}>
        <StorePhoto
          publicId={product.coverPublicId}
          alt={product.name}
          sizes="(min-width: 768px) 25vw, 50vw"
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {tag ? <div className="absolute top-3 left-3 flex">{tag}</div> : null}
      </div>
      <div className={cn('flex flex-col', variant === 'listing' ? 'gap-2.5' : 'gap-1')}>
        <span
          className={cn(
            'font-semibold text-store-ink',
            variant === 'mobile' ? 'text-ui' : 'text-ui md:text-title',
          )}
        >
          {product.name}
        </span>
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              'font-semibold',
              variant === 'mobile' ? 'text-ui' : 'text-ui md:text-title',
              onSale ? 'text-store-eyebrow' : 'text-store-primary',
            )}
          >
            {product.priceVaries ? 'From ' : ''}
            {formatKobo(product.priceKobo)}
          </span>
          {product.compareAtKobo !== null ? (
            <s className="text-xs text-store-muted md:text-ui">
              {formatKobo(product.compareAtKobo)}
            </s>
          ) : null}
        </span>
        {variant === 'home' && (product.soldOut || product.optionSummary) ? (
          <span
            className={cn('text-xs', product.soldOut ? 'text-store-eyebrow' : 'text-store-muted')}
          >
            {product.soldOut ? 'Sold out' : product.optionSummary}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Small shared bits
 * ------------------------------------------------------------------------------------------- */

export function InStock({ className, label = 'In stock' }: { className?: string; label?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-success', className)}
    >
      <span className="size-1.5 rounded-full bg-success" aria-hidden />
      {label}
    </span>
  );
}

export function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <span
      className={cn('relative block shrink-0 overflow-hidden rounded-md bg-store-band', className)}
    >
      <Image src={src} alt={alt} fill sizes="160px" className="object-cover" />
    </span>
  );
}

/** Free-delivery progress (cart 05.04 / 05.14). */
export function FreeDeliveryProgress({
  subtotal,
  threshold,
  className,
}: {
  subtotal: number;
  threshold: number;
  className?: string;
}) {
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  return (
    <div className={cn('flex flex-col gap-2 rounded-[10px] bg-store-band p-3 md:p-3.5', className)}>
      <p className="text-xs font-semibold text-store-ink md:text-ui">
        {remaining > 0
          ? `Add ${formatKobo(remaining)} more for free Lagos delivery`
          : 'You’ve unlocked free Lagos delivery'}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="h-[5px] overflow-hidden rounded-[3px] bg-store-border md:h-1.5"
      >
        <div className="h-full rounded-[3px] bg-store-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Inputs: white, 1px border, radius 8, padding 12 14; focus 1.5px merchant colour. */
export const storeInput =
  'w-full rounded-md border border-store-border bg-store-card px-3.5 py-3 text-sm text-store-ink outline-none placeholder:text-store-muted focus:border-store-primary focus:shadow-[inset_0_0_0_0.5px_var(--store-primary)]';

export function StoreField({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-[5px] md:gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-store-ink md:text-ui">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-store-body">{hint}</p> : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------
 * Mobile helpers (05.12 – 05.15)
 * ------------------------------------------------------------------------------------------- */

export function CartIconLink({ className }: { className?: string }) {
  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className={cn('relative inline-flex text-store-ink', className)}
    >
      <ShoppingBag className="size-[22px]" aria-hidden />
      <CartCount className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-store-primary text-[9px] font-bold text-store-primary-fg" />
    </Link>
  );
}

/**
 * Mobile page header with a back chevron (product / cart). Its presence hides the shop layout's
 * announcement bar + header on mobile (see the `data-mobile-header` hook in the (shop) layout).
 */
export function MobileSubHeader({
  backHref,
  title,
  right,
}: {
  backHref: string;
  title?: string;
  right?: ReactNode;
}) {
  return (
    <div
      data-mobile-header
      className="sticky top-0 z-30 grid grid-cols-[22px_1fr_auto] items-center border-b border-store-border bg-store-page px-4 pt-2 pb-3 md:hidden"
    >
      <Link href={backHref} aria-label="Back" className="text-store-ink">
        <ChevronLeft className="size-[22px]" aria-hidden />
      </Link>
      <span className="text-center text-base font-semibold text-store-ink">{title}</span>
      <span className="flex min-w-[22px] justify-end">{right}</span>
    </div>
  );
}

/** Sticky bottom CTA bar (mobile only): white, 1px top border, safe-area padding. */
export function StickyBar({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 flex border-t border-store-border bg-store-card px-4 pt-3 pb-[max(28px,env(safe-area-inset-bottom))] shadow-sticky md:hidden',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function WhatsAppFab({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      aria-label="Chat on WhatsApp"
      className="fixed right-4 bottom-6 z-30 flex size-[52px] items-center justify-center rounded-full bg-success text-white shadow-fab md:hidden"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
