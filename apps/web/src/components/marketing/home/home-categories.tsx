import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HOME_CATEGORIES } from '@/mock/site-home';
import { HomeSection, HomeSectionHeading } from './section-heading';

/**
 * 08 Home › Categories ("Made for every kind of stall."): six photo cards, each opening the
 * stores directory (filtered to that category where the directory has one).
 */
export function HomeCategories() {
  return (
    <HomeSection id="categories-heading" className="flex flex-col gap-10 md:gap-12">
      <HomeSectionHeading
        id="categories-heading"
        align="center"
        eyebrow="Built for sellers"
        line1="Made for every kind of stall."
        line2="From gele to gadgets."
      />

      <ul className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {HOME_CATEGORIES.map((c) => (
          <li key={c.title}>
            <Link
              href={c.filter ? `/stores?category=${encodeURIComponent(c.filter)}` : '/stores'}
              className="group relative isolate flex h-[320px] flex-col justify-end gap-2 overflow-hidden rounded-[24px] p-6 text-paper md:h-[440px] md:rounded-[28px] md:p-7"
            >
              <Image
                src={c.photo}
                alt=""
                fill
                sizes="(min-width: 1024px) 424px, (min-width: 640px) 50vw, 100vw"
                className="-z-20 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#262B2300_45%,#262B23E6_100%)]"
              />
              <span className="flex items-center justify-between gap-4">
                <span className="font-display text-[26px] font-semibold tracking-[-1px] md:text-[30px]">
                  {c.title}
                </span>
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-paper text-forest"
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </span>
              <span className="text-[15px] text-paper/80">{c.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
