import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';

/**
 * Auth split screen (02.01–02.03): 620px forest brand panel on the left (wordmark, Bricolage
 * 46/600 headline, body, photo collage, testimonial) and a 420px form centred on paper.
 * Below lg the brand panel collapses to a wordmark header (mobile not designed for auth).
 *
 * The collage uses neutral tiles: the design's photos are mock product photography, not brand
 * assets (see docs/DESIGN_NOTES.md).
 */
export function AuthShell({
  headline,
  body,
  switchPrompt,
  title,
  subtitle,
  children,
}: {
  headline: string;
  body: string;
  switchPrompt?: { question: string; label: string; href: string };
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="hidden w-[620px] shrink-0 flex-col gap-9 bg-forest px-14 py-10 lg:flex">
        <Wordmark size="xl" tone="light" />
        <div className="flex-1" />
        <h2 className="font-display text-[46px] leading-[48px] font-semibold tracking-[-1.2px] text-paper">{headline}</h2>
        <p className="max-w-[460px] text-base leading-[25px] text-fg-on-dark">{body}</p>
        <div className="flex items-end gap-3" aria-hidden>
          {[200, 170, 200, 170].map((h, i) => (
            <div key={i} className="flex-1 rounded-lg bg-nav-tint" style={{ height: h }} />
          ))}
        </div>
        <figure className="flex flex-col gap-3 rounded-[14px] bg-nav-tint p-5">
          <blockquote className="text-card leading-[23px] text-paper">
            &ldquo;I stopped copying prices into DMs. Customers pay on my store and I just pack.&rdquo;
          </blockquote>
          <figcaption className="flex items-center gap-2.5">
            <span className="size-8 rounded-full bg-store-accent" />
            <span className="flex flex-col">
              <span className="text-ui font-semibold text-paper">A seller on Ojara</span>
              <span className="text-xs text-fg-subtle">Lagos</span>
            </span>
          </figcaption>
        </figure>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-14 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <span className="lg:hidden">
            <Wordmark size="md" />
          </span>
          {switchPrompt ? (
            <p className="ml-auto text-ui text-fg-muted">
              {switchPrompt.question}{' '}
              <Link href={switchPrompt.href} className="font-semibold text-fg">
                {switchPrompt.label}
              </Link>
            </p>
          ) : null}
        </div>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="flex w-full max-w-[420px] flex-col gap-[18px]">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[32px] leading-tight font-semibold tracking-[-0.6px]">{title}</h1>
              {subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </main>
        <footer className="flex items-center justify-between text-xs">
          <span className="text-fg-subtle">© {new Date().getFullYear()} Ojara</span>
          <span className="flex gap-3 text-fg-muted">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Help</span>
          </span>
        </footer>
      </div>
    </div>
  );
}
