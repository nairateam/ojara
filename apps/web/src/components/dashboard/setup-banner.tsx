import { ONBOARDING_STEP_COUNT } from '@ojara/shared';
import { ArrowRight, PartyPopper, Rocket } from 'lucide-react';
import Link from 'next/link';
import { ONBOARDING_PATHS } from '@/lib/auth/guards';

/**
 * Dashboard home banner: "finish setting up" while onboarding is incomplete (Save & exit brings
 * merchants here), or a one-off confirmation right after publishing.
 */
export function SetupBanner({
  onboardingStep,
  completed,
  justPublished,
  storeUrl,
}: {
  onboardingStep: number;
  completed: boolean;
  justPublished: boolean;
  storeUrl: string;
}) {
  if (justPublished && completed) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-success-soft px-4 py-3.5"
      >
        <PartyPopper className="size-5 shrink-0 text-success" aria-hidden />
        <p className="min-w-0 flex-1 text-ui text-fg">
          <span className="font-semibold">Your store is live.</span> Share your link so customers
          can find you.
        </p>
        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-ui font-semibold text-fg hover:underline"
        >
          View store <ArrowRight className="size-4" aria-hidden />
        </a>
      </div>
    );
  }
  if (completed) return null;

  const step = Math.min(Math.max(onboardingStep, 1), ONBOARDING_STEP_COUNT);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3.5">
      <Rocket className="size-5 shrink-0 text-fg" aria-hidden />
      <p className="min-w-0 flex-1 text-ui text-fg">
        <span className="font-semibold">Finish setting up your store.</span>{' '}
        <span className="text-fg-muted">
          Step {step} of {ONBOARDING_STEP_COUNT} · your store isn’t public yet.
        </span>
      </p>
      <Link
        href={ONBOARDING_PATHS[step - 1] ?? '/onboarding'}
        className="inline-flex items-center gap-1.5 rounded-md bg-forest px-3.5 py-2 text-ui font-semibold text-paper hover:bg-forest/90"
      >
        Continue setup <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
