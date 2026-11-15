import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudCheck,
  LogOut,
  MessageCircle,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { cn } from '@/lib/utils';
import { ONBOARDING_STORE } from '@/mock/onboarding';

/** The six onboarding steps from 02.04–02.09 (hrefs are visible paths on app.ojara.*). */
export const ONBOARDING_STEPS = [
  {
    title: 'Business details',
    sub: 'Name, category, location',
    /** Summary of what was entered, shown in the rail once the step is done. */
    doneSub: 'Fashion & clothing · Lagos, NGN',
    href: '/onboarding',
    eta: 'about 9 minutes left',
    nextHint: 'store address & brand',
  },
  {
    title: 'Store address & brand',
    sub: 'Name, web address, logo, colour',
    doneSub: undefined,
    href: '/onboarding/store',
    eta: 'about 7 minutes left',
    nextHint: 'add your first products',
  },
  {
    title: 'Add your first products',
    sub: 'Photos, prices and stock',
    doneSub: undefined,
    href: '/onboarding/products',
    eta: 'about 5 minutes left',
    nextHint: 'get paid with Paystack',
  },
  {
    title: 'Get paid with Paystack',
    sub: 'Connect your bank account',
    doneSub: undefined,
    href: '/onboarding/payments',
    eta: 'about 3 minutes left',
    nextHint: 'delivery & pickup',
  },
  {
    title: 'Delivery & pickup',
    sub: 'Zones, charges, pickup point',
    doneSub: undefined,
    href: '/onboarding/delivery',
    eta: 'about 2 minutes left',
    nextHint: 'preview & publish',
  },
  {
    title: 'Preview & publish',
    sub: 'Check everything, then go live',
    doneSub: undefined,
    href: '/onboarding/publish',
    eta: 'last step',
    nextHint: '',
  },
] as const;

/**
 * Onboarding layout (02.04–02.09): 380px forest rail (wordmark, headline, vertical stepper, saved
 * note), main column with progress segments + "Save & exit", form + preview column, and a sticky
 * footer whose Back / Continue link to the previous / next step.
 */
