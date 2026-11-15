import { notFound } from 'next/navigation';

const PAGES: Record<string, string> = {
  products: 'Shop all',
  about: 'Our story',
  cart: 'Your cart',
  track: 'Track your order',
  delivery: 'Delivery & pickup',
  returns: 'Returns & exchanges',
};

type Props = { params: Promise<{ host: string; path: string[] }> };

/** PLACEHOLDER for storefront pages (category, product, cart, track, policies). */
export default async function StorefrontPlaceholder({ params }: Props) {
  const { path } = await params;
  const title = PAGES[path[0] ?? ''];
  if (!title || path.length > 2) notFound();
  return (
    <section className="flex flex-col gap-3 px-4 py-14 md:px-16">
      <h1 className="font-serif text-[36px] font-medium tracking-[-1px] md:text-5xl">{title}</h1>
      <p className="text-base text-store-body">Coming soon.</p>
    </section>
  );
}
