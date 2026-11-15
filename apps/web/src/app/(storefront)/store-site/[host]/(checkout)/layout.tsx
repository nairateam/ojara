import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { robots: { index: false } };

/** Checkout group: no announcement bar, nav or footer. Headers come from (steps) / (result). */
export default function CheckoutGroupLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-store-page">{children}</div>;
}
