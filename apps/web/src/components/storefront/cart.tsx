'use client';

import { useSyncExternalStore } from 'react';

/**
 * Shopper cart kept in this browser (localStorage). Each store has its own origin
 * ({slug}.ROOT_DOMAIN or a custom domain), so carts never mix between stores. Prices here are a
 * snapshot for display; checkout re-prices every line on the server.
 */

export interface CartLine {
  variantId: string;
  slug: string;
  name: string;
  /** "M / Indigo"; empty for simple products. */
  label: string;
  priceKobo: number;
  compareAtKobo: number | null;
  publicId: string | null;
  qty: number;
}

const KEY = 'ojara-cart';
const EVENT = 'ojara-cart-change';
const MAX_QTY = 99;
const EMPTY: CartLine[] = [];

let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };

function read(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.lines;
  let lines: CartLine[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) lines = parsed as CartLine[];
  } catch {
    lines = EMPTY;
  }
  cache = { raw, lines };
  return lines;
}

function write(lines: CartLine[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // Private mode / storage full: the cart just won't persist.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotalKobo = lines.reduce((n, l) => n + l.priceKobo * l.qty, 0);

  return {
    lines,
    count,
    subtotalKobo,
    add: (line: Omit<CartLine, 'qty'>, qty = 1) => {
      const current = read();
      const existing = current.find((l) => l.variantId === line.variantId);
      write(
        existing
          ? current.map((l) =>
              l.variantId === line.variantId
                ? { ...l, ...line, qty: Math.min(MAX_QTY, l.qty + qty) }
                : l,
            )
          : [...current, { ...line, qty: Math.min(MAX_QTY, qty) }],
      );
    },
    setQty: (variantId: string, qty: number) => {
      write(
        read()
          .map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
          .filter((l) => l.qty > 0),
      );
    },
    remove: (variantId: string) => {
      write(read().filter((l) => l.variantId !== variantId));
    },
    clear: () => {
      write([]);
    },
  };
}

/** Item count for the header cart icon (0 on the server, then the real count). */
export function CartCount({ className }: { className?: string }) {
  const { count } = useCart();
  if (count === 0) return null;
  return <span className={className}>{count}</span>;
}

export function useCartCount() {
  return useCart().count;
}
