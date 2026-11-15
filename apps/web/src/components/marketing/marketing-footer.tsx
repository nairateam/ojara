import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';

const COLUMNS = [
  { heading: 'Product', links: ['How it works', 'Pricing', 'Stores on Ojara', 'Log in'] },
  { heading: 'Help', links: ['Help centre', 'Contact support', 'System status', 'Seller Policy'] },
  { heading: 'Company', links: ['About Ojara', 'Careers', 'Privacy', 'Terms'] },
] as const;

/** 01.xx footer: forest, padding 56/80/32, brand blurb + three link columns + bottom row. */
export function MarketingFooter() {
  return (
    <footer className="flex flex-col gap-10 bg-forest px-4 pt-14 pb-8 md:px-20">
      <div className="flex flex-col gap-10 md:flex-row md:gap-12">
        <div className="flex max-w-[300px] flex-col gap-3">
          <Wordmark size="xl" tone="light" />
          <p className="text-sm leading-[21px] text-fg-on-dark">
            Ọjà means market. We help small businesses open theirs online.
          </p>
        </div>
        <div className="flex-1" />
        {COLUMNS.map((col) => (
          <div key={col.heading} className="flex min-w-[180px] flex-col gap-2.5">
            <span className="text-sm font-semibold text-paper">{col.heading}</span>
            {col.links.map((label) => (
              <Link key={label} href="/" className="text-sm text-fg-on-dark hover:text-paper">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-between gap-2 border-t border-paper/10 pt-5 text-ui text-fg-subtle sm:flex-row">
        <span>© {new Date().getFullYear()} Ojara Technologies Ltd · Lagos, Nigeria</span>
        <span>Payments processed by Paystack</span>
      </div>
    </footer>
  );
}
