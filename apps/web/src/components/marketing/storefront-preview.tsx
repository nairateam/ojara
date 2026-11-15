import {
  ArrowRight,
  Box,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import { FEATURED_STORE } from '@/mock/marketing';
import { BrowserDots } from './primitives';

/**
 * Simplified render of the Adùnní Threads storefront home (05.01) inside browser chrome, standing in
 * for the storefront screenshot on 01.03. Uses the storefront tokens (defaults = Adùnní's brand).
 */
export function StorefrontPreview() {
  const s = FEATURED_STORE;
  return (
    <div
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-tl-[14px] bg-surface shadow-[0_0_30px_#333A2F33]"
    >
      <div className="flex items-center gap-1.5 bg-surface-muted px-3.5 py-2.5">
        <BrowserDots size={9} />
        <span className="ml-2 text-2xs text-fg-muted">{s.host}</span>
      </div>
      <div className="flex flex-1 flex-col bg-store-page text-store-ink">
        <div className="flex items-center justify-center gap-1.5 bg-store-primary py-1.5 text-[7px] text-store-primary-fg">
          <Truck className="size-2" /> Free delivery in Lagos on orders over ₦40,000 · Pickup
          available at our Surulere studio
        </div>
        <div className="flex items-center gap-4 border-b border-store-border bg-store-card px-7 py-2.5">
          <span className="flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-[3px] bg-store-accent font-display text-[9px] font-bold text-store-accent-ink">
              {s.initial}
            </span>
            <span className="font-serif text-[11px] font-semibold">{s.name}</span>
          </span>
          <span className="ml-auto hidden gap-4 text-[7px] font-medium xl:flex">
            <span className="text-store-primary">Shop all</span>
            <span>Dresses</span>
            <span>Headwear</span>
            <span>Men</span>
            <span>Fabrics</span>
            <span>Our story</span>
          </span>
          <span className="ml-auto flex items-center gap-1 rounded-pill border border-store-border px-2 py-0.5 text-[6px] text-store-muted xl:ml-6">
            <Search className="size-1.5" /> Search
          </span>
          <MessageCircle className="size-2.5" />
          <ShoppingBag className="size-2.5" />
        </div>
        <div className="flex flex-1">
          <div className="flex flex-1 flex-col justify-center gap-2.5 px-7">
            <span className="text-[6px] font-bold tracking-[1px] text-store-eyebrow uppercase">
              New in · November drop
            </span>
            <span className="font-serif text-[26px] leading-[1.1] font-semibold">
              Hand-dyed adire, made in Abeokuta.
            </span>
            <span className="max-w-[230px] text-[7px] leading-[1.5] text-store-body">
              Every piece is dyed by hand with indigo, so no two patterns are the same. Made in
              small batches, shipped across Nigeria.
            </span>
            <span className="flex gap-1.5">
              <span className="flex items-center gap-1 rounded-[3px] bg-store-primary px-2.5 py-1.5 text-[6px] font-semibold text-store-primary-fg">
                Shop new in <ArrowRight className="size-1.5" />
              </span>
              <span className="rounded-[3px] border border-store-ink px-2.5 py-1.5 text-[6px] font-semibold">
                Our story
              </span>
            </span>
            <span className="flex gap-3 text-[5px] text-store-body">
              <span className="flex items-center gap-0.5">
                <ShieldCheck className="size-1.5" /> Secure payment by Paystack
              </span>
              <span className="flex items-center gap-0.5">
                <Truck className="size-1.5" /> Nationwide delivery
              </span>
              <span className="flex items-center gap-0.5">
                <Box className="size-1.5" /> Pickup in Surulere
              </span>
            </span>
          </div>
          <div className="relative w-[46%]">
            <Image src={s.heroImage} alt="" fill sizes="300px" className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
