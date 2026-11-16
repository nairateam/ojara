import { ArrowUpRight, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE_STATS } from '@/mock/site';
import { MARQUEE_ROWS, PROOF_AVATARS, type MarqueeSeller } from '@/mock/site-home';

/**
 * 08 Home › Marquee: "Trusted by N Nigerian stores" proof line, then two rows of seller chips
 * fading out at both edges, with a dark "Your store here" chip among them.
 */
export function HomeMarquee({ appOrigin }: { appOrigin: string }) {
  return (
    <section aria-label="Stores on Ojara" className="flex flex-col gap-7 pt-10 md:pt-[52px]">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-5 text-[15px]">
        <span aria-hidden className="flex">
          {PROOF_AVATARS.map((src) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={34}
              height={34}
              className="-ml-2.5 size-[34px] rounded-full object-cover ring-2 ring-paper first:ml-0"
            />
          ))}
        </span>
        <p className="flex flex-wrap items-baseline justify-center gap-x-1.5 text-fg-muted">
          Trusted by
          <strong className="font-semibold text-forest">
            {SITE_STATS.storesLive.toLocaleString('en-NG')} Nigerian stores
          </strong>
          <span className="font-accent text-[19px] italic">— from Lagos to Kano</span>
        </p>
        <span aria-hidden className="hidden h-[18px] w-px bg-[#C9CDB9] sm:block" />
        <Link
          href="/stores"
          className="flex items-center gap-1.5 font-semibold text-forest hover:underline"
        >
          Browse stores <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </div>

      <div className="relative flex flex-col gap-3 overflow-hidden">
        {MARQUEE_ROWS.map((row, r) => (
          // Each row is rendered twice and slides by half its width, so the loop is seamless.
          // The copy is hidden from screen readers and keyboard. Hover pauses it.
          <ul
            key={r}
            className={cn(
              'site-marquee flex w-max [--marquee-duration:70s] [&>li]:mr-3',
              r % 2 === 1 && '[animation-direction:reverse]',
            )}
          >
            {[0, 1].flatMap((copy) =>
              row.map((seller) =>
                seller ? (
                  <SellerChip key={`${copy}-${seller.name}`} seller={seller} copy={copy === 1} />
                ) : (
                  <li
                    key={`${copy}-you`}
                    className="shrink-0"
                    aria-hidden={copy === 1 || undefined}
                    inert={copy === 1}
                  >
                    <a
                      href={`${appOrigin}/signup`}
                      className="site-btn flex items-center gap-3 rounded-full bg-forest py-2 pr-[22px] pl-2"
                    >
                      <span className="flex size-11 items-center justify-center rounded-full bg-paper/12 text-paper">
                        <Plus aria-hidden className="size-[18px]" />
                      </span>
                      <span className="flex flex-col gap-px">
                        <span className="font-display text-base font-semibold whitespace-nowrap text-paper">
                          Your store here
                        </span>
                        <span className="text-xs whitespace-nowrap text-[#B9BEAD]">
                          Open free in 8 minutes
                        </span>
                      </span>
                    </a>
                  </li>
                ),
              ),
            )}
          </ul>
        ))}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(90deg,var(--color-paper),transparent)] md:w-[220px]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(-90deg,var(--color-paper),transparent)] md:w-[220px]"
        />
      </div>
    </section>
  );
}

function SellerChip({ seller, copy }: { seller: MarqueeSeller; copy: boolean }) {
  return (
    <li
      aria-hidden={copy || undefined}
      className="flex shrink-0 items-center gap-3 rounded-full bg-surface py-2 pr-[22px] pl-2"
    >
      <Image
        src={seller.photo}
        alt=""
        width={44}
        height={44}
        className="size-11 rounded-full object-cover"
      />
      <span className="flex flex-col gap-px">
        <span className="font-display text-base font-semibold whitespace-nowrap text-forest">
          {seller.name}
        </span>
        <span className="text-xs whitespace-nowrap text-fg-muted">{seller.meta}</span>
      </span>
    </li>
  );
}
