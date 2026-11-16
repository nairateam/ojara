'use client';

import { useEffect } from 'react';

/**
 * Scroll reveal for the public site. Tags the main blocks of every section (headings, copy, cards,
 * list rows, tables, FAQ items) with `data-reveal`, then marks them `data-revealed` as they scroll
 * into view; CSS in globals.css fades and lifts them, staggering siblings. New content (filters,
 * client navigation) is picked up by a MutationObserver. Attributes rather than classes, so React
 * re-renders never undo a reveal. No-op when the visitor prefers reduced motion.
 */

/** Blocks worth animating. Nested matches are skipped so a card animates as one piece. */
const TARGETS = [
  'h1',
  'h2',
  'section p',
  'section ul > li',
  'section ol > li',
  'section dl > div',
  'section table',
  'section details',
  'section form',
  'section [class*="grid"] > *',
  'section [class*="flex-wrap"] > *',
  'section a[class*="rounded-full"]',
].join(',');

const ROOTS = '.site-root main, .site-root [data-site-closing]';
const MAX_STAGGER = 6;

function collect(root: ParentNode): HTMLElement[] {
  const found: HTMLElement[] = [];
  for (const el of root.querySelectorAll<HTMLElement>(TARGETS)) {
    if (el.hasAttribute('data-reveal') || el.closest('[data-no-reveal], nav, [role="menu"]')) {
      continue;
    }
    // Skip anything inside an element already chosen (document order: parents come first).
    if (found.some((parent) => parent.contains(el))) continue;
    if (el.parentElement?.closest('[data-reveal]')) continue;
    found.push(el);
  }
  return found;
}

export function SiteMotion() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('site-motion');

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', '');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const scan = () => {
      for (const root of document.querySelectorAll(ROOTS)) {
        const els = collect(root);
        // Stagger siblings that share a parent (grid cards, list rows, hero lines).
        const order = new Map<Element | null, number>();
        for (const el of els) {
          const i = order.get(el.parentElement) ?? 0;
          order.set(el.parentElement, i + 1);
          el.setAttribute('data-reveal', String(Math.min(i, MAX_STAGGER)));
          io.observe(el);
        }
      }
    };

    scan();
    let frame = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
      document.documentElement.classList.remove('site-motion');
    };
  }, []);

  return null;
}
