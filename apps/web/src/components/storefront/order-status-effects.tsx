'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCart } from './cart';

/** Empties the browser cart once the order is paid. */
export function ClearCartOnPaid() {
  const { lines, clear } = useCart();
  const hasLines = lines.length > 0;
  useEffect(() => {
    if (hasLines) clear();
  }, [hasLines, clear]);
  return null;
}

/** Re-renders the page every few seconds while Paystack's confirmation is on its way (max ~2 min). */
export function RefreshWhilePending({ intervalMs = 3000, maxTries = 40 }) {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const id = window.setInterval(() => {
      tries += 1;
      if (tries > maxTries) window.clearInterval(id);
      else router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs, maxTries]);
  return null;
}
