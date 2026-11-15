import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';

type FooterLink = { label: string; href: string; external?: boolean };

function columns(appOrigin: string): { heading: string; links: FooterLink[] }[] {
  return [
    {
      heading: 'Product',
      links: [
        { label: 'How it works', href: '/how-it-works' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Stores on Ojara', href: '/stores' },
        { label: 'Log in', href: `${appOrigin}/login`, external: true },
      ],
    },
    {
      heading: 'Help',
      links: [
        { label: 'Help centre', href: '/help' },
        { label: 'Contact support', href: '/help#contact' },
        { label: 'System status', href: '/help#contact' },
        { label: 'Seller Policy', href: '/help' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Ojara', href: '/' },
        { label: 'Careers', href: '/' },
        { label: 'Privacy', href: '/help' },
        { label: 'Terms', href: '/help' },
      ],
    },
  ];
}

const MOBILE_LINKS: FooterLink[] = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Stores', href: '/stores' },
  { label: 'Help', href: '/help' },
  { label: 'Privacy', href: '/help' },
  { label: 'Terms', href: '/help' },
];

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  return link.external ? (
    <a href={link.href} className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

/**
 * 01.xx footer: forest, padding 56/80/32, brand blurb + three link columns + bottom row.
 * Mobile (01.07): wordmark, one inline link row and a single copyright line.
 */
export function MarketingFooter({ appOrigin }: { appOrigin: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-forest">
      {/* Mobile */}
      <div className="flex flex-col gap-3 px-5 pt-7 pb-9 md:hidden">
        <Wordmark size="sm" tone="light" />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-1 text-ui text-fg-on-dark">
          {MOBILE_LINKS.map((l, i) => (
            <span key={l.label}>
              <FooterAnchor link={l} className="hover:text-paper" />
              {i < MOBILE_LINKS.length - 1 && <span aria-hidden> ·</span>}
            </span>
          ))}
        </nav>
        <p className="text-xs text-fg-subtle">© {year} Ojara · Payments by Paystack</p>
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-10 px-10 pt-14 pb-8 md:flex xl:px-20">
        <div className="flex gap-12">
          <div className="flex flex-1 flex-col gap-3">
            <Wordmark size="xl" tone="light" />
            <p className="max-w-[300px] text-sm leading-[21px] text-fg-on-dark">
              Ọjà means market. We help small businesses open theirs online.
            </p>
          </div>
          {columns(appOrigin).map((col) => (
            <nav
              key={col.heading}
              aria-label={col.heading}
              className="flex w-[140px] flex-col gap-2.5 lg:w-[180px]"
            >
              <h2 className="text-sm font-semibold text-paper">{col.heading}</h2>
              {col.links.map((l) => (
                <FooterAnchor
                  key={l.label}
                  link={l}
                  className="text-sm text-fg-on-dark hover:text-paper"
                />
              ))}
            </nav>
          ))}
        </div>
        <div className="flex justify-between gap-2 border-t border-paper/10 pt-5 text-ui text-fg-subtle">
          <span>© {year} Ojara Technologies Ltd · Lagos, Nigeria</span>
          <span>Payments processed by Paystack</span>
        </div>
      </div>
    </footer>
  );
}

/** Pricing (01.04) exception: dark CTA section that doubles as a one-line footer. */
export function MarketingCtaFooter({ appOrigin }: { appOrigin: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col items-center gap-[18px] bg-forest px-5 py-14 text-center md:px-20">
      <h2 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.8px] text-paper md:text-4xl">
        Your store can be live in 10 minutes.
      </h2>
      <a
        href={`${appOrigin}/signup`}
        className="rounded-[10px] bg-paper px-[26px] py-3.5 text-[15px] font-semibold text-forest transition-colors hover:bg-paper/90"
      >
        Create your free store
      </a>
      <p className="text-xs text-fg-subtle">
        © {year} Ojara · Lagos, Nigeria ·{' '}
        <Link href="/help" className="hover:text-paper">
          Privacy
        </Link>{' '}
        ·{' '}
        <Link href="/help" className="hover:text-paper">
          Terms
        </Link>{' '}
        ·{' '}
        <Link href="/help" className="hover:text-paper">
          Seller Policy
        </Link>
      </p>
    </footer>
  );
}
