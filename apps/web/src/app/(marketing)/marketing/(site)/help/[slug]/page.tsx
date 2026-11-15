import { formatKobo } from '@ojara/shared';
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Landmark,
  MessageCircle,
  Receipt,
  ShoppingBag,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { HelpfulFeedback } from '@/components/marketing/helpful-feedback';
import { cn } from '@/lib/utils';
import {
  HELP_ARTICLES,
  type HelpArticle,
  PAYMENTS_TOPIC_ARTICLES,
  POPULAR_ARTICLES,
  SUPPORT,
} from '@/mock/marketing';

type Params = Promise<{ slug: string }>;

/** Full sample article, or a stub for listed articles that have no body in the sample data. */
function findArticle(slug: string): HelpArticle | null {
  const full = HELP_ARTICLES.find((a) => a.slug === slug);
  if (full) return full;
  const link = [...PAYMENTS_TOPIC_ARTICLES, ...POPULAR_ARTICLES].find((a) => a.slug === slug);
  if (!link) return null;
  return {
    slug,
    topic: PAYMENTS_TOPIC_ARTICLES.some((a) => a.slug === slug)
      ? 'Payments & payouts'
      : 'Popular articles',
    title: link.title,
    meta: '2 min read · Updated 12 November 2026',
    lead: 'We’re still writing this article. Message us on WhatsApp and we’ll walk you through it.',
    sections: [],
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const article = findArticle((await params).slug);
  return { title: article ? article.title : 'Help centre' };
}

/** 01.06 Help Article. */
export default async function HelpArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  const firstSection = article.sections[0]?.id;

  return (
    <div className="flex flex-col gap-10 px-5 pt-8 pb-16 md:px-10 md:pt-10 lg:flex-row lg:gap-12 xl:gap-16 xl:px-20 xl:pb-[88px]">
      <nav aria-label="Help topic" className="flex flex-col gap-1 lg:w-[260px] lg:shrink-0">
        <Link
          href="/help"
          className="flex w-fit items-center gap-1.5 pb-3.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Help centre
        </Link>
        <p className="text-2xs font-bold tracking-[1.2px] text-fg-muted uppercase">
          {article.topic}
        </p>
        <ul className="hidden flex-col gap-1 lg:flex">
          {PAYMENTS_TOPIC_ARTICLES.map((a) => {
            const active = a.slug === slug;
            return (
              <li key={a.slug}>
                <Link
                  href={`/help/${a.slug}`}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block rounded-md px-3 py-[9px] text-sm',
                    active
                      ? 'bg-surface-muted font-semibold text-fg'
                      : 'text-fg-muted hover:bg-selected hover:text-fg',
                  )}
                >
                  {a.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <article className="flex min-w-0 flex-1 flex-col gap-5">
        <h1 className="font-display text-[34px] leading-tight font-semibold tracking-[-1px] md:text-[44px] md:tracking-[-1.2px]">
          {article.title}
        </h1>
        <p className="text-sm text-fg-muted">{article.meta}</p>
        <p className="text-[17px] leading-[27px] md:text-[19px] md:leading-[29px]">
          {article.lead}
        </p>

        {article.flow && (
          <div className="flex flex-col items-stretch gap-3 py-2 sm:flex-row sm:items-center">
            <FlowStep
              icon={<ShoppingBag className="size-[18px]" />}
              label="Customer pays"
              value={formatKobo(article.flow.paidKobo)}
            />
            <ArrowRight
              aria-hidden
              className="size-5 shrink-0 rotate-90 self-center text-fg-muted sm:rotate-0"
            />
            <FlowStep
              icon={<Receipt className="size-[18px]" />}
              label="Paystack fee"
              value={`− ${formatKobo(article.flow.feeKobo)}`}
              danger
            />
            <ArrowRight
              aria-hidden
              className="size-5 shrink-0 rotate-90 self-center text-fg-muted sm:rotate-0"
            />
            <FlowStep
              icon={<Landmark className="size-[18px]" />}
              label="Your bank"
              value={formatKobo(article.flow.paidKobo - article.flow.feeKobo)}
              muted
            />
          </div>
        )}

        {article.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-h`}
            className="flex scroll-mt-6 flex-col gap-5"
          >
            <h2
              id={`${section.id}-h`}
              className="font-display text-2xl font-semibold tracking-[-0.4px]"
            >
              {section.heading}
            </h2>
            {section.blocks.map((block) =>
              block.type === 'p' ? (
                <p key={block.text} className="text-base leading-[26px] text-[#454D40]">
                  {block.text}
                </p>
              ) : (
                <div
                  key={block.text}
                  className="flex gap-3.5 rounded-[14px] bg-surface-muted p-[18px] text-[15px] leading-[23px]"
                >
                  <Info aria-hidden className="mt-0.5 size-5 shrink-0" />
                  <p>{block.text}</p>
                </div>
              ),
            )}
          </section>
        ))}

        <HelpfulFeedback />
      </article>

      <aside className="flex flex-col gap-4 lg:w-[280px] lg:shrink-0">
        {article.sections.length > 0 && (
          <nav
            aria-label="On this page"
            className="hidden flex-col gap-2.5 border-l-2 border-line pl-4 lg:flex"
          >
            <p className="text-2xs font-bold tracking-[1.2px] text-fg-subtle uppercase">
              On this page
            </p>
            {article.sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  'text-sm hover:text-fg',
                  s.id === firstSection ? 'font-semibold text-fg' : 'text-fg-muted',
                )}
              >
                {s.heading}
              </a>
            ))}
          </nav>
        )}
        <div className="flex flex-col gap-2.5 rounded-2xl bg-forest p-5">
          <h2 className="text-base font-semibold text-paper">Payout missing?</h2>
          <p className="text-sm leading-[21px] text-fg-on-dark">
            Send us the order number and we’ll check with Paystack.
          </p>
          <a
            href={SUPPORT.whatsapp}
            className="flex items-center justify-center gap-2 rounded-[10px] bg-surface-muted py-2.5 text-sm font-semibold text-fg hover:bg-paper"
          >
            <MessageCircle aria-hidden className="size-[15px]" />
            WhatsApp support
          </a>
        </div>
      </aside>
    </div>
  );
}

function FlowStep({
  icon,
  label,
  value,
  danger,
  muted,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  danger?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-1.5 rounded-[14px] p-[18px]',
        muted ? 'bg-surface-muted' : 'border border-line bg-surface',
      )}
    >
      <span aria-hidden>{icon}</span>
      <span className="text-ui text-fg-muted">{label}</span>
      <span
        className={cn('font-display text-2xl font-semibold', danger ? 'text-danger' : 'text-fg')}
      >
        {value}
      </span>
    </div>
  );
}