export function OnboardingShell({
  step,
  title,
  subtitle,
  preview,
  previewClassName,
  formClassName,
  children,
}: {
  /** 1-based current step. */
  step: number;
  title: string;
  subtitle: string;
  preview?: ReactNode;
  /** Width of the preview column (320 by default; 340 on step 2, 360 on step 4). */
  previewClassName?: string;
  /** Gap between form blocks (22 by default; the designs vary per step). */
  formClassName?: string;
  children: ReactNode;
}) {
  const total = ONBOARDING_STEPS.length;
  const current = ONBOARDING_STEPS[step - 1] ?? ONBOARDING_STEPS[0];
  const prev = ONBOARDING_STEPS[step - 2];
  const next = ONBOARDING_STEPS[step];
  const isLast = step === total;

  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-[380px] shrink-0 flex-col gap-9 overflow-y-auto bg-forest px-10 py-9 lg:flex">
        <Wordmark size="lg" tone="light" />
        <div className="flex flex-col gap-2.5">
          <h2 className="font-display text-[28px] leading-8 font-semibold tracking-[-0.5px] text-paper">
            Let&rsquo;s get {ONBOARDING_STORE.name} online
          </h2>
          <p className="text-sm leading-[21px] text-fg-on-dark">
            Six short steps. Most sellers publish in under 10 minutes.
          </p>
        </div>
        <ol className="flex flex-col">
          {ONBOARDING_STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? 'done' : n === step ? 'current' : 'upcoming';
            const body = (
              <>
                <span className="flex flex-col items-center self-stretch">
                  <span
                    className={cn(
                      'flex size-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      state === 'upcoming'
                        ? 'border-[1.5px] border-[#59614F] text-fg-subtle'
                        : 'bg-paper text-forest',
                    )}
                  >
                    {state === 'done' ? <Check className="size-3.5" strokeWidth={2.5} /> : n}
                  </span>
                  {n < total ? (
                    <span
                      aria-hidden
                      className={cn(
                        'w-[1.5px] flex-1',
                        state === 'done' ? 'bg-paper' : 'bg-nav-line',
                      )}
                    />
                  ) : null}
                </span>
                <span className="flex min-w-0 flex-col gap-[3px] pt-[3px]">
                  <span
                    className={cn(
                      'text-sm font-semibold group-hover:underline',
                      state === 'upcoming' ? 'text-fg-on-dark' : 'text-paper',
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="text-xs text-fg-subtle">
                    {state === 'done' && s.doneSub ? s.doneSub : s.sub}
                  </span>
                </span>
              </>
            );
            return (
              <li key={s.title} aria-current={state === 'current' ? 'step' : undefined}>
                {state === 'done' ? (
                  <Link
                    href={s.href}
                    className={cn(
                      'group flex gap-3.5 rounded-sm outline-none focus-visible:shadow-focus',
                      n < total ? 'h-[62px]' : 'h-[26px]',
                    )}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={cn('flex gap-3.5', n < total ? 'h-[62px]' : 'h-[26px]')}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        <div className="flex-1" />
        <div className="flex flex-col gap-3 rounded-lg bg-nav-tint p-4">
          <span className="flex items-center gap-2 text-ui font-medium text-paper">
            <CloudCheck className="size-4" aria-hidden /> Progress saved 12 seconds ago
          </span>
          <span className="text-xs text-fg-on-dark">
            Close this tab any time — you&rsquo;ll pick up right here.
          </span>
          <a
            href="https://wa.me/2348035550144"
            className="flex items-center gap-1.5 text-xs font-semibold text-paper hover:underline"
          >
            <MessageCircle className="size-3.5" aria-hidden /> Stuck? Chat with us on WhatsApp
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 px-4 pt-5 pb-4 md:px-14 md:py-6">
          <div className="flex flex-col gap-2">
            <span className="lg:hidden">
              <Wordmark size="md" />
            </span>
            <span className="text-ui font-medium text-fg-muted">
              Step {step} of {total} · {current.eta}
            </span>
            <span className="flex gap-1" aria-hidden>
              {ONBOARDING_STEPS.map((s, i) => (
                <span
                  key={s.title}
                  className={cn(
                    'h-1 w-11 rounded-[2px]',
                    i + 1 < step ? 'bg-forest' : i + 1 === step ? 'bg-chart-muted' : 'bg-line',
                  )}
                />
              ))}
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 self-start text-ui font-semibold whitespace-nowrap text-fg-muted hover:text-fg md:self-center"
          >
            Save &amp; exit <LogOut className="size-[15px]" aria-hidden />
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-10 px-4 pt-2 pb-8 md:px-14 md:pt-4 min-[1340px]:flex-row min-[1340px]:gap-14">
          <section className={cn('flex min-w-0 flex-1 flex-col gap-[22px]', formClassName)}>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.6px] text-fg sm:text-[30px]">
                {title}
              </h1>
              <p className="text-sm leading-5 text-fg-muted">{subtitle}</p>
            </div>
            {children}
          </section>
          {preview ? (
            <div
              className={cn(
                'mx-auto flex w-full max-w-[320px] shrink-0 flex-col min-[1340px]:mx-0',
                previewClassName,
              )}
            >
              {preview}
            </div>
          ) : null}
        </div>

        <footer className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-line bg-surface px-4 py-[18px] md:px-14">
          {prev ? (
            <Link href={prev.href} className={backClass}>
              <ArrowLeft className="size-4 text-fg-muted" aria-hidden /> Back
            </Link>
          ) : (
            <span aria-disabled className={cn(backClass, 'pointer-events-none opacity-40')}>
              <ArrowLeft className="size-4 text-fg-muted" aria-hidden /> Back
            </span>
          )}
          <div className="flex items-center gap-4">
            <span className="hidden text-ui text-fg-muted md:inline">
              {isLast
                ? 'Goes live instantly — you can unpublish any time'
                : `Next: ${current.nextHint}`}
            </span>
            {isLast ? (
              <Link href="/" className={continueClass}>
                <Rocket className="size-4" aria-hidden /> Publish my store
              </Link>
            ) : (
              <Link href={next?.href ?? '/'} className={continueClass}>
                <ArrowRight className="size-4" aria-hidden /> Continue
              </Link>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

const backClass =
  'inline-flex items-center gap-2 rounded-md border border-line bg-surface px-[13px] py-2 text-sm font-medium text-fg outline-none transition-colors hover:bg-selected focus-visible:shadow-focus';

const continueClass =
  'inline-flex items-center gap-2 rounded-md bg-forest px-[18px] py-2.5 text-sm font-semibold text-paper outline-none transition-colors hover:bg-forest/90 focus-visible:shadow-focus';
