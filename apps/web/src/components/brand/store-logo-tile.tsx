import { cn } from '@/lib/utils';

/**
 * Merchant logo tile: a coloured square with the store initial (as in the designs, e.g. marigold
 * tile with "A"). Used until the merchant uploads a logo (Store.logoPublicId).
 */
export function StoreLogoTile({
  name,
  size = 34,
  className,
}: {
  name: string;
  size?: 26 | 32 | 34 | 36 | 44;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const radius = size >= 44 ? 'rounded-[10px]' : size <= 26 ? 'rounded-sm' : 'rounded-md';
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.53) }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-store-accent font-display font-bold text-store-accent-ink',
        radius,
        className,
      )}
    >
      {initial}
    </span>
  );
}
