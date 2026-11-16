import { formatKobo } from '@ojara/shared';
import { BatteryFull, Lock, MessageCircle, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  CHECKOUT_TOTAL_KOBO,
  DELIVERY_ZONES,
  DRAFT_PRODUCT,
  ONBOARDING_PRODUCTS,
  ONBOARDING_STORE,
  PICKUP,
} from '@/mock/onboarding';

/** Green-dot caption above each preview ("Your store is taking shape", …). */
export function PreviewCaption({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-fg-muted">
      <span className="size-[7px] rounded-full bg-success" aria-hidden />
      {children}
    </span>
  );
}

/** What the preview shows of the merchant's store (sample values until they enter their own). */
export interface PreviewStore {
  name: string;
  host: string;
  whatsapp?: string | null;
  /** Brand colour (buttons and links). */
  primaryColor?: string | null;
}

const SAMPLE_STORE: PreviewStore = {
  name: ONBOARDING_STORE.name,
  host: ONBOARDING_STORE.host,
  whatsapp: ONBOARDING_STORE.whatsapp,
};

/**
 * Phone mock for the onboarding live preview: 300×600, 10px forest bezel (radius 36), paper
 * screen (radius 28), status bar, URL bar and the store's nav (logo tile + Fraunces name).
 */
export function PhonePreview({
  caption,
  store = SAMPLE_STORE,
  children,
}: {
  caption: string;
  store?: PreviewStore;
  children: ReactNode;
}) {
  const style = store.primaryColor
    ? ({ '--store-primary': store.primaryColor } as CSSProperties)
    : undefined;
  return (
    <figure
      className="flex flex-col items-center gap-3"
      aria-label={`Preview: ${caption}`}
      style={style}
    >
      <figcaption>
        <PreviewCaption>{caption}</PreviewCaption>
      </figcaption>
      <div className="flex h-[600px] w-[300px] max-w-full shrink-0 flex-col rounded-[36px] bg-forest p-2.5 shadow-mock">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[28px] bg-store-page">
          <div className="flex items-center justify-between px-5 pt-3 pb-1.5 text-[11px] font-semibold text-fg">
            9:41 <BatteryFull className="size-3.5" aria-hidden />
          </div>
          <div className="px-3.5 pb-2">
            <div className="flex items-center justify-center gap-1 rounded-md bg-[#EFEAE0] px-2.5 py-[5px] text-[11px] text-fg-muted">
              <Lock className="size-2.5" aria-hidden /> {store.host}
            </div>
          </div>
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2">
              <span className="flex size-[26px] items-center justify-center rounded-sm bg-store-accent font-display text-sm font-bold text-store-accent-ink">
                {store.name.trim().charAt(0).toUpperCase() || 'O'}
              </span>
              <span className="font-serif text-[15px] font-semibold text-fg">{store.name}</span>
            </span>
            <ShoppingBag className="size-4 text-fg" aria-hidden />
          </div>
          {children}
        </div>
      </div>
    </figure>
  );
}

