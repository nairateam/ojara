import {
  Bell,
  Boxes,
  Cookie,
  CreditCard,
  Flag,
  Gift,
  Globe,
  Landmark,
  Layers,
  type LucideIcon,
  MessageCircle,
  Package,
  PackageCheck,
  PackageSearch,
  Plus,
  Receipt,
  Rocket,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Truck,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Faq, IconName } from '@/mock/marketing';

const ICONS: Record<IconName, LucideIcon> = {
  shirt: Shirt,
  sparkles: Sparkles,
  cookie: Cookie,
  smartphone: Smartphone,
  sofa: Sofa,
  gift: Gift,
  'shopping-bag': ShoppingBag,
  boxes: Boxes,
  'credit-card': CreditCard,
  bell: Bell,
  'package-check': PackageCheck,
  landmark: Landmark,
  rocket: Rocket,
  package: Package,
  truck: Truck,
  layers: Layers,
  globe: Globe,
  'package-search': PackageSearch,
  'message-circle': MessageCircle,
  flag: Flag,
  receipt: Receipt,
};

/** Renders a lucide icon by its design (data-icon) name. */
export function MarketingIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden className={className} />;
}

/** Section eyebrow: Inter 12/700, tracking 1.6, uppercase. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-xs font-bold tracking-eyebrow text-fg-muted uppercase', className)}>
      {children}
    </p>
  );
}

/** Horizontal page gutter used by every marketing section (80 desktop, 20 mobile). */
export const GUTTER = 'px-5 md:px-10 xl:px-20';

/** Coloured initial tile for directory / testimonial merchants. */
export function InitialTile({
  initial,
  color,
  className,
  style,
}: {
  initial: string;
  color: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: color, ...style }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-display font-bold',
        className,
      )}
    >
      {initial}
    </span>
  );
}

/** Mac-style browser chrome dots (red/amber/green from the mockups). */
export function BrowserDots({ size = 10 }: { size?: number }) {
  return (
    <>
      {['#E5655B', '#E9B63F', '#5DB55B'].map((c) => (
        <span
          key={c}
          aria-hidden
          className="shrink-0 rounded-full"
          style={{ backgroundColor: c, width: size, height: size }}
        />
      ))}
    </>
  );
}

/**
 * FAQ list: 1px dividers between rows. `collapsible` rows are native <details> (open by default,
 * as drawn) with a plus icon; otherwise a static question/answer list.
 */
export function FaqList({
  items,
  collapsible = false,
  size = 'lg',
}: {
  items: Faq[];
  collapsible?: boolean;
  /** lg = 18px questions, 22px row padding (How it works); md = 17px, 20px (Pricing). */
  size?: 'lg' | 'md';
}) {
  const row = cn('border-t border-line', size === 'lg' ? 'py-[22px]' : 'py-5');
  const q = cn('font-semibold text-fg', size === 'lg' ? 'text-lg' : 'text-[17px]');
  const a = 'mt-2 text-[15px] leading-[23px] text-fg-muted';
  return (
    <div className="flex flex-col">
      {items.map((item) =>
        collapsible ? (
          <details key={item.q} open className={cn(row, 'group')}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <h3 className={q}>{item.q}</h3>
              <Plus aria-hidden className="size-[18px] shrink-0 text-fg-muted" />
            </summary>
            <p className={a}>{item.a}</p>
          </details>
        ) : (
          <div key={item.q} className={row}>
            <h3 className={q}>{item.q}</h3>
            <p className={a}>{item.a}</p>
          </div>
        ),
      )}
    </div>
  );
}

/**
 * "Your market is online" band before the footer (home, how it works, stores). On desktop an inset
 * rounded card with an inline phone form; on mobile (01.07) a full-bleed band with stacked fields.
 * The form hands the phone number to dashboard sign-up.
 */
export function PhoneCtaBand({
  appOrigin,
  title,
  mobileTitle,
}: {
  appOrigin: string;
  title: string;
  mobileTitle?: string;
}) {
  return (
    <section aria-labelledby="cta-heading" className="md:px-10 md:pb-10">
      <div className="flex flex-col gap-3.5 bg-surface-muted px-5 py-9 md:items-center md:gap-[22px] md:rounded-2xl md:px-10 md:py-[72px] lg:px-20">
        <h2
          id="cta-heading"
          className="font-display text-[28px] font-semibold tracking-[-0.6px] text-fg md:max-w-[760px] md:text-center md:text-[40px] md:leading-[44px] md:tracking-[-1.2px] lg:text-5xl lg:leading-[50px] lg:tracking-[-1.4px]"
        >
          {mobileTitle ? (
            <>
              <span className="md:hidden">{mobileTitle}</span>
              <span className="hidden md:inline">{title}</span>
            </>
          ) : (
            title
          )}
        </h2>
        <form
          action={`${appOrigin}/signup`}
          method="get"
          className="flex w-full flex-col gap-3.5 md:max-w-[520px] md:flex-row md:items-center md:gap-1.5 md:rounded-[14px] md:bg-surface md:p-1.5"
        >
          <label className="flex flex-1 items-center gap-2 rounded-lg bg-surface p-3.5 text-[15px] md:rounded-none md:bg-transparent md:p-3">
            <span className="text-fg-muted">
              <span aria-hidden className="hidden md:inline">
                🇳🇬{' '}
              </span>
              +234
            </span>
            <span className="sr-only">Phone number</span>
            <input
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="Your phone number"
              className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-fg-subtle"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-forest py-[15px] text-[15px] font-semibold text-paper transition-colors hover:bg-forest/90 focus-visible:shadow-focus focus-visible:outline-none md:rounded-[10px] md:px-5 md:py-[13px] md:text-base"
          >
            Start free
          </button>
        </form>
        <p className="hidden text-sm text-fg-lead md:block">
          We’ll text you a code. No card, no contract.
        </p>
      </div>
    </section>
  );
}
