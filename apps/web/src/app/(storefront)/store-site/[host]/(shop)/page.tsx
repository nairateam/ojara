import { ArrowRight, ArrowUpRight, ChevronDown, ShieldCheck, Store, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Eyebrow,
  ProductCard,
  SectionTitle,
  StoreLinkButton,
} from '@/components/storefront/primitives';
import { CATEGORIES, getProducts, NEW_THIS_WEEK, productsIn, STORE } from '@/mock/storefront';

/** 05.01 Home (desktop) / 05.12 Mobile – Home. */
export default function StorefrontHome() {
  const products = getProducts(NEW_THIS_WEEK);
  return (
    <>
      {/* Mobile hero card (05.12) */}
      <section className="relative flex h-[380px] flex-col justify-end p-4 md:hidden">
        <Image
          src={STORE.hero.image}
          alt="Model wearing a hand-dyed adire dress"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="relative flex flex-col gap-2.5 rounded-lg bg-store-page/95 p-4">
          <p className="text-[10px] font-semibold tracking-[1.4px] text-store-eyebrow uppercase">
            {STORE.hero.eyebrowShort}
          </p>
          <h1 className="font-serif text-2xl leading-[26px] font-medium text-store-ink">
            {STORE.hero.title}
          </h1>
          <StoreLinkButton href="/shop" className="w-full py-3 text-sm">
            Shop new in
          </StoreLinkButton>
        </div>
      </section>

      {/* Desktop hero (05.01) */}
      <section className="hidden md:grid md:min-h-[520px] md:grid-cols-[1fr_46%] xl:h-[580px] xl:grid-cols-[1fr_660px]">
        <div className="flex flex-col justify-center gap-6 px-8 py-14 xl:px-16">
          <Eyebrow>{STORE.hero.eyebrow}</Eyebrow>
          <h1 className="max-w-[540px] font-serif text-[48px] leading-[1.02] font-medium tracking-[-1.5px] text-store-ink xl:text-[64px] xl:leading-[65px]">
            {STORE.hero.title}
          </h1>
          <p className="max-w-[480px] text-[17px] leading-[26px] text-store-body">
            {STORE.hero.body}
          </p>
          <div className="flex flex-wrap gap-3">
            <StoreLinkButton href="/shop">
              Shop new in
              <ArrowRight className="size-4" aria-hidden />
            </StoreLinkButton>
            <StoreLinkButton href="/about" variant="secondary">
              Our story
            </StoreLinkButton>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-ui text-store-body">
            <li className="flex items-center gap-[7px]">
              <ShieldCheck className="size-4 text-store-primary" aria-hidden />
              Secure payment by Paystack
            </li>
            <li className="flex items-center gap-[7px]">
              <Truck className="size-4 text-store-primary" aria-hidden />
              Nationwide delivery
            </li>
            <li className="flex items-center gap-[7px]">
              <Store className="size-4 text-store-primary" aria-hidden />
              Pickup in Surulere
            </li>
          </ul>
        </div>
        <div className="relative min-h-[420px]">
          <Image
            src={STORE.hero.image}
            alt="Model wearing a hand-dyed adire dress in a courtyard"
            fill
            priority
            sizes="(min-width: 1280px) 660px, 46vw"
            className="object-cover"
          />
        </div>
      </section>

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
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="shrink-0 rounded-pill border border-store-border bg-store-card px-3.5 py-2 text-ui font-medium text-store-ink"
          >
            {c.navLabel}
          </Link>
        ))}
      </nav>

      {/* Shop by category (desktop) */}
      <section className="hidden flex-col gap-6 px-8 pt-16 pb-6 md:flex xl:px-16">
        <SectionTitle>Shop by category</SectionTitle>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className="group relative flex h-[220px] flex-col justify-end overflow-hidden rounded-lg bg-store-band p-4"
            >
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="relative flex items-center justify-between rounded-md bg-store-page/95 px-3.5 py-2.5">
                <span className="flex flex-col gap-px">
                  <span className="text-title font-semibold text-store-ink">{c.name}</span>
                  <span className="text-xs text-store-body">
                    {productsIn(c.slug).length} pieces
                  </span>
                </span>
                <ArrowUpRight className="size-[18px] text-store-ink" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New this week */}
      <section className="flex flex-col gap-4 px-4 pt-5 pb-12 md:gap-6 md:px-8 md:pt-12 md:pb-[72px] xl:px-16">
        <div className="flex items-center justify-between">
          <SectionTitle>New this week</SectionTitle>
          <Link href="/shop" className="text-ui font-semibold text-store-primary md:hidden">
            See all
          </Link>
          <label className="relative hidden items-center md:flex">
            <span className="sr-only">Sort products</span>
            <select
              defaultValue="newest"
              className="appearance-none rounded-md border border-store-border bg-store-card py-2 pr-8 pl-3 text-ui font-medium text-store-ink"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Sort: Price, low to high</option>
              <option value="price-desc">Sort: Price, high to low</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 size-3.5 text-store-ink"
              aria-hidden
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.slug} className="contents">
              <ProductCard product={p} variant="mobile" className="md:hidden" />
              <ProductCard product={p} className="hidden md:flex" />
            </div>
          ))}
        </div>
      </section>

      {/* Our story band */}
      <section className="flex flex-col gap-8 bg-store-band px-4 py-12 md:flex-row md:items-center md:gap-16 md:px-8 md:py-[72px] xl:px-16">
        <div className="relative h-[220px] shrink-0 overflow-hidden rounded-lg md:h-[340px] md:w-[44%] xl:w-[520px]">
          <Image
            src={STORE.story.fabricImage}
            alt="Hand-dyed indigo adire fabric"
            fill
            sizes="(min-width: 768px) 520px, 100vw"
            className="object-cover"
          />
        </div>
        <figure className="flex flex-col gap-[18px]">
          <Eyebrow>Our story</Eyebrow>
          <blockquote className="font-serif text-[22px] leading-[30px] font-normal tracking-[-0.3px] text-store-ink md:text-[28px] md:leading-9">
            {STORE.quote}
          </blockquote>
          <figcaption className="text-sm font-semibold text-store-body">
            {STORE.founder}, founder
          </figcaption>
        </figure>
      </section>
    </>
  );
}
