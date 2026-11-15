import { Menu } from 'lucide-react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';

export const MARKETING_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/stores', label: 'Stores on Ojara' },
  { href: '/help', label: 'Help' },
] as const;

/** 01.xx header: transparent on paper, padding 20/80, centred links, "Log in" + "Start free". */
export function MarketingHeader({ appOrigin }: { appOrigin: string }) {
  return (
    <header className="flex items-center justify-between px-4 pt-2 pb-3 md:px-20 md:py-5">
      <Link href="/" aria-label="Ojara home">
        <span className="hidden md:inline">
          <Wordmark size="lg" />
        </span>
        <span className="md:hidden">
          <Wordmark size="md" />
        </span>
      </Link>
      <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
        {MARKETING_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm font-medium text-fg-muted hover:text-fg">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 md:gap-4">
        <a href={`${appOrigin}/login`} className="hidden text-sm font-semibold md:inline">
          Log in
        </a>
        <Button asChild size="sm" className="md:h-10 md:px-[18px] md:text-sm">
          <a href={`${appOrigin}/signup`}>Start free</a>
        </Button>
        <button type="button" className="lg:hidden" aria-label="Menu">
          <Menu className="size-[22px]" />
        </button>
      </div>
    </header>
  );
}
