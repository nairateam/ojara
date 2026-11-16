'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const FADE = [1, 0.45, 0.3, 0.18];

/**
 * 08 Home › Hero benefit stack. The highlighted line (full opacity, long bar) moves down the list
 * every few seconds, the others fading by distance, as in the design's static frame. Hovering a
 * line highlights it; reduced-motion visitors get the static list.
 */
export function HeroBenefits({ items }: { items: readonly string[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % items.length), 2600);
    return () => window.clearInterval(id);
  }, [paused, items.length]);

  return (
    <ul
      aria-label="Why sellers switch"
      className="flex flex-col gap-1.5"
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((b, i) => {
        const distance = (i - active + items.length) % items.length;
        return (
          <li
            key={b}
            onMouseEnter={() => {
              setPaused(true);
              setActive(i);
            }}
            style={{ opacity: FADE[distance] ?? 0.18 }}
            className="flex cursor-default items-center gap-3 font-display text-[26px] font-medium tracking-[-0.8px] text-paper transition-opacity duration-700"
          >
            <span
              aria-hidden
              className={cn(
                'h-0.5 bg-paper transition-[width] duration-700',
                distance === 0 ? 'w-7' : 'w-3.5',
              )}
            />
            {b}
          </li>
        );
      })}
    </ul>
  );
}
