import { cn } from '@/lib/utils';

/**
 * Ojara wordmark as used on every product screen: lowercase "ojara" in Bricolage Grotesque 700
 * followed by a solid dot. Sizes from the designs: 28/8 (auth, footer), 26/7 (header),
 * 24/6 (mobile), 22/6 (admin), 13/5 ("Powered by").
 */
const SIZES = {
  xl: { text: 'text-[28px] tracking-[-0.8px]', dot: 'size-2' },
  lg: { text: 'text-[26px] tracking-[-0.8px]', dot: 'size-[7px]' },
  md: { text: 'text-2xl tracking-[-0.7px]', dot: 'size-1.5' },
  sm: { text: 'text-[22px] tracking-[-0.7px]', dot: 'size-1.5' },
  xs: { text: 'text-[13px]', dot: 'size-[5px]' },
} as const;

export function Wordmark({
  size = 'lg',
  tone = 'dark',
  className,
}: {
  size?: keyof typeof SIZES;
  /** `dark` = forest text on paper; `light` = paper text on forest. */
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={cn('inline-flex items-end gap-0.5 leading-none', className)} aria-label="Ojara">
      <span className={cn('font-display font-bold', s.text, tone === 'light' ? 'text-paper' : 'text-forest')}>ojara</span>
      <span
        aria-hidden
        className={cn('mb-[0.18em] rounded-full', s.dot, tone === 'light' ? 'bg-paper' : 'bg-fg-muted')}
      />
    </span>
  );
}

/** "Powered by ojara·" pill used in storefront footers (hidden on plans with removeBranding). */
export function PoweredByOjara({ className }: { className?: string }) {
  return (
    <a
      href="https://ojara.store"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border border-store-footer-line px-2.5 py-[5px] text-xs text-store-muted',
        className,
      )}
    >
      Powered by <Wordmark size="xs" tone="light" />
    </a>
  );
}
