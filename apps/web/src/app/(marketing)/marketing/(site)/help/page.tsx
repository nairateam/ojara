import { ChevronRight, FileText, Mail, MessageCircle, Search } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { GUTTER, MarketingIcon } from '@/components/marketing/primitives';
import { DisplayHeading, SiteEyebrow, SiteHero } from '@/components/marketing/site-shell';
import { cn } from '@/lib/utils';
import {
  HELP_TOPICS,
  PAYMENTS_TOPIC_ARTICLES,
  POPULAR_ARTICLES,
  SHOPPER_HELP,
  SUPPORT,
} from '@/mock/marketing';

export const metadata: Metadata = { title: 'Help centre' };

type SearchParams = Promise<{ q?: string }>;

const ALL_ARTICLES = [
  ...POPULAR_ARTICLES,
  ...PAYMENTS_TOPIC_ARTICLES.filter((a) => !POPULAR_ARTICLES.some((p) => p.slug === a.slug)),
];

/** Sample-data stand-in for topic pages: each topic card opens a search for its keyword. */
const TOPIC_SEARCH: Record<string, string> = {
  'getting-started': 'store',
  'products-and-stock': 'product',
  'orders-and-delivery': 'delivery',
  'plans-and-billing': 'Paystack',
  'domains-and-branding': 'domain',
};

/**
 * 01.05 Help Centre (no premium design of its own): the search sits in the site hero card so the
 * page gets the shared nav. Search is a plain GET form filtering the sample article list.
 */
export default async function HelpCentrePage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '' } = await searchParams;
  const needle = q.trim().toLowerCase();
  const results = needle
    ? ALL_ARTICLES.filter((a) => a.title.toLowerCase().includes(needle))
    : POPULAR_ARTICLES;

  return (
    <>
      <SiteHero>
        <section
          aria-label="Help centre"
          className="flex flex-col items-center gap-5 px-5 pt-12 pb-10 md:gap-6 md:px-10 md:pt-16 md:pb-14"
        >
          <SiteEyebrow tone="light">Help centre</SiteEyebrow>
          <DisplayHeading
            as="h1"
            size="md"
            tone="light"
            line1="How can we help?"
            className="items-center text-center"
          />
          <form action="/help" method="get" role="search" className="w-full max-w-[620px]">
            <label className="flex items-center gap-3 rounded-full bg-surface py-2 pr-2 pl-5 text-forest focus-within:shadow-focus">
              <Search aria-hidden className="size-[18px] shrink-0 text-fg-muted" />
              <span className="sr-only">Search help articles</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search for “payouts”, “delivery zones”, “custom domain”…"
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-fg outline-none placeholder:text-fg-subtle"
              />
              <button
                type="submit"
                className="site-btn rounded-full bg-forest px-4 py-[13px] text-[15px] font-semibold text-paper hover:opacity-95 sm:px-[22px]"
              >
                Search
              </button>
            </label>
          </form>
          <nav
            aria-label="Audience"
            className="flex gap-0.5 rounded-full bg-paper/12 p-[5px] text-sm font-medium"
          >
            <Link
              href="/help"
              aria-current="page"
              className="rounded-full bg-paper/16 px-4 py-2 text-paper"
            >
              I sell on Ojara
            </Link>
            <a href="#shoppers" className="rounded-full px-4 py-2 text-paper hover:bg-paper/8">
              I bought from a store
            </a>
          </nav>
        </section>
      </SiteHero>

      {!needle && (
        <section
          aria-labelledby="topics-heading"
          className={cn('flex flex-col gap-5 pt-12 pb-10 md:pt-16', GUTTER)}
        >
          <h2
            id="topics-heading"
            className="font-display text-[26px] font-semibold tracking-[-0.6px] md:text-[28px]"
          >
            Browse by topic
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {HELP_TOPICS.map((t) => (
              <li key={t.slug}>
                <Link
                  href={
                    t.slug === 'payments-and-payouts'
                      ? '/help/how-paystack-payouts-work'
                      : `/help?q=${encodeURIComponent(TOPIC_SEARCH[t.slug] ?? t.title)}`
                  }
                  className="flex h-full gap-4 rounded-[18px] border border-line bg-surface p-6 transition-colors hover:bg-selected"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted">
                    <MarketingIcon name={t.icon} className="size-5" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-[17px] font-semibold">{t.title}</span>
                    <span className="text-sm text-fg-muted">{t.description}</span>
                    <span className="text-ui font-semibold">{t.articleCount} articles</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        className={cn(
          'flex flex-col gap-12 pb-16 lg:flex-row lg:items-start',
          needle ? 'pt-12' : 'pt-6',
          GUTTER,
        )}
      >
        <div className="flex flex-1 flex-col">
          <h2
            id="popular-heading"
            className="mb-4 font-display text-[26px] font-semibold tracking-[-0.6px] md:text-[28px]"
          >
            {needle ? `Results for “${q.trim()}”` : 'Most read this week'}
          </h2>
          {results.length === 0 ? (
            <p className="border-t border-line py-4 text-[15px] text-fg-muted">
              Nothing matches that yet. Try “payouts” or “delivery”, or{' '}
              <Link href="/help" className="font-semibold text-fg underline">
                browse all topics
              </Link>
              .
            </p>
          ) : (
            <ul aria-labelledby="popular-heading">
              {results.map((a) => (
                <li key={a.slug} className="border-t border-line">
                  <Link
                    href={`/help/${a.slug}`}
                    className="group flex items-center gap-3 py-4 text-base font-medium"
                  >
                    <FileText aria-hidden className="size-[18px] shrink-0 text-fg-muted" />
                    <span className="flex-1 group-hover:underline">{a.title}</span>
                    <ChevronRight aria-hidden className="size-[18px] shrink-0 text-fg-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="flex flex-col gap-5 lg:w-[440px] lg:shrink-0">
          <section
            id="shoppers"
            aria-labelledby="shoppers-heading"
            className="flex scroll-mt-6 flex-col gap-3.5 rounded-[18px] bg-surface-muted p-6"
          >
            <h2 id="shoppers-heading" className="font-display text-[22px] font-semibold">
              Bought from an Ojara store?
            </h2>
            <p className="text-sm leading-[21px] text-fg-lead">
              Each store runs its own orders and delivery. Here’s how to get help fast.
            </p>
            <ul className="flex flex-col gap-3.5">
              {SHOPPER_HELP.map((o) => (
                <li key={o.title} className="flex items-center gap-3 rounded-lg bg-paper/70 p-3.5">
                  <MarketingIcon name={o.icon} className="size-[18px] shrink-0" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{o.title}</span>
                    <span className="text-xs text-fg-lead">{o.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section
            id="contact"
            aria-labelledby="contact-heading"
            className="flex scroll-mt-6 flex-col gap-3 rounded-[18px] border border-line bg-surface p-6"
          >
            <h2 id="contact-heading" className="text-[17px] font-semibold">
              Still stuck? Talk to us
            </h2>
            <div className="flex gap-2.5">
              <a
                href={SUPPORT.whatsapp}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-forest py-[11px] text-sm font-semibold text-paper hover:bg-forest/90"
              >
                <MessageCircle aria-hidden className="size-4" />
                WhatsApp
              </a>
              <a
                href={SUPPORT.email}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-line bg-surface py-[11px] text-sm font-semibold hover:bg-selected"
              >
                <Mail aria-hidden className="size-4" />
                Email
              </a>
            </div>
            <p className="flex items-center gap-2 text-ui text-fg-muted">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-success" />
              {SUPPORT.status}
            </p>
          </section>
        </aside>
      </section>
    </>
  );
}
