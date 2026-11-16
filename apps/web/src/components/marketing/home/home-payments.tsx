import { Check, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { PAYMENT_POINTS, PAYMENT_TOAST } from '@/mock/site-home';
import { DisplayHeading, SiteEyebrow } from '../site-shell';

/**
 * 08 Home › Checkout ("They tap pay. You wake up paid."): forest card with rings, three payment
 * points, and the checkout phone with a "Payment successful" toast and "Secured by Paystack" chip.
 */
export function HomePayments() {
  return (
    <div className="px-2 pt-20 md:px-3.5 md:pt-[110px]">
      <section
        aria-labelledby="payments-heading"
        className="relative isolate overflow-hidden rounded-[24px] bg-forest px-5 py-14 text-paper md:rounded-[32px] md:px-10 md:py-20 xl:flex xl:h-[720px] xl:items-center xl:justify-between xl:gap-16 xl:px-20 xl:py-0"
      >
        <div className="flex flex-col gap-[26px] xl:w-[560px]">
          <SiteEyebrow
            tone="light"
            className="text-[13px] tracking-[1.4px] text-paper/70 md:text-sm"
          >
            Payments
          </SiteEyebrow>
          <div id="payments-heading">
            <DisplayHeading
              tone="light"
              line1="They tap pay."
              line2="You wake up paid."
              accentClassName="text-paper/70"
            />
          </div>
          <ul className="flex flex-col gap-[26px]">
            {PAYMENT_POINTS.map((p) => (
              <li key={p.title} className="flex gap-3.5">
                <span
                  aria-hidden
                  className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-paper/12"
                >
                  <Check className="size-3.5" />
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-[17px] font-semibold">{p.title}</span>
                  <span className="text-[15px] text-paper/70">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden className="relative mx-auto mt-16 w-fit xl:mx-0 xl:mt-0 xl:mr-[100px]">
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10">
            {[360, 540, 720, 900, 1080].map((d) => (
              <span
                key={d}
                style={{ width: d, height: d }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/8"
              />
            ))}
          </div>

          <div className="w-[250px] rounded-[38px] bg-[#262B23] p-2 sm:w-[290px] sm:rounded-[42px] sm:p-[9px]">
            <div className="relative aspect-[272/582] overflow-hidden rounded-[30px] sm:rounded-[34px]">
              <Image
                src="/marketing/checkout-mobile.png"
                alt=""
                fill
                sizes="272px"
                className="object-cover object-top"
              />
            </div>
          </div>

          <div className="absolute right-[-12px] bottom-10 left-[-12px] flex flex-col gap-2 rounded-[22px] bg-surface p-4 text-forest shadow-[0_24px_48px_-16px_rgb(0_0_0/0.35)] sm:right-auto sm:left-[-80px] sm:w-[300px] sm:p-5 xl:top-[330px] xl:bottom-auto xl:left-[-157px]">
            <span className="flex items-center gap-2.5">
              <span className="flex size-[30px] items-center justify-center rounded-full bg-success text-paper">
                <Check className="size-4" />
              </span>
              <span className="text-base font-semibold">{PAYMENT_TOAST.title}</span>
            </span>
            <span className="text-sm/5 text-fg-muted">{PAYMENT_TOAST.body}</span>
          </div>

          <span className="absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#4A5245] px-4 py-2.5 text-sm font-medium whitespace-nowrap xl:top-12 xl:left-[275px] xl:translate-x-0 xl:bg-paper/12">
            <ShieldCheck className="size-4" />
            Secured by Paystack
          </span>
        </div>
      </section>
    </div>
  );
}
