'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 05.03 / 05.13 product gallery: thumbnails + main image with prev/next (desktop), full-width
 * image with dots (mobile). Small client island: only the selected index is state.
 */
export function ProductGallery({
  images,
  note,
}: {
  images: { src: string; alt: string }[];
  note?: string;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = images[index] ?? images[0];
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);
  if (!current) return null;

  return (
    <div className="flex gap-3.5">
      {count > 1 ? (
        <ul className="hidden flex-col gap-2.5 md:flex" aria-label="Product images">
          {images.map((img, i) => (
            <li key={img.src + i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  'relative block h-24 w-[76px] overflow-hidden rounded-md border-[1.5px]',
                  i === index ? 'border-store-ink' : 'border-transparent',
                )}
              >
                <Image src={img.src} alt="" fill sizes="160px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="relative flex h-[400px] w-full flex-col justify-between overflow-hidden bg-store-band p-3 md:h-[560px] md:rounded-lg md:p-4 lg:h-[700px] lg:w-[560px] lg:shrink">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        {note ? (
          <span className="relative hidden self-start rounded-sm bg-store-page/95 px-2.5 py-[5px] text-xs font-semibold text-store-ink md:block">
            {note}
          </span>
        ) : (
          <span />
        )}
        {count > 1 ? (
          <>
            <div className="relative hidden justify-end gap-2 md:flex">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="flex size-9 items-center justify-center rounded-full bg-store-page/95 text-store-ink"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="flex size-9 items-center justify-center rounded-full bg-store-page/95 text-store-ink"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
            <div className="relative flex gap-1.5 self-center rounded-pill bg-store-page/80 px-2 py-[5px] md:hidden">
              {images.map((img, i) => (
                <button
                  key={img.src + i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={cn(
                    'size-1.5 rounded-full',
                    i === index ? 'bg-store-ink' : 'bg-store-muted/50',
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
