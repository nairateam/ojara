import { formatKobo } from '@ojara/shared';
import { BatteryFull, Lock, ShoppingBag } from 'lucide-react';
import { StoreLogoTile } from '@/components/brand/store-logo-tile';
import { cn } from '@/lib/utils';

export interface CheckoutOption {
  title: string;
  subtitle: string;
  priceKobo: number;
  selected?: boolean;
}

/**
 * "What customers see at checkout" phone mock (03.11): 300x600 forest phone, radius 36, with the
 * merchant's storefront palette inside.
 */
export function CheckoutPhonePreview({
  storeName,
  address,
  options,
  totalKobo,
}: {
  storeName: string;
  address: string;
  options: CheckoutOption[];
  totalKobo: number;
}) {
  return (
    <div
      aria-label="Checkout preview"
      role="img"
      className="mx-auto h-[600px] w-[300px] shrink-0 rounded-[36px] bg-forest p-2.5"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-store-page">
        <div className="flex items-center justify-between px-5 pt-3 pb-1.5 text-2xs font-semibold text-fg">
          9:41
          <BatteryFull className="size-4" aria-hidden />
        </div>
        <div className="px-3.5 pb-2">
          <div className="flex items-center justify-center gap-1 rounded-md bg-[#EFEAE0] px-2.5 py-[5px] text-2xs text-fg-muted">
            <Lock className="size-2.5" aria-hidden />
            {address}
          </div>
        </div>
        <div className="flex items-center justify-between border-b border-store-border px-4 py-2.5">
          <span className="flex items-center gap-2">
            <StoreLogoTile name={storeName} size={26} />
            <span className="font-serif text-title font-semibold text-fg">{storeName}</span>
          </span>
          <ShoppingBag className="size-[18px] text-fg" aria-hidden />
        </div>
        <div className="flex flex-col gap-2.5 p-4">
          <p className="font-serif text-base font-semibold text-fg">
            How would you like to get it?
          </p>
          {options.map((o) => (
            <div
              key={o.title}
              className={cn(
                'flex items-center gap-2.5 rounded-md bg-surface p-[11px]',
                o.selected
                  ? 'border-[1.5px] border-store-primary p-[10.5px]'
                  : 'border border-line',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'size-3.5 shrink-0 rounded-full bg-surface',
                  o.selected
                    ? 'border-4 border-store-primary'
                    : 'border-[1.5px] border-line-strong',
                )}
              />
              <span className="flex min-w-0 flex-1 flex-col gap-px">
                <span className="truncate text-2xs font-semibold text-store-ink">{o.title}</span>
                <span className="text-micro text-store-body">{o.subtitle}</span>
              </span>
              <span
                className={cn(
                  'text-2xs font-bold',
                  o.selected ? 'text-store-primary' : 'text-store-ink',
                )}
              >
                {o.priceKobo === 0 ? 'Free' : formatKobo(o.priceKobo)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-0.5 pt-2 text-xs text-store-ink">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatKobo(totalKobo)}</span>
          </div>
          <span className="rounded-md bg-store-primary py-2.5 text-center text-xs font-semibold text-surface">
            Pay {formatKobo(totalKobo)}
          </span>
        </div>
      </div>
    </div>
  );
}
