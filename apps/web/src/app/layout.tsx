import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './globals.css';

// Fonts from the designs: Inter (UI), Bricolage Grotesque (display), JetBrains Mono (SKUs, DNS,
// IPs) and Fraunces (merchant storefront display only).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  // Optical-size axis: large display sizes render narrower, matching the designs.
  axes: ['opsz'],
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Ojara', template: '%s · Ojara' },
  description: 'Online stores for Nigerian businesses. From DMs to a real store in one afternoon.',
};

export const viewport: Viewport = {
  themeColor: '#EBEDDF',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-NG"
      className={cn(inter.variable, bricolage.variable, jetbrains.variable, fraunces.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
