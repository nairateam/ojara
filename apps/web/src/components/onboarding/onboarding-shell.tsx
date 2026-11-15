import { ArrowRight, Check, CloudCheck, LogOut, MessageCircle, Rocket } from 'lucide-react';
import type { ReactNode } from 'react';
import { Wordmark } from '@/components/brand/wordmark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** The six onboarding steps from 02.04–02.09. */
export const ONBOARDING_STEPS = [
  { title: 'Business details', sub: 'Name, category, location' },
  { title: 'Store address & brand', sub: 'Name, web address, logo, colour' },
  { title: 'Add your first products', sub: 'Photos, prices and stock' },
  { title: 'Get paid with Paystack', sub: 'Connect your bank account' },
  { title: 'Delivery & pickup', sub: 'Zones, charges, pickup point' },
  { title: 'Preview & publish', sub: 'Check everything, then go live' },
] as const;

/**
 * Onboarding layout: 380px forest rail (wordmark, headline, vertical stepper, saved note),
 * main column with progress segments + "Save & exit", form + phone preview, sticky footer.
 */
export function OnboardingShell({
  step,
  storeName,
  title,
  subtitle,
  preview,
  children,
}: {
  /** 1-based current step. */
  step: number;
  storeName: string;
  title: string;
  subtitle: string;
  preview?: ReactNode;
  children: ReactNode;
}) {
  const total = ONBOARDING_STEPS.length;
  const next = ONBOARDING_STEPS[step];
  const isLast = step === total;

  return (
    <div className="flex min-h-dvh bg-paper">
      <aside className="sticky top-0 hidden h-dvh w-[380px] shrink-0 flex-col gap-9 bg-forest px-10 py-9 lg:flex">
        <Wordmark size="lg" tone="light" />
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[28px] leading-8 font-semibold tracking-display text-paper">
            Let&apos;s get {storeName} online
          </h2>
          <p className="text-sm leading-[21px] text-fg-on-dark">
            Six short steps. Most sellers publish in under 10 minutes.
          </p>
        </div>
        <ol className="flex flex-col">
          {ONBOARDING_STEPS.map((s, i) => {
            const n = i + 1;
            const state = n < step ? 'done' : n === step ? 'current' : 'upcoming';
            return (
              <li key={s.title} className="relative flex gap-3.5 pb-6 last:pb-0">
                {n < total ? (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-[26px] left-[12.25px] h-[calc(100%-26px)] w-[1.5px]',
                      state === 'done' ? 'bg-paper/60' : 'bg-nav-line',
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    'relative z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    state === 'upcoming'
                      ? 'border-[1.5px] border-[#59614f] text-fg-subtle'
                      : 'bg-paper text-forest',
                  )}
                >
                  {state === 'done' ? <Check className="size-3.5" aria-hidden /> : n}
                </span>
                <span className="flex flex-col gap-0.5 pt-0.5">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      state === 'current' ? 'text-paper' : 'text-fg-on-dark',
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="text-xs text-fg-subtle">{s.sub}</span>
                </span>
              </li>
            );
          })}
        </ol>
        <div className="flex-1" />
        <div className="flex flex-col gap-2 rounded-lg bg-nav-tint p-4 text-xs">
          <span className="flex items-center gap-2 font-semibold text-paper">
            <CloudCheck className="size-4" aria-hidden /> Progress saved
          </span>
          <span className="text-fg-on-dark">
            Close this tab any time — you&apos;ll pick up right here.
          </span>
          <span className="flex items-center gap-2 font-semibold text-paper">
            <MessageCircle className="size-4" aria-hidden /> Stuck? Chat with us on WhatsApp
          </span>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 px-4 py-6 md:px-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-ui font-medium text-fg-muted">
              Step {step} of {total}
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
          <a href="/" className="flex items-center gap-1.5 text-ui font-semibold">
            Save &amp; exit <LogOut className="size-[15px]" aria-hidden />
          </a>
        </div>

        <div className="flex flex-1 gap-14 px-4 pt-4 pb-8 md:px-14">
          <section className="flex max-w-[560px] min-w-0 flex-1 flex-col gap-[22px]">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-display text-[30px] leading-tight font-semibold tracking-[-0.6px]">
                {title}
              </h1>
              <p className="text-sm text-fg-muted">{subtitle}</p>
            </div>
            {children}
          </section>
          {preview ? <div className="hidden w-[300px] shrink-0 xl:block">{preview}</div> : null}
        </div>

        <footer className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-line bg-surface px-4 py-[18px] md:px-14">
          <Button
            variant="secondary"
            className={step === 1 ? 'opacity-40' : undefined}
            disabled={step === 1}
          >
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="hidden text-ui text-fg-muted sm:inline">
              {isLast
                ? 'Goes live instantly — you can unpublish any time'
                : `Next: ${next?.title.toLowerCase() ?? ''}`}
            </span>
            <Button>
              {isLast ? (
                <>
                  <Rocket /> Publish my store
                </>
              ) : (
                <>
                  Continue <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/** Phone mock used for live previews (10px forest bezel, radius ~40, mock shadow). */
export function PhonePreview({ caption, children }: { caption: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="flex items-center gap-2 text-xs font-medium text-fg-muted">
        <span className="size-2 rounded-full bg-success" aria-hidden /> {caption}
      </span>
      <div className="aspect-[9/19] overflow-hidden rounded-[40px] border-[10px] border-forest bg-store-page shadow-mock">
        {children ?? (
          <div className="flex flex-col gap-3 p-4" aria-hidden>
            <div className="h-6 w-2/3 rounded-xs bg-surface-muted" />
            <div className="h-32 rounded-lg bg-surface-muted" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 rounded-md bg-surface-muted" />
              <div className="h-24 rounded-md bg-surface-muted" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
