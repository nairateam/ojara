import { Mail, MapPin, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { InstagramIcon } from '@/components/storefront/instagram-icon';
import { Eyebrow, StoreLinkButton } from '@/components/storefront/primitives';
import { getShop, type HostParams, whatsappLink } from '@/components/storefront/store';

export const metadata: Metadata = { title: 'About' };

function Way({
  icon,
  title,
  value,
  sub,
  href,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  sub: string;
  href?: string | undefined;
}) {
  const Tag = href ? 'a' : 'div';
  return (
    <Tag
      {...(href ? { href } : {})}
      className="flex flex-col gap-2 rounded-lg border border-store-border bg-store-card p-5"
    >
      <span className="text-store-primary">{icon}</span>
      <span className="text-ui font-semibold text-store-body">{title}</span>
      <span className="text-title font-semibold break-words text-store-ink">{value}</span>
      <span className="text-ui text-store-body">{sub}</span>
    </Tag>
  );
}

/**
 * 05.09 About & Contact: the store's contact channels. The story half of the design returns when
 * merchants can write their own (storefront editor).
 */
export default async function AboutPage({ params }: { params: HostParams }) {
  const { store } = await getShop(params);
  const whatsapp = whatsappLink(store.whatsappNumber);
  const ways = [
    whatsapp && {
      icon: <MessageCircle className="size-5" aria-hidden />,
      title: 'WhatsApp',
      value: whatsapp.label,
      sub: 'Questions about products, sizes or delivery',
      href: whatsapp.href,
    },
    store.instagramHandle && {
      icon: <InstagramIcon className="size-5" aria-hidden />,
      title: 'Instagram',
      value: `@${store.instagramHandle}`,
      sub: 'See what’s new',
      href: `https://instagram.com/${store.instagramHandle}`,
    },
    store.contactEmail && {
      icon: <Mail className="size-5" aria-hidden />,
      title: 'Email',
      value: store.contactEmail,
      sub: 'We’ll reply as soon as we can',
      href: `mailto:${store.contactEmail}`,
    },
    store.state && {
      icon: <MapPin className="size-5" aria-hidden />,
      title: 'Based in',
      value: store.state,
      sub: 'Nigeria',
      href: undefined,
    },
  ].filter((w) => Boolean(w)) as {
    icon: ReactNode;
    title: string;
    value: string;
    sub: string;
    href: string | undefined;
  }[];

  return (
    <>
      <section className="flex flex-col gap-5 bg-store-band px-4 py-12 md:px-8 md:py-16 xl:px-16">
        <Eyebrow>About</Eyebrow>
        <h1 className="font-serif text-[36px] leading-[1.06] font-medium tracking-[-1.2px] text-store-ink md:text-[52px] md:leading-[55px]">
          {store.name}
        </h1>
        <p className="max-w-[560px] text-base leading-[26px] text-store-body">
          {store.state ? `An independent store based in ${store.state}. ` : ''}Browse what we have
          in stock and order online, or get in touch below.
        </p>
        <div>
          <StoreLinkButton href="/shop">Shop now</StoreLinkButton>
        </div>
      </section>

      {ways.length ? (
        <section className="flex flex-col gap-6 px-4 py-12 md:px-8 md:py-[72px] xl:px-16">
          <h2 className="font-serif text-[28px] font-medium tracking-[-0.6px] text-store-ink md:text-[34px]">
            Get in touch
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {ways.map((w) => (
              <Way key={w.title} {...w} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
