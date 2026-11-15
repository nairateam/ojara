import {
  Check,
  ChevronLeft,
  Lock,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Truck,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { StoreLogoTile } from '@/components/brand/store-logo-tile';
import { PoweredByOjara, Wordmark } from '@/components/brand/wordmark';
import { cn } from '@/lib/utils';
import { CART_COUNT, CATEGORIES, STORE } from '@/mock/storefront';
import { NavLinks } from './nav-links';
import { CartIconLink, storeButton } from './primitives';

const NAV = [
  { href: '/shop', label: 'Shop all' },
  ...CATEGORIES.map((c) => ({ href: `/shop/${c.slug}`, label: c.navLabel })),
  { href: '/about', label: 'Our story' },
];

const BRAND_SIZES = {
  lg: { tile: 36, text: 'text-[22px]' },
  md: { tile: 32, text: 'text-xl' },
  sm: { tile: 26, text: 'text-[17px]' },
  xl: { tile: 44, text: 'text-2xl' },
} as const;

/** Logo tile + store name in Fraunces 600. */
export function StoreBrand({
  storeName,
  size = 'lg',
  href = '/',
  className,
}: {
  storeName: string;
  size?: keyof typeof BRAND_SIZES;
  href?: string | null;
  className?: string;
}) {
  const s = BRAND_SIZES[size];
  const content = (
    <>
      <StoreLogoTile name={storeName} size={s.tile} />
      <span className={cn('font-serif font-semibold whitespace-nowrap text-store-ink', s.text)}>
        {storeName}
      </span>
    </>
  );
  const cls = cn('flex items-center', size === 'sm' ? 'gap-2' : 'gap-2.5', className);
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <span className={cls}>{content}</span>
  );
}

/** Merchant-coloured announcement bar (desktop copy / shorter mobile copy). */
export function AnnouncementBar() {
  return (
    <div className="flex items-center justify-center gap-2 bg-store-primary px-3 py-[7px] text-center text-2xs font-medium text-store-primary-fg md:py-[9px] md:text-xs">
      <Truck className="hidden size-3.5 shrink-0 md:block" aria-hidden />
      <span className="md:hidden">{STORE.announcementShort}</span>
      <span className="hidden md:inline">{STORE.announcement}</span>
    </div>
  );
}

/**
 * Storefront header (05.01 desktop / 05.12 mobile). Desktop: brand (300) · centred nav ·
 * search pill, WhatsApp and cart (300). Mobile: menu · centred brand · search + cart. The mobile
 * menu is a native <details> disclosure, so the header ships no JS beyond the active-link island.
 */
