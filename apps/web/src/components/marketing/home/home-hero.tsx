import { formatKobo } from '@ojara/shared';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { HERO_ORDER, HERO_PAYOUT_KOBO } from '@/mock/marketing';
import { HERO_BENEFITS, HERO_PAYOUT } from '@/mock/site-home';
import { DisplayHeading, SiteButton, SiteHero } from '../site-shell';
import { HeroBenefits } from './hero-benefits';

/**
 * 08 Home › Hero: full-bleed shop photo under a forest wash, headline bottom-left, benefit list
 * and two floating cards (new paid order, next payout) on the right. The design's "Watch a
 * 60-second tour" button is left out until there is a video.
 */
export function HomeHero({ appOrigin }: { appOrigin: string }) {
  return (
    <SiteHero className="lg:min-h-[min(920px,calc(100svh-14px))]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image
          src="/mock/generated-14.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#262B23]/65" />
        <div className="absolute inset-0 bg-[linear-gradient(-90deg,#262B23F2_0%,#262B2366_60%,#262B2300_100%)]" />
      </div>

      <div className="flex flex-1 flex-col justify-end gap-12 px-5 pt-24 pb-8 md:px-10 md:pt-40 md:pb-10 lg:flex-row lg:items-end lg:justify-between lg:pt-10 xl:pr-7 xl:pl-16">
        <div className="flex max-w-[760px] flex-col items-start gap-6 md:gap-[30px]">
          <p className="inline-flex items-center gap-2.5 rounded-full bg-paper/12 py-[7px] pr-3.5 pl-2 text-[13px] text-paper md:text-sm">
            <span className="rounded-full bg-paper px-2.5 py-[3px] text-xs font-bold text-forest">
              New
            </span>
            Bring your own .com on Starter
          </p>
          <DisplayHeading
            as="h1"
            size="xl"
            tone="light"
            accentClassName="text-paper"
            line1="Your market stall,"
            line2="beautifully online."
          />
          <p className="max-w-[540px] text-base text-paper/80 md:text-[19px]/[29px]">
            Ojara gives Nigerian businesses a store worth sharing — with Paystack payments, orders
            in one place and stock that keeps itself honest.
          </p>
          <SiteButton
            href={`${appOrigin}/signup`}
            variant="light"
            size="lg"
            className="md:px-[26px]"
          >
            Open your store — free <ArrowUpRight aria-hidden />
          </SiteButton>
        </div>

        <div className="hidden w-[360px] shrink-0 flex-col gap-[clamp(28px,9svh,112px)] lg:mb-[clamp(0px,4svh,50px)] lg:flex">
          <HeroBenefits items={HERO_BENEFITS} />

          <div aria-hidden className="flex flex-col items-end gap-[clamp(16px,5svh,58px)]">
            <div className="site-float flex w-full items-center gap-3 rounded-[20px] bg-surface/92 p-4 text-forest">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-forest text-paper">
                <ShoppingBag className="size-[18px]" />
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{HERO_ORDER.title}</span>
                <span className="text-[13px] text-fg-muted">
                  {HERO_ORDER.customer} · {HERO_ORDER.area} · {HERO_ORDER.when}
                </span>
              </span>
              <span className="font-display text-lg font-semibold">
                {formatKobo(HERO_ORDER.amountKobo)}
              </span>
            </div>

            <div className="site-float flex w-[270px] flex-col gap-2.5 rounded-[20px] bg-surface/92 p-4 text-forest [animation-delay:-3s]">
              <span className="flex justify-between text-[13px] text-fg-muted">
                <span>{HERO_PAYOUT.label}</span>
                <span>{HERO_PAYOUT.when}</span>
              </span>
              <span className="font-display text-[30px] leading-none font-semibold tracking-[-1px]">
                {formatKobo(HERO_PAYOUT_KOBO)}
              </span>
              <span className="flex h-9 items-end gap-1">
                {HERO_PAYOUT.bars.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: h }}
                    className={cn(
                      'flex-1 rounded-[3px]',
                      i === HERO_PAYOUT.bars.length - 1 ? 'bg-forest' : 'bg-line',
                    )}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SiteHero>
  );
}
