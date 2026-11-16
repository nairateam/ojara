import { Minus, Plus, Share2 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Breadcrumb,
  CartIconLink,
  MobileSubHeader,
  ProductCard,
  SectionTitle,
} from '@/components/storefront/primitives';
import { ProductBuyBox } from '@/components/storefront/product-buy-box';
import { ProductGallery } from '@/components/storefront/product-gallery';
import { getShop, whatsappLink } from '@/components/storefront/store';
import { getStorefrontProduct } from '@/lib/api/storefront';

type Props = { params: Promise<{ host: string; slug: string }> };

async function load(params: Props['params']) {
  const [{ tenant, store }, { slug }] = await Promise.all([getShop(params), params]);
  return { store, product: await getStorefrontProduct(tenant.storeId, slug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await load(params);
  return product
    ? { title: product.name, description: product.description?.slice(0, 160) ?? undefined }
    : {};
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
      <div className="pt-2.5 text-sm leading-[22px] whitespace-pre-line text-store-body">
        {children}
      </div>
    </details>
  );
}

/** 05.03 Product / 05.13 Mobile – Product. */
export default async function ProductPage({ params }: Props) {
  const { store, product } = await load(params);
  if (!product) notFound();
  const category = product.category;
  const whatsapp = whatsappLink(store.whatsappNumber);
  const { related, ...buyable } = product;

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
          {product.images.length ? (
            <ProductGallery
              images={product.images.map((img, i) => ({
                src: img.publicId,
                alt: img.alt ?? `${product.name}${i ? ` — photo ${i + 1}` : ''}`,
              }))}
            />
          ) : (
            <div
              aria-hidden
              className="flex h-[400px] w-full items-center justify-center bg-store-band font-serif text-7xl text-store-muted md:h-[560px] md:rounded-lg lg:h-[700px] lg:w-[560px] lg:shrink"
            >
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3.5 p-4 md:gap-6 md:p-0 md:pt-2">
            <div className="flex flex-col gap-2.5">
              {category ? (
                <p className="hidden text-xs font-semibold tracking-[1.4px] text-store-eyebrow uppercase md:block">
                  {category.name}
                </p>
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-serif text-[26px] font-medium tracking-[-0.4px] text-store-ink md:text-[44px] md:tracking-[-1px]">
                  {product.name}
                </h1>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(product.name)}`}
                  aria-label="Share on WhatsApp"
                  className="mt-1.5 text-store-ink md:hidden"
                >
                  <Share2 className="size-5" aria-hidden />
                </a>
              </div>
            </div>

            <ProductBuyBox product={buyable} whatsappHref={whatsapp?.href ?? null} />

            <div className="flex flex-col">
              {product.description ? (
                <Accordion title="Description" open>
                  {product.description}
                </Accordion>
              ) : null}
              <Accordion title="Delivery & returns">
                See how delivery, pickup and returns work in our{' '}
                <Link href="/policies/delivery" className="font-semibold text-store-primary">
                  delivery
                </Link>{' '}
                and{' '}
                <Link href="/policies/returns" className="font-semibold text-store-primary">
                  returns
                </Link>{' '}
                policies
                {whatsapp ? (
                  <>
                    , or{' '}
                    <a href={whatsapp.href} className="font-semibold text-store-primary">
                      ask us on WhatsApp
                    </a>
                  </>
                ) : null}
                .
              </Accordion>
            </div>
          </div>
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
    </>
  );
}
