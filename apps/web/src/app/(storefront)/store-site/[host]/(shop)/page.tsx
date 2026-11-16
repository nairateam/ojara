import { ArrowRight, ArrowUpRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Eyebrow,
  ProductCard,
  SectionTitle,
  StoreLinkButton,
  StorePhoto,
} from '@/components/storefront/primitives';
import { getShop, type HostParams, whatsappLink } from '@/components/storefront/store';
import { listStorefrontProducts } from '@/lib/api/storefront';

/**
 * 05.01 Home (desktop) / 05.12 Mobile – Home, from the store's catalogue: the newest product's
 * photo as the hero, menu categories as tiles, and the newest products. Hero copy and the story
 * band come back once merchants can write their own (storefront editor).
 */
export default async function StorefrontHome({ params }: { params: HostParams }) {
  const { tenant, store } = await getShop(params);
  const latest = await listStorefrontProducts(tenant.storeId, { pageSize: 8 });
  const products = latest?.items ?? [];
  const heroPhoto = products.find((p) => p.coverPublicId)?.coverPublicId ?? null;
  const whatsapp = whatsappLink(store.whatsappNumber);
  const categories = store.categories.filter((c) => c.productCount > 0);

  return (
    <>
      {/* Mobile hero card (05.12) */}
      <section className="relative flex h-[380px] flex-col justify-end bg-store-band p-4 md:hidden">
        <StorePhoto publicId={heroPhoto} alt="" sizes="100vw" priority />
        <div className="relative flex flex-col gap-2.5 rounded-lg bg-store-page/95 p-4">
          <p className="text-[10px] font-semibold tracking-[1.4px] text-store-eyebrow uppercase">
            New arrivals
          </p>
          <h1 className="font-serif text-2xl leading-[26px] font-medium text-store-ink">
            {store.name}
          </h1>
          <StoreLinkButton href="/shop" className="w-full py-3 text-sm">
            Shop now
          </StoreLinkButton>
        </div>
      </section>

      {/* Desktop hero (05.01) */}
      <section className="hidden md:grid md:min-h-[520px] md:grid-cols-[1fr_46%] xl:h-[580px] xl:grid-cols-[1fr_660px]">
        <div className="flex flex-col justify-center gap-6 px-8 py-14 xl:px-16">
          <Eyebrow>New arrivals</Eyebrow>
          <h1 className="max-w-[540px] font-serif text-[48px] leading-[1.02] font-medium tracking-[-1.5px] text-store-ink xl:text-[64px] xl:leading-[65px]">
            {store.name}
          </h1>
          <p className="max-w-[480px] text-[17px] leading-[26px] text-store-body">
            Browse {store.productCount === 1 ? 'our product' : `all ${store.productCount} products`}{' '}
            and order online{whatsapp ? ', or message us on WhatsApp with any questions' : ''}.
          </p>
          <div className="flex flex-wrap gap-3">
            <StoreLinkButton href="/shop">
              Shop now
              <ArrowRight className="size-4" aria-hidden />
            </StoreLinkButton>
            {whatsapp ? (
              <a href={whatsapp.href} className="inline-flex">
                <span className="inline-flex items-center gap-2 rounded-md border border-store-ink px-6 py-3.5 text-title font-semibold text-store-ink">
                  <MessageCircle className="size-4" aria-hidden /> Chat with us
                </span>
              </a>
            ) : null}
          </div>
        </div>
        <div className="relative min-h-[420px] bg-store-band">
          <StorePhoto
            publicId={heroPhoto}
            alt=""
            sizes="(min-width: 1280px) 660px, 46vw"
            priority
          />
        </div>
      </section>

      {categories.length ? (
        <>
          {/* Category chips (mobile) */}
          <nav
            aria-label="Categories"
            className="flex gap-2 overflow-x-auto px-4 pt-5 [scrollbar-width:none] md:hidden"
          >
            <Link
              href="/shop"
              className="shrink-0 rounded-pill bg-store-ink px-3.5 py-2 text-ui font-medium text-white"
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop/${c.slug}`}
                className="shrink-0 rounded-pill border border-store-border bg-store-card px-3.5 py-2 text-ui font-medium text-store-ink"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          {/* Shop by category (desktop) */}
          <section className="hidden flex-col gap-6 px-8 pt-16 pb-6 md:flex xl:px-16">
            <SectionTitle>Shop by category</SectionTitle>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  className="group relative flex h-[220px] flex-col justify-end overflow-hidden rounded-lg bg-store-band p-4"
                >
                  <StorePhoto
                    publicId={c.coverPublicId}
                    alt=""
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="relative flex items-center justify-between rounded-md bg-store-page/95 px-3.5 py-2.5">
                    <span className="flex flex-col gap-px">
                      <span className="text-title font-semibold text-store-ink">{c.name}</span>
                      <span className="text-xs text-store-body">
                        {c.productCount === 1 ? '1 product' : `${c.productCount} products`}
                      </span>
                    </span>
                    <ArrowUpRight className="size-[18px] text-store-ink" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {/* Newest products */}
      <section className="flex flex-col gap-4 px-4 pt-5 pb-12 md:gap-6 md:px-8 md:pt-12 md:pb-[72px] xl:px-16">
        <div className="flex items-center justify-between">
          <SectionTitle>New arrivals</SectionTitle>
          {products.length ? (
            <Link href="/shop" className="text-ui font-semibold text-store-primary">
              See all
            </Link>
          ) : null}
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {products.map((p) => (
              <div key={p.slug} className="contents">
                <ProductCard product={p} variant="mobile" className="md:hidden" />
                <ProductCard product={p} className="hidden md:flex" />
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-store-band px-5 py-10 text-center text-sm text-store-body">
            New products are on the way. Check back soon.
          </p>
        )}
      </section>
    </>
  );
}