/** 02.04: grey placeholders + the WhatsApp contact strip. */
export function SkeletonStore({
  whatsapp = ONBOARDING_STORE.whatsapp,
}: {
  whatsapp?: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 p-3.5" aria-hidden>
      <div className="h-[150px] rounded-[10px] bg-[#EFE9DE]" />
      <div className="h-3.5 w-[180px] rounded-xs bg-line" />
      <div className="h-2.5 w-[120px] rounded-xs bg-line" />
      <div className="flex gap-2.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex flex-1 flex-col gap-1.5">
            <div className="h-[110px] rounded-md bg-[#EFE9DE]" />
            <div className="h-2 w-20 rounded-xs bg-line" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-md bg-[#E6F4EC] px-2.5 py-2 text-[10px] font-semibold text-success">
        <MessageCircle className="size-3" /> Chat on WhatsApp
        {whatsapp ? ` · ${whatsapp}` : ''}
      </div>
    </div>
  );
}

function ProductTile({
  name,
  image,
  priceKobo,
  imageClassName,
  badge,
}: {
  name: string;
  image: string;
  priceKobo: number;
  imageClassName: string;
  badge?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
      <div className={cn('relative overflow-hidden rounded-md', imageClassName)}>
        <Image src={image} alt={name} fill sizes="130px" className="object-cover" />
        {badge ? (
          <span className="absolute top-1.5 left-1.5 rounded-xs bg-paper px-1.5 py-0.5 text-[9px] font-bold text-fg">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="truncate text-[11px] font-semibold text-store-ink">{name}</span>
      <span className="text-[11px] font-semibold text-store-primary">{formatKobo(priceKobo)}</span>
    </div>
  );
}

/** 02.05 / 02.09: hero photo with headline card, then the first two products. */
export function StorefrontHome({ cta }: { cta: string }) {
  return (
    <>
      <div className="relative flex h-[190px] shrink-0 flex-col justify-end p-4">
        <Image
          src={ONBOARDING_STORE.heroImage}
          alt=""
          fill
          sizes="280px"
          className="object-cover"
          priority
        />
        <div className="relative flex flex-col items-start gap-2 rounded-[10px] bg-[#FBF8F2EE] p-3">
          <p className="font-serif text-base leading-[19px] font-semibold text-fg">
            {ONBOARDING_STORE.heroHeadline}
          </p>
          <span className="rounded-sm bg-store-primary px-3 py-1.5 text-[11px] font-semibold text-[#F5F6EE]">
            {cta}
          </span>
        </div>
      </div>
      <div className="flex gap-2.5 p-3.5">
        {ONBOARDING_PRODUCTS.map((p) => (
          <ProductTile key={p.name} {...p} imageClassName="h-[120px]" />
        ))}
      </div>
    </>
  );
}

/** 02.06: "New this week" grid with the product being added and an empty slot. */
export function ProductsSoFar() {
  return (
    <div className="flex flex-col gap-3 p-3.5">
      <p className="font-serif text-base font-semibold text-store-ink">New this week</p>
      <div className="flex gap-2.5">
        {ONBOARDING_PRODUCTS.map((p) => (
          <ProductTile key={p.name} {...p} imageClassName="h-[150px]" />
        ))}
      </div>
      <div className="flex gap-2.5">
        <ProductTile
          name={DRAFT_PRODUCT.name}
          image={DRAFT_PRODUCT.image}
          priceKobo={DRAFT_PRODUCT.priceKobo}
          imageClassName="h-[150px] outline-2 -outline-offset-1 outline-fg-muted"
          badge="Adding…"
        />
        <div className="flex h-[150px] flex-1 flex-col items-center justify-center gap-1 rounded-md border-[1.5px] border-[#D9D2C3] text-[10px] text-[#9C968A]">
          <Plus className="size-3.5" aria-hidden />
          Your next product
        </div>
      </div>
    </div>
  );
}

/** 02.08: checkout delivery choice as customers see it. */
export function CheckoutOptions() {
  const lekki = DELIVERY_ZONES[1];
  const mainland = DELIVERY_ZONES[0];
  const options = [
    lekki && {
      title: `Delivery · ${lekki.zone}`,
      sub: lekki.arrives,
      price: formatKobo(lekki.chargeKobo),
    },
    mainland && {
      title: `Delivery · ${mainland.zone}`,
      sub: mainland.arrives,
      price: formatKobo(mainland.chargeKobo),
    },
    { title: PICKUP.label, sub: PICKUP.hoursShort, price: 'Free' },
  ].filter(Boolean) as { title: string; sub: string; price: string }[];

  return (
    <div className="flex flex-col gap-2.5 p-4">
      <p className="font-serif text-base font-semibold text-fg">How would you like to get it?</p>
      {options.map((o, i) => {
        const selected = i === 0;
        return (
          <div
            key={o.title}
            className={cn(
              'flex items-center gap-2.5 rounded-md bg-surface p-[11px]',
              selected
                ? 'outline-[1.5px] -outline-offset-[0.75px] outline-store-primary outline-solid'
                : 'border border-line',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'size-3.5 shrink-0 rounded-full bg-surface',
                selected
                  ? 'border-[4.5px] border-store-primary'
                  : 'border-[1.5px] border-line-strong',
              )}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-px">
              <span className="truncate text-[11px] font-semibold text-store-ink">{o.title}</span>
              <span className="text-[10px] text-[#6B665B]">{o.sub}</span>
            </span>
            <span
              className={cn(
                'text-[11px] font-bold',
                selected ? 'text-store-primary' : 'text-store-ink',
              )}
            >
              {o.price}
            </span>
          </div>
        );
      })}
      <div className="flex justify-between px-0.5 pt-2 text-xs text-store-ink">
        <span className="font-semibold">Total</span>
        <span className="font-bold">{formatKobo(CHECKOUT_TOTAL_KOBO)}</span>
      </div>
      <span className="flex justify-center rounded-md bg-store-primary py-2.5 text-xs font-semibold text-[#F5F6EE]">
        Pay {formatKobo(CHECKOUT_TOTAL_KOBO)}
      </span>
    </div>
  );
}
