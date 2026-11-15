import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { MarketingMobileMenu, MarketingNavLinks } from './marketing-nav';

export { MARKETING_LINKS } from './marketing-nav';

/**
 * 01.xx header: transparent on paper, padding 20/80, centred links, "Log in" + "Start free".
 * Mobile (01.07): padding 8/16/12, 24px wordmark, small "Start free" and a menu button.
 */
export function MarketingHeader({ appOrigin }: { appOrigin: string }) {
  return (
    <header className="relative flex items-center justify-between px-4 pt-2 pb-3 md:px-10 md:py-5 xl:px-20">
      <Link href="/" aria-label="Ojara home" className="flex-1">
        <span className="hidden md:inline">
          <Wordmark size="lg" />
        </span>
        <span className="md:hidden">
          <Wordmark size="md" />
        </span>
      </Link>
      <MarketingNavLinks />
      <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
        <a
          href={`${appOrigin}/login`}
          className="hidden text-sm font-semibold text-fg hover:text-fg-muted md:inline"
        >
          Log in
        </a>
        <a
          href={`${appOrigin}/signup`}
          className="rounded-md bg-forest px-3.5 py-2 text-ui font-semibold text-paper transition-colors hover:bg-forest/90 md:px-[18px] md:py-2.5 md:text-sm"
        >
          Start free
        </a>
        <MarketingMobileMenu loginHref={`${appOrigin}/login`} />
      </div>
    </header>
  );
}
