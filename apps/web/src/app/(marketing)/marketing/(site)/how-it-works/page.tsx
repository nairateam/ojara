import type { Metadata } from 'next';
import Image from 'next/image';
import {
  Eyebrow,
  FaqList,
  GUTTER,
  MarketingIcon,
  PhoneCtaBand,
} from '@/components/marketing/primitives';
import { platformOrigin } from '@/lib/platform-url';
import { cn } from '@/lib/utils';
import { DAY_ON_OJARA, HOW_IT_WORKS_FAQ, ONBOARDING_STEPS } from '@/mock/marketing';

export const metadata: Metadata = { title: 'How it works' };

/** Cards alternate surface / muted in a checkerboard (2 and 5 are muted), as drawn. */
const MUTED_STEPS = new Set([1, 4]);

/** 01.02 How It Works. */
export default async function HowItWorksPage() {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <>
      <section
        aria-labelledby="hiw-heading"
        className={cn(
          'flex flex-col items-center gap-[18px] pt-10 pb-10 text-center md:pt-[72px] md:pb-14',
          GUTTER,
        )}
      >
        <Eyebrow>How it works</Eyebrow>
        <h1
          id="hiw-heading"
          className="max-w-[860px] font-display text-[38px] leading-[40px] font-semibold tracking-[-1.2px] md:text-[58px] md:leading-[59px] md:tracking-[-1.8px]"
        >
          Six steps. About ten minutes. One real store.
        </h1>
        <p className="max-w-[600px] text-base leading-6 text-fg-muted md:text-lg md:leading-[27px]">
          Have your product photos, prices and bank details ready. You can stop at any step — Ojara
          saves as you go.
        </p>
      </section>

      <section aria-label="Steps" className={cn('pb-16 md:pb-24', GUTTER)}>
        <ol className="grid gap-4 md:grid-cols-2 md:gap-6">
          {ONBOARDING_STEPS.map((step, i) => {
            const muted = MUTED_STEPS.has(i);
            return (
              <li
                key={step.title}
                className={cn(
                  'flex flex-col gap-3 overflow-hidden rounded-[22px] px-5 pt-6 md:px-7 md:pt-7',
                  muted ? 'bg-surface-muted' : 'border border-line bg-surface',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-surface-muted">
                    {i + 1}
                  </span>
                  <h2 className="font-display text-xl font-semibold tracking-[-0.5px] md:text-2xl">
                    {step.title}
                  </h2>
                </div>
                <p
                  className={cn(
                    'text-[15px] leading-[23px]',
                    muted ? 'text-fg-lead' : 'text-fg-muted',
                  )}
                >
                  {step.body}
                </p>
                <div className="relative mt-2 h-[220px] overflow-hidden rounded-t-lg shadow-[0_-4px_20px_#333A2F14] ring-1 ring-forest/15 md:h-[300px]">
                  <Image
                    src={step.screen}
                    alt={`Ojara onboarding: ${step.title}`}
                    width={1440}
                    height={1024}
                    sizes="(min-width: 768px) 840px, 560px"
                    className="absolute top-0 left-[-40.5%] w-[143.8%] max-w-none"
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-labelledby="day-heading"
        className={cn('flex flex-col gap-10 bg-forest py-16 md:py-[88px]', GUTTER)}
      >
        <div className="flex flex-col gap-3">
          <Eyebrow className="text-surface-muted">After you launch</Eyebrow>
          <h2
            id="day-heading"
            className="font-display text-[34px] leading-tight font-semibold tracking-[-1px] text-paper md:text-[44px] md:tracking-[-1.2px]"
          >
            Your day on Ojara
          </h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {DAY_ON_OJARA.map((m) => (
            <li
              key={m.time}
              className="flex flex-col gap-3 rounded-[18px] border border-paper/10 bg-paper/5 p-[22px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-ui font-bold text-surface-muted">{m.time}</span>
                <MarketingIcon name={m.icon} className="size-5 text-surface-muted" />
              </div>
              <h3 className="text-lg font-semibold text-paper">{m.title}</h3>
              <p className="text-sm leading-[21px] text-fg-on-dark">{m.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="faq-heading"
        className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-10 md:py-[88px] xl:px-[120px]"
      >
        <h2
          id="faq-heading"
          className="mb-2 font-display text-[30px] font-semibold tracking-[-0.8px] md:text-4xl"
        >
          Before you start
        </h2>
        <FaqList items={HOW_IT_WORKS_FAQ} collapsible />
      </section>

      <PhoneCtaBand appOrigin={appOrigin} title="Your market is online. Take your stall there." />
    </>
  );
}
