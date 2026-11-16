import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { platformOrigin } from '@/lib/platform-url';
import { cn } from '@/lib/utils';
import { SUPPORT } from '@/mock/marketing';
import { SITE_STATS } from '@/mock/site';
import { SiteNav } from './site-nav';
import { DisplayHeading, SITE_GUTTER, SiteButton, SitePill, SiteRings } from './site-ui';

/**
 * Server parts of the premium public site (08–14): the hero card with the nav and the closing
 * CTA + footer card. Client-safe pieces (headings, eyebrows, buttons) live in `site-ui` and are
 * re-exported here.
 */
export * from './site-ui';

/* ----------------------------------------------------------------- cards */

/**
 * Top-of-page forest card holding the nav (14px inset from the viewport, radius 32). Pages pass
 * their hero content as children; `background` adds a photo/gradient behind everything.
 */
export async function SiteHero({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <div className="px-2 pt-2 md:px-3.5 md:pt-3.5">
      <section
        style={style}
        className={cn(
          // Never taller than the screen on desktop (14px inset above).
          'relative isolate flex flex-col overflow-hidden rounded-[24px] bg-forest bg-cover bg-center text-paper md:rounded-[32px] lg:max-h-[calc(100svh-14px)]',
          className,
        )}
      >
        <div className="px-4 pt-4 md:px-7 md:pt-[22px]">
          <SiteNav appOrigin={appOrigin} />
        </div>
        {children}
      </section>
    </div>
  );
}

type FooterLink = { label: string; href: string };

/** Only pages that exist; design links without a page (blog, careers, press…) are left out. */
function footerColumns(appOrigin: string): { title: string; links: FooterLink[] }[] {
  return [
    {
      title: 'Product',
      links: [
        { label: 'How it works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Start free', href: `${appOrigin}/signup` },
      ],
    },
    {
      title: 'Sellers',
      links: [
        { label: 'Browse stores', href: '/stores' },
        { label: 'Log in', href: `${appOrigin}/login` },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Help centre', href: '/help' },
        { label: 'WhatsApp support', href: SUPPORT.whatsapp },
      ],
    },
  ];
}

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  return link.href.startsWith('/') ? (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  );
}

/**
 * Bottom forest card on every page: rings, "Your stall is waiting. / Open it tonight." CTA, link
 * columns, copyright and the oversized wordmark. (Newsletter and social links from the design are
 * hidden until they exist.)
 */
export async function SiteClosing() {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <div className="px-2 pt-20 pb-2 md:px-3.5 md:pt-[120px] md:pb-3.5">
      <section
        data-site-closing
        className="relative isolate overflow-hidden rounded-[24px] bg-forest text-paper md:rounded-[32px]"
      >
        <SiteRings />
        <div
          className={cn(
            'flex flex-col items-center gap-7 pt-16 text-center md:pt-[110px]',
            SITE_GUTTER,
          )}
        >
          <SitePill tone="light">
            <span aria-hidden className="size-1.5 rounded-full bg-paper" />
            Free forever on the Free plan
          </SitePill>
          <DisplayHeading
            as="h2"
            size="lg"
            tone="light"
            line1="Your stall is waiting."
            line2="Open it tonight."
          />
          <p className="max-w-[560px] text-base text-[#C9CCBC] md:text-[19px]">
            Join {SITE_STATS.storesLive.toLocaleString('en-NG')} Nigerian sellers taking orders and
            payments from one simple link.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <SiteButton href={`${appOrigin}/signup`} variant="light" size="lg">
              Open your store — free <ArrowRight aria-hidden />
            </SiteButton>
            <SiteButton href="/contact" variant="outlineLight" size="lg">
              Talk to sales
            </SiteButton>
          </div>
        </div>

        <footer className={cn('mt-20 md:mt-[100px]', SITE_GUTTER)}>
          <div className="grid gap-10 border-t border-paper/10 pt-12 md:grid-cols-[1fr_repeat(4,minmax(0,160px))]">
            <p className="max-w-[300px] text-base text-[#C9CCBC]">
              Online stores for Nigerian sellers. Built in Lagos.
            </p>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:contents">
              {footerColumns(appOrigin).map((col) => (
                <div key={col.title} className="flex flex-col gap-3.5">
                  <h3 className="text-[13px] font-semibold tracking-[1.2px] text-fg-subtle">
                    {col.title}
                  </h3>
                  {col.links.map((l) => (
                    <FooterAnchor
                      key={l.label}
                      link={l}
                      className="text-[15px] text-paper hover:text-paper/75"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="pt-10 text-sm text-fg-subtle">
            © {new Date().getFullYear()} Ojara Technologies Ltd.
          </p>
        </footer>

        <div
          aria-hidden
          className="flex items-end justify-center gap-[0.03em] overflow-hidden px-4 pt-6 text-[clamp(110px,42vw,628px)] select-none"
        >
          <span className="font-display leading-[0.8] font-bold tracking-[-0.047em] text-paper">
            ojara
          </span>
          <span className="mb-[0.08em] size-[0.165em] shrink-0 rounded-full bg-paper" />
        </div>
      </section>
    </div>
  );
}