export function StorefrontHeader({ storeName }: { storeName: string }) {
  return (
    <header className="relative z-20 border-b border-store-border bg-store-page">
      <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 pt-2 pb-3 md:px-8 md:py-[18px] lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[300px_1fr_300px] xl:px-16">
        <details className="group/menu lg:hidden">
          <summary
            aria-label="Menu"
            className="flex size-[22px] cursor-pointer list-none items-center text-store-ink [&::-webkit-details-marker]:hidden"
          >
            <Menu className="size-[22px] group-open/menu:hidden" aria-hidden />
            <X className="hidden size-[22px] group-open/menu:block" aria-hidden />
          </summary>
          <div className="absolute inset-x-0 top-full border-b border-store-border bg-store-page px-4 py-2 shadow-sticky md:px-8">
            <NavLinks
              items={NAV}
              className="flex flex-col"
              linkClassName="border-b border-store-border py-3 text-title last:border-b-0"
            />
          </div>
        </details>
        <StoreBrand storeName={storeName} size="lg" className="hidden md:flex md:pl-4 lg:pl-0" />
        <StoreBrand storeName={storeName} size="sm" className="justify-center md:hidden" />
        <NavLinks items={NAV} className="hidden justify-center gap-6 lg:flex xl:gap-8" />
        <div className="flex items-center justify-end gap-3.5 text-store-ink md:gap-[18px]">
          <form action="/shop" role="search" className="hidden xl:block">
            <label className="flex w-[170px] items-center gap-2 rounded-pill border border-store-border bg-store-card px-3 py-2 focus-within:border-store-primary">
              <Search className="size-[15px] shrink-0 text-store-muted" aria-hidden />
              <input
                type="search"
                name="q"
                placeholder="Search"
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-ui text-store-ink outline-none placeholder:text-store-muted"
              />
            </label>
          </form>
          <Link href="/shop" aria-label="Search products" className="xl:hidden">
            <Search className="size-5" aria-hidden />
          </Link>
          <a href={STORE.whatsappHref} aria-label="Chat on WhatsApp" className="hidden md:block">
            <MessageCircle className="size-5" aria-hidden />
          </a>
          <CartIconLink className="md:hidden" />
          <Link
            href="/cart"
            aria-label={`Cart, ${CART_COUNT} items`}
            className="hidden items-center gap-1.5 md:flex"
          >
            <ShoppingBag className="size-5" aria-hidden />
            <span className="flex size-5 items-center justify-center rounded-full bg-store-primary text-2xs font-bold text-store-primary-fg">
              {CART_COUNT}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Storefront footer (05.01): ink background, about + Shop / Help / Contact, "Powered by ojara". */
export function StorefrontFooter({
  storeName,
  showPoweredBy,
}: {
  storeName: string;
  showPoweredBy: boolean;
}) {
  const link = 'text-ui text-store-footer-fg hover:text-white';
  return (
    <footer className="flex flex-col gap-10 bg-store-ink px-4 pt-12 pb-7 md:px-8 md:pt-14 xl:px-16">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:flex md:gap-12">
        <div className="col-span-2 flex flex-col gap-3 md:mr-auto">
          <span className="font-serif text-[22px] font-semibold text-white">{storeName}</span>
          <p className="max-w-[280px] text-ui leading-5 text-store-footer-fg">{STORE.tagline}</p>
        </div>
        <div className="flex flex-col gap-2.5 md:w-[140px] xl:w-[180px]">
          <span className="text-ui font-semibold text-white">Shop</span>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/shop/${c.slug}`} className={link}>
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2.5 md:w-[160px] xl:w-[180px]">
          <span className="text-ui font-semibold text-white">Help</span>
          <Link href="/policies/delivery" className={link}>
            Delivery &amp; pickup
          </Link>
          <Link href="/policies/returns" className={link}>
            Returns &amp; exchanges
          </Link>
          <Link href="/track" className={link}>
            Track an order
          </Link>
          <Link href="/policies/size-guide" className={link}>
            Size guide
          </Link>
        </div>
        <div className="col-span-2 flex flex-col gap-2.5 md:w-[240px] xl:w-[280px]">
          <span className="text-ui font-semibold text-white">Contact</span>
          <a href={STORE.whatsappHref} className={link}>
            WhatsApp: {STORE.whatsapp}
          </a>
          <a href={STORE.instagramHref} className={link}>
            Instagram: {STORE.instagram}
          </a>
          <a href={`mailto:${STORE.email}`} className={link}>
            {STORE.email}
          </a>
          <span className="text-ui text-store-footer-fg">{STORE.address}</span>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 border-t border-store-footer-line pt-5 sm:flex-row sm:items-center">
        <span className="text-xs text-store-muted">
          © {new Date().getFullYear()} {storeName}. Prices in Nigerian naira (₦).
        </span>
        {showPoweredBy ? <PoweredByOjara /> : null}
      </div>
    </footer>
  );
}

/** Brand-only header (05.06 Order Confirmed / 05.07 Payment Failed). */
export function BrandOnlyHeader({ storeName }: { storeName: string }) {
  return (
    <header className="flex items-center border-b border-store-border bg-store-page px-4 py-3.5 md:px-8 md:py-5 xl:px-[120px]">
      <StoreBrand storeName={storeName} size="md" />
    </header>
  );
}

const STEPS = [
  { label: 'Cart', short: 'Cart' },
  { label: 'Details', short: 'Details' },
  { label: 'Payment', short: 'Pay' },
] as const;

/**
 * Checkout header (05.05 / 05.15). Desktop: brand · 3-step stepper · "Secure checkout".
 * Mobile: back · "Checkout" · lock, then a 3-segment progress strip. `current` is 0-based.
 */
export function CheckoutHeader({
  storeName,
  current = 1,
}: {
  storeName: string;
  current?: number;
}) {
  return (
    <>
      <header className="hidden items-center justify-between border-b border-store-border bg-store-page px-8 py-5 md:flex xl:px-[120px]">
        <StoreBrand storeName={storeName} size="md" className="w-[260px]" />
        <ol className="flex items-center gap-3" aria-label="Checkout progress">
          {STEPS.map((step, i) => (
            <li key={step.label} className="flex items-center gap-3">
              {i > 0 ? <span className="h-px w-10 bg-store-border" aria-hidden /> : null}
              <span
                className="flex items-center gap-2"
                aria-current={i === current ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex size-[22px] items-center justify-center rounded-full text-2xs font-bold',
                    i <= current
                      ? 'bg-store-primary text-store-primary-fg'
                      : 'border-[1.5px] border-store-muted/50 text-store-body',
                  )}
                >
                  {i < current ? <Check className="size-3" aria-label="Done" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'text-ui',
                    i === current ? 'font-semibold text-store-ink' : 'font-medium',
                    i > current ? 'text-store-body' : 'text-store-ink',
                  )}
                >
                  {step.label}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <span className="flex w-[260px] items-center justify-end gap-1.5 text-ui font-medium text-store-body">
          <Lock className="size-3.5 text-success" aria-hidden />
          Secure checkout
        </span>
      </header>
      <div className="sticky top-0 z-30 md:hidden">
        <header className="grid grid-cols-[22px_1fr_22px] items-center border-b border-store-border bg-store-page px-4 pt-2 pb-3">
          <Link href="/cart" aria-label="Back to cart" className="text-store-ink">
            <ChevronLeft className="size-[22px]" aria-hidden />
          </Link>
          <span className="text-center text-base font-semibold text-store-ink">Checkout</span>
          <Lock
            className="size-[18px] justify-self-end text-success"
            aria-label="Secure checkout"
          />
        </header>
        <ol
          className="flex gap-1.5 border-b border-store-border bg-store-card px-4 py-2.5"
          aria-label="Checkout progress"
        >
          {STEPS.map((step, i) => (
            <li key={step.label} className="flex flex-1 flex-col gap-[5px]">
              <span
                className={cn(
                  'h-1 rounded-[2px]',
                  i <= current ? 'bg-store-primary' : 'bg-store-border',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'text-2xs',
                  i === current ? 'font-bold text-store-ink' : 'font-medium',
                  i < current && 'text-store-ink',
                  i > current && 'text-store-body',
                )}
              >
                {step.short}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

/** 05.11 Temporarily Closed: no header/footer, centred 560px column, notify-me form. */
export function StoreClosed({ storeName }: { storeName: string }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-store-page px-4 pt-12 pb-24 font-sans text-store-ink">
      <div className="flex w-full max-w-[560px] flex-col items-center gap-[22px] text-center">
        <StoreBrand storeName={storeName} size="xl" href={null} />
        <div className="relative h-[180px] w-full overflow-hidden rounded-[14px] bg-store-band sm:h-[240px]">
          <Image
            src={STORE.closed.image}
            alt="Indigo adire fabric"
            fill
            sizes="(min-width: 640px) 560px, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="font-serif text-[32px] leading-tight font-medium tracking-[-0.8px] md:text-[40px]">
          We’re taking a short break
        </h1>
        <p className="text-base leading-[25px] text-store-body">{STORE.closed.body}</p>
        <form
          className="flex w-full flex-col gap-2.5 sm:flex-row"
          aria-label="Get a text when we reopen"
        >
          <label className="flex flex-1 items-center gap-2 rounded-md border border-store-border bg-store-card px-3.5 py-[13px] focus-within:border-store-primary">
            <span className="text-sm text-store-body">+234</span>
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="Your phone number"
              aria-label="Your phone number"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-store-muted"
            />
          </label>
          <button type="submit" className={storeButton('primary', 'px-5 py-[13px] text-sm')}>
            Text me
          </button>
        </form>
        <a
          href={STORE.whatsappHref}
          className="flex items-center gap-2 text-sm font-semibold text-store-primary"
        >
          <MessageCircle className="size-4" aria-hidden />
          Have an open order? WhatsApp {STORE.whatsapp}
        </a>
      </div>
      <a
        href="https://ojara.store"
        className="absolute bottom-6 inline-flex items-center gap-1.5 text-xs text-store-body"
      >
        Powered by{' '}
        <Wordmark size="xs" tone="dark" className="[&>span:first-child]:text-store-ink" />
      </a>
    </main>
  );
}
