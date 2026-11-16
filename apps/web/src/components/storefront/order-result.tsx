import { formatKobo, type StorefrontOrderDto } from '@ojara/shared';
import type { LucideIcon } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StoreLinkButton, StorePhoto, storeButton } from './primitives';

/**
 * 05.06 Order Confirmed / 05.07 Payment Failed: centred 640 column with a status icon, Fraunces
 * heading, a "what happens next" card, the order's items and two CTAs.
 */
export function OrderResult({
  tone,
  icon: Icon,
  title,
  sub,
  stepsTitle,
  steps,
  items,
  totalLabel,
  total,
  primary,
  whatsappHref,
}: {
  tone: 'success' | 'danger' | 'pending';
  icon: LucideIcon;
  title: string;
  sub: ReactNode;
  stepsTitle: string;
  steps: { icon: LucideIcon; title: string; sub: string }[];
  items: StorefrontOrderDto['items'];
  totalLabel: string;
  total: number;
  primary: { href: string; label: string } | null;
  whatsappHref: string | null;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-8 px-4 pt-12 pb-20 md:pt-16 md:pb-24">
      <span
        className={cn(
          'flex size-16 items-center justify-center rounded-full',
          tone === 'success' && 'bg-success-soft text-success',
          tone === 'danger' && 'bg-danger-soft text-danger',
          tone === 'pending' && 'bg-store-band text-store-ink',
        )}
      >
        <Icon className={cn('size-[30px]', tone === 'pending' && 'animate-spin')} aria-hidden />
      </span>
      <div className="flex flex-col gap-2.5 text-center">
        <h1 className="font-serif text-[28px] leading-tight font-medium tracking-[-0.6px] text-store-ink md:text-4xl">
          {title}
        </h1>
        <p className="text-sm text-store-body">{sub}</p>
      </div>
      <section className="flex w-full flex-col gap-5 rounded-[14px] border border-store-border bg-store-card p-5 md:p-7">
        <h2 className="font-serif text-xl font-medium text-store-ink">{stepsTitle}</h2>
        <ol className="flex flex-col gap-5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex items-center gap-3.5">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full',
                  i === 0
                    ? 'bg-store-primary text-store-primary-fg'
                    : 'bg-store-band text-store-body',
                )}
              >
                <step.icon className="size-[18px]" aria-hidden />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-store-ink">{step.title}</span>
                <span className="text-ui text-store-body">{step.sub}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
      <div className="flex w-full flex-col gap-3.5 py-1">
        <ul className="flex flex-col gap-3.5">
          {items.map((item, i) => (
            <li
              key={`${item.name}-${item.variantLabel ?? ''}-${i}`}
              className="flex items-center gap-3.5"
            >
              <span className="relative block h-[54px] w-12 shrink-0 overflow-hidden rounded-md bg-store-band">
                <StorePhoto publicId={item.imagePublicId} alt={item.name} sizes="120px" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-store-ink">{item.name}</span>
                <span className="text-xs text-store-body">
                  {item.variantLabel ? `${item.variantLabel} · ` : ''}Qty {item.quantity}
                </span>
              </span>
              <span className="text-sm font-semibold text-store-ink">
                {formatKobo(item.lineTotalKobo)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-store-border pt-3.5">
          <span className="text-ui text-store-body">{totalLabel}</span>
          <span className="text-sm font-bold text-store-ink">{formatKobo(total)}</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {primary ? <StoreLinkButton href={primary.href}>{primary.label}</StoreLinkButton> : null}
        {whatsappHref ? (
          <a href={whatsappHref} className={storeButton('secondary', 'px-[22px]')}>
            <MessageCircle className="size-4" aria-hidden />
            Message the store
          </a>
        ) : null}
      </div>
    </div>
  );
}
