import { formatKobo } from '@ojara/shared';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Lock,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import { NEW_THIS_WEEK, STORE, STORE_CATEGORIES, STORE_NAV } from '@/mock/dashboard-store';

/**
 * Sizes inside the preview are written in storefront design pixels (05.xx at 1440 wide) and scaled
 * to the frame with container units: `--u` is one design pixel. The frame switches to the mobile
 * storefront layout (390 base) when it is narrower than 36rem (the "Mobile" device toggle or a
 * phone-sized dashboard).
 */
const u = (n: number) => `calc(var(--u) * ${n})`;

function Hero({ mobile }: { mobile: boolean }) {
  return (
    <div className="relative border-2 border-forest">
      <span className="absolute top-0 left-0 z-10 rounded-br-xs bg-forest px-2 py-[3px] text-2xs font-semibold text-paper">
        Hero banner · click to edit
      </span>
      <div className={mobile ? 'flex flex-col-reverse' : 'flex'}>
        <div
          className="flex flex-1 flex-col justify-center"
          style={{
            padding: mobile ? `${u(28)} ${u(20)}` : `${u(56)} ${u(64)}`,
            gap: u(mobile ? 14 : 20),
          }}
        >
          <p
            className="font-semibold text-store-eyebrow uppercase"
            style={{ fontSize: u(mobile ? 11 : 12), letterSpacing: u(1.6) }}
          >
            New in · November drop
          </p>
          <h2
            className="font-serif font-medium text-store-ink"
            style={{
              fontSize: u(mobile ? 36 : 64),
              lineHeight: mobile ? 1.05 : u(65),
              letterSpacing: u(-1.5),
              maxWidth: u(560),
            }}
          >
            Hand-dyed adire, made in Abeokuta.
          </h2>
          <p
            className="text-store-body"
            style={{ fontSize: u(mobile ? 14 : 16), lineHeight: 1.6, maxWidth: u(480) }}
          >
            Every piece is dyed by hand with indigo, so no two patterns are the same. Made in small
            batches, shipped across Nigeria.
          </p>
          <div className="flex flex-wrap" style={{ gap: u(12) }}>
            <span
              className="inline-flex items-center bg-store-primary font-semibold text-store-primary-fg"
              style={{
                fontSize: u(14),
                padding: `${u(13)} ${u(22)}`,
                borderRadius: u(8),
                gap: u(8),
              }}
            >
              Shop new in <ArrowRight style={{ width: u(16), height: u(16) }} aria-hidden />
            </span>
            <span
              className="inline-flex items-center border-store-ink font-semibold text-store-ink"
              style={{
                fontSize: u(14),
                padding: `${u(12)} ${u(22)}`,
                borderRadius: u(8),
                borderWidth: u(1.5),
              }}
            >
              Our story
            </span>
          </div>
          <ul
            className="flex flex-wrap text-store-muted"
            style={{ fontSize: u(12), gap: `${u(8)} ${u(22)}`, marginTop: u(mobile ? 4 : 14) }}
          >
            {[
              { icon: ShieldCheck, text: 'Secure payment by Paystack' },
              { icon: Truck, text: 'Nationwide delivery' },
              { icon: Store, text: 'Pickup in Surulere' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center" style={{ gap: u(6) }}>
                <Icon
                  className="text-store-primary"
                  style={{ width: u(14), height: u(14) }}
                  aria-hidden
                />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div
          className={cn('relative shrink-0', !mobile && 'w-[46%]')}
          style={{ aspectRatio: mobile ? '4 / 3.4' : undefined }}
        >
          <Image
            src="/mock/generated-6.jpg"
            alt="Model wearing an indigo adire wrap dress in a garden courtyard"
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: u(24) }}>
      <h3
        className="font-serif font-medium text-store-ink"
        style={{ fontSize: u(30), letterSpacing: u(-0.5) }}
      >
        {children}
      </h3>
      {aside}
    </div>
  );
}

/** Live storefront preview inside a browser frame (03.10). */
export function StorefrontPreview({ device = 'desktop' }: { device?: 'desktop' | 'mobile' }) {
  const mobile = device === 'mobile';
  const pad = mobile ? 20 : 64;
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg border border-line bg-surface shadow-mock',
        mobile && 'mx-auto max-w-[390px]',
      )}
    >
      <div className="flex items-center gap-3 border-b border-line bg-paper px-3.5 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#E5655B]" />
          <span className="size-2.5 rounded-full bg-[#E9B63F]" />
          <span className="size-2.5 rounded-full bg-[#5DB55B]" />
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-sm bg-surface px-2.5 py-[5px] text-xs text-fg-muted">
          <Lock className="size-[11px] shrink-0" aria-hidden />
          <span className="truncate">{STORE.ojaraAddress}</span>
        </span>
      </div>

      <div className="@container">
        <div
          inert
          aria-label={`Preview of ${STORE.name} storefront`}
          className={cn(
            'bg-store-page font-sans text-store-ink select-none lg:max-h-[calc(100dvh-196px)] lg:overflow-y-auto',
            mobile ? '[--u:calc(100cqw/390)]' : '[--u:calc(100cqw/1440)]',
          )}
        >
          {/* Announcement bar */}
          <div
            className="flex items-center justify-center bg-store-primary text-center font-medium text-white"
            style={{ padding: `${u(9)} ${u(16)}`, fontSize: u(12), gap: u(8) }}
          >
            <Truck className="shrink-0" style={{ width: u(14), height: u(14) }} aria-hidden />
            Free delivery in Lagos on orders over {formatKobo(4_000_000)} · Pickup available at our
            Surulere studio
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-store-border"
            style={{ padding: `${u(18)} ${u(pad)}`, gap: u(16) }}
          >
            <span className="flex items-center" style={{ gap: u(10) }}>
              <span
                className="flex items-center justify-center bg-store-accent font-display font-bold text-store-accent-ink"
                style={{ width: u(36), height: u(36), borderRadius: u(8), fontSize: u(20) }}
              >
                {STORE.name.charAt(0)}
              </span>
              <span className="font-serif font-semibold" style={{ fontSize: u(22) }}>
                {STORE.name}
              </span>
            </span>
            {mobile ? null : (
              <nav className="flex" style={{ gap: u(32), fontSize: u(14) }}>
                {STORE_NAV.map((item, i) => (
                  <span
                    key={item}
                    className={cn('font-medium', i === 0 ? 'text-store-primary' : 'text-store-ink')}
                  >
                    {item}
                  </span>
                ))}
              </nav>
            )}
            <span className="flex items-center" style={{ gap: u(18) }}>
              {mobile ? null : (
                <span
                  className="flex items-center border border-store-border bg-store-card text-store-muted"
                  style={{
                    width: u(170),
                    padding: `${u(8)} ${u(12)}`,
                    borderRadius: 999,
                    gap: u(8),
                    fontSize: u(13),
                  }}
                >
                  <Search style={{ width: u(15), height: u(15) }} aria-hidden />
                  Search
                </span>
              )}
              <MessageCircle style={{ width: u(20), height: u(20) }} aria-hidden />
              <span className="relative flex">
                <ShoppingBag style={{ width: u(20), height: u(20) }} aria-hidden />
                <span
                  className="absolute flex items-center justify-center rounded-full bg-store-primary font-bold text-white"
                  style={{
                    width: u(20),
                    height: u(20),
                    fontSize: u(11),
                    top: u(-8),
                    right: u(-12),
                  }}
                >
                  2
                </span>
              </span>
            </span>
          </div>

          <Hero mobile={mobile} />

          {/* Shop by category */}
          <section style={{ padding: `${u(mobile ? 32 : 56)} ${u(pad)} 0` }}>
            <SectionTitle>Shop by category</SectionTitle>
            <div
              className={cn('grid', mobile ? 'grid-cols-2' : 'grid-cols-4')}
              style={{ gap: u(mobile ? 12 : 24) }}
            >
              {STORE_CATEGORIES.map((c) => (
                <div
                  key={c.name}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '1.43', borderRadius: u(8) }}
                >
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 180px, 45vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute flex items-center justify-between bg-store-card/90"
                    style={{
                      left: u(14),
                      right: u(14),
                      bottom: u(14),
                      padding: `${u(10)} ${u(14)}`,
                      borderRadius: u(6),
                    }}
                  >
                    <span className="flex flex-col">
                      <span className="font-semibold" style={{ fontSize: u(14) }}>
                        {c.name}
                      </span>
                      <span className="text-store-muted" style={{ fontSize: u(11) }}>
                        {c.count} pieces
                      </span>
                    </span>
                    <ArrowUpRight style={{ width: u(16), height: u(16) }} aria-hidden />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New this week */}
          <section style={{ padding: `${u(mobile ? 32 : 64)} ${u(pad)}` }}>
            <SectionTitle
              aside={
                <span
                  className="flex items-center border border-store-border bg-store-card"
                  style={{
                    fontSize: u(12),
                    padding: `${u(6)} ${u(12)}`,
                    borderRadius: u(6),
                    gap: u(6),
                  }}
                >
                  Sort: Newest
                  <ChevronDown style={{ width: u(12), height: u(12) }} aria-hidden />
                </span>
              }
            >
              New this week
            </SectionTitle>
            <div
              className={cn('grid', mobile ? 'grid-cols-2' : 'grid-cols-4')}
              style={{ gap: u(mobile ? 12 : 24) }}
            >
              {NEW_THIS_WEEK.map((p) => (
                <div key={p.name} className="flex flex-col" style={{ gap: u(8) }}>
                  <div
                    className="relative overflow-hidden bg-store-band"
                    style={{ aspectRatio: '0.87', borderRadius: u(8) }}
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 180px, 45vw"
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold" style={{ fontSize: u(14) }}>
                    {p.name}
                  </span>
                  <span className="font-semibold text-store-primary" style={{ fontSize: u(14) }}>
                    {formatKobo(p.priceKobo)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Our story */}
          <section
            className="bg-store-band text-center"
            style={{ padding: `${u(mobile ? 36 : 72)} ${u(pad)}` }}
          >
            <p
              className="mx-auto font-serif text-store-ink"
              style={{ fontSize: u(mobile ? 22 : 28), lineHeight: 1.3, maxWidth: u(760) }}
            >
              “My grandmother dyed cloth in Abeokuta. I still use her indigo pits, and her
              patterns.”
            </p>
            <p className="text-store-muted" style={{ fontSize: u(13), marginTop: u(16) }}>
              {STORE.ownerName}, founder
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
