import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { AUTH_COLLAGE, AUTH_TESTIMONIAL } from '@/mock/onboarding';

const DEFAULT_BODY =
  'Ọjà means market. Ojara gives your business a proper online store — products, orders, Paystack payments and delivery in one place.';

/**
 * Auth split screen (02.01–02.03): 620px forest brand panel on the left (wordmark, Bricolage
 * 46/600 headline, body, photo collage, testimonial) and a 420px form centred on paper.
 * Below lg the brand panel collapses to a wordmark header (mobile is not designed for auth).
 */
export function AuthShell({
  headline,
  body = DEFAULT_BODY,
  switchPrompt,
  title,
  subtitle,
  before,
  children,
}: {
  headline: string;
  body?: string;
  switchPrompt?: { question: string; label: string; href: string };
  title: string;
  subtitle?: ReactNode;
  /** Rendered above the title (e.g. the reset screen's "Use a different number" back link). */
  before?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="hidden w-[620px] shrink-0 flex-col gap-9 bg-forest px-14 py-10 lg:flex">
        <Wordmark size="xl" tone="light" />
        <div className="flex-1" />
        <h2 className="font-display text-[46px] leading-[48px] font-semibold tracking-[-1.2px] text-paper">
          {headline}
        </h2>
        <p className="max-w-[460px] text-base leading-[25px] text-fg-on-dark">{body}</p>
        <div className="flex h-[200px] shrink-0 gap-3">
          {AUTH_COLLAGE.map((tile) => (
            <div
              key={tile.src}
              className="relative flex-1 overflow-hidden rounded-lg bg-nav-tint"
              style={{ height: tile.height }}
            >
              <Image src={tile.src} alt={tile.alt} fill sizes="118px" className="object-cover" />
            </div>
          ))}
        </div>
        <figure className="flex flex-col gap-3.5 rounded-[14px] bg-nav-tint p-5">
          <blockquote className="text-[15px] leading-[23px] text-paper">
            &ldquo;{AUTH_TESTIMONIAL.quote}&rdquo;
          </blockquote>
          <figcaption className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-full bg-store-accent text-ui font-bold text-store-accent-ink"
            >
              {AUTH_TESTIMONIAL.initial}
            </span>
            <span className="flex flex-col">
              <span className="text-ui font-semibold text-paper">{AUTH_TESTIMONIAL.name}</span>
              <span className="text-xs text-fg-subtle">{AUTH_TESTIMONIAL.business}</span>
            </span>
          </figcaption>
        </figure>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col px-4 py-6 sm:px-14 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <span className="lg:hidden">
            <Wordmark size="md" />
          </span>
          {switchPrompt ? (
            <p className="ml-auto flex flex-wrap justify-end gap-x-1.5 text-right text-ui text-fg-muted">
              <span>{switchPrompt.question}</span>
              <Link href={switchPrompt.href} className="font-semibold text-fg hover:underline">
                {switchPrompt.label}
              </Link>
            </p>
          ) : null}
        </div>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[420px] flex-col gap-[18px]">
            {before}
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[32px] leading-tight font-semibold tracking-[-0.6px] text-fg">
                {title}
              </h1>
              {subtitle ? <p className="text-sm leading-5 text-fg-muted">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </main>
        <footer className="flex items-center justify-between gap-4 text-xs">
          <span className="text-fg-subtle">© {new Date().getFullYear()} Ojara</span>
          <span className="flex gap-4 text-fg-muted">
            <a href="https://ojara.store/privacy" className="hover:text-fg">
              Privacy
            </a>
            <a href="https://ojara.store/terms" className="hover:text-fg">
              Terms
            </a>
            <a href="https://ojara.store/help" className="hover:text-fg">
              Help
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}

/** "or" divider between the primary submit and the alternate button. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs text-fg-subtle">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Alternate auth button (SMS OTP / Google): surface, 1px border, radius 10, 46 high, 14/600. */
export const altButtonClass =
  'flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-line bg-surface text-sm font-semibold text-fg transition-colors hover:bg-selected focus-visible:shadow-focus outline-none';
