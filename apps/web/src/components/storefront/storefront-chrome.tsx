import { Menu, MessageCircle, Search, ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';
import { PoweredByOjara } from '@/components/brand/wordmark';
import { StoreLogoTile } from '@/components/brand/store-logo-tile';

const NAV = [
  { href: '/products', label: 'Shop all' },
  { href: '/about', label: 'Our story' },
] as const;

/**
 * Storefront header (05.01 / 05.12): merchant-coloured announcement bar, then brand (logo tile +
 * Fraunces name), centred nav, and search / WhatsApp / cart. Mobile collapses to menu · brand · cart.
 * Category links come from the merchant's categories once the catalogue feature exists.
 */
export function StorefrontHeader({
  storeName,
  cartCount = 0,
}: {
  storeName: string;
  cartCount?: number;
}) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 bg-store-primary px-3 py-[7px] text-2xs font-medium text-store-primary-fg md:py-[9px] md:text-xs">
        <Truck className="size-3.5" aria-hidden />
        Delivery and pickup available · Pay securely with Paystack
      </div>
      <header className="grid grid-cols-[auto_1fr_auto] items-center border-b border-store-border bg-store-page px-4 pt-2 pb-3 md:grid-cols-[300px_1fr_300px] md:px-16 md:py-[18px]">
        <button type="button" className="text-store-ink md:hidden" aria-label="Menu">
          <Menu className="size-[22px]" />
        </button>
        <Link href="/" className="flex items-center justify-center gap-2.5 md:justify-start">
          <StoreLogoTile name={storeName} size={36} className="hidden md:inline-flex" />
          <StoreLogoTile name={storeName} size={26} className="md:hidden" />
          <span className="font-serif text-[17px] font-semibold text-store-ink md:text-[22px]">
            {storeName}
          </span>
        </Link>
        <nav className="hidden justify-center gap-8 md:flex" aria-label="Shop">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-store-ink hover:text-store-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-[18px] text-store-ink">
          <label className="hidden w-[170px] items-center gap-2 rounded-pill border border-store-border bg-store-card px-3 py-2 lg:flex">
            <Search className="size-[15px] text-store-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-ui outline-none placeholder:text-store-muted"
            />
          </label>
          <Search className="size-5 lg:hidden" aria-hidden />
          <MessageCircle className="hidden size-5 md:block" aria-label="WhatsApp" />
          <Link href="/cart" className="relative" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingBag className="size-[22px] md:size-5" />
            <span className="absolute -top-2 -right-2.5 flex size-4 items-center justify-center rounded-full bg-store-primary text-[9px] font-bold text-store-primary-fg md:size-5 md:text-2xs">
              {cartCount}
            </span>
          </Link>
        </div>
      </header>
    </>
  );
}

/** Storefront footer (05.01): ink background, about + Shop/Help columns, "Powered by ojara". */
export function StorefrontFooter({
  storeName,
  showPoweredBy,
}: {
  storeName: string;
  showPoweredBy: boolean;
}) {
  return (
    <footer className="flex flex-col gap-10 bg-store-ink px-4 pt-14 pb-7 md:px-16">
      <div className="flex flex-col gap-10 md:flex-row md:gap-12">
        <div className="flex max-w-[280px] flex-col gap-3">
          <span className="font-serif text-[22px] font-semibold text-white">{storeName}</span>
          <p className="text-ui leading-5 text-store-footer-fg">Thanks for shopping with us.</p>
        </div>
        <div className="flex-1" />
        <div className="flex min-w-[180px] flex-col gap-2.5 text-ui">
          <span className="font-semibold text-white">Shop</span>
          <Link href="/products" className="text-store-footer-fg">
            Shop all
          </Link>
        </div>
        <div className="flex min-w-[180px] flex-col gap-2.5 text-ui">
          <span className="font-semibold text-white">Help</span>
          <Link href="/delivery" className="text-store-footer-fg">
            Delivery &amp; pickup
          </Link>
          <Link href="/returns" className="text-store-footer-fg">
            Returns &amp; exchanges
          </Link>
          <Link href="/track" className="text-store-footer-fg">
            Track an order
          </Link>
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

/** 05.11 Temporarily Closed: no header/footer, centred 560px column. */
export function StoreClosed({ storeName }: { storeName: string }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-store-page px-4 py-16">
      <div className="flex w-full max-w-[560px] flex-col items-center gap-[22px] text-center">
        <span className="flex items-center gap-3">
          <StoreLogoTile name={storeName} size={44} />
          <span className="font-serif text-2xl font-semibold text-store-ink">{storeName}</span>
        </span>
        <div className="h-[240px] w-full rounded-[14px] bg-store-band" aria-hidden />
        <h1 className="font-serif text-[32px] font-medium tracking-[-0.8px] text-store-ink md:text-[40px]">
          We&apos;re taking a short break
        </h1>
        <p className="text-base leading-[25px] text-store-body">
          {storeName} isn&apos;t taking orders right now. Please check back soon.
        </p>
      </div>
      <div className="absolute bottom-6">
        <PoweredByOjara className="border-store-border" />
      </div>
    </main>
  );
}
