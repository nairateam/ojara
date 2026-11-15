import { Mail, MapPin, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { InstagramIcon } from '@/components/storefront/instagram-icon';
import { Eyebrow, StoreField, storeButton, storeInput } from '@/components/storefront/primitives';
import { cn } from '@/lib/utils';
import { STORE } from '@/mock/storefront';

export const metadata: Metadata = { title: 'Our story' };

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
  href?: string;
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

const formInput = cn(storeInput, 'bg-store-page');

/** 05.09 Our Story & Contact. */
export default function AboutPage() {
  return (
    <>
      <section className="flex flex-col md:grid md:min-h-[520px] md:grid-cols-[44%_1fr] xl:grid-cols-[640px_1fr]">
        <div className="relative h-[320px] md:h-auto">
          <Image
            src={STORE.story.image}
            alt={`${STORE.founder} in a hand-dyed adire dress`}
            fill
            priority
            sizes="(min-width: 768px) 640px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-5 bg-store-band px-4 py-10 md:px-10 md:py-14 xl:px-[72px]">
          <Eyebrow>Our story</Eyebrow>
          <h1 className="font-serif text-[36px] leading-[1.06] font-medium tracking-[-1.2px] text-store-ink md:text-[52px] md:leading-[55px]">
            {STORE.story.title}
          </h1>
          {STORE.story.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="text-base leading-[26px] text-store-body">
              {p}
            </p>
          ))}
          <p className="text-sm font-semibold text-store-ink">— {STORE.founder}, founder</p>
        </div>
      </section>

      <section className="flex flex-col gap-10 px-4 py-12 md:px-8 md:py-[72px] lg:flex-row lg:gap-16 xl:px-16">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h2 className="font-serif text-[28px] font-medium tracking-[-0.6px] text-store-ink md:text-[34px]">
            Visit or get in touch
          </h2>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Way
              icon={<MessageCircle className="size-5" aria-hidden />}
              title="WhatsApp"
              value={STORE.whatsapp}
              sub="Fastest — we reply within the hour"
              href={STORE.whatsappHref}
            />
            <Way
              icon={<InstagramIcon className="size-5" aria-hidden />}
              title="Instagram"
              value={STORE.instagram}
              sub="New drops every Friday"
              href={STORE.instagramHref}
            />
            <Way
              icon={<Mail className="size-5" aria-hidden />}
              title="Email"
              value={STORE.email}
              sub="For wholesale and custom orders"
              href={`mailto:${STORE.email}`}
            />
            <Way
              icon={<MapPin className="size-5" aria-hidden />}
              title="Studio & pickup"
              value={STORE.address}
              sub={STORE.hours}
            />
          </div>
        </div>
        <form className="flex flex-col gap-4 rounded-[14px] border border-store-border bg-store-card p-5 md:p-7 lg:w-[480px] lg:shrink-0">
          <h2 className="font-serif text-[22px] font-medium text-store-ink">Send us a message</h2>
          <StoreField label="Your name" htmlFor="contact-name">
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              placeholder="e.g. Funke Adebayo"
              className={formInput}
            />
          </StoreField>
          <StoreField label="Phone or email" htmlFor="contact-reply">
            <input
              id="contact-reply"
              name="reply"
              placeholder="So we can reply"
              className={formInput}
            />
          </StoreField>
          <StoreField label="Message" htmlFor="contact-message">
            <textarea
              id="contact-message"
              name="message"
              placeholder="Ask about sizing, custom orders or delivery…"
              className={cn(formInput, 'h-[110px] resize-none')}
            />
          </StoreField>
          <button type="submit" className={storeButton('primary', 'h-12 w-full py-0')}>
            Send message
          </button>
        </form>
      </section>
    </>
  );
}
