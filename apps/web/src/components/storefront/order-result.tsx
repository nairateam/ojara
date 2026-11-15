import { formatKobo } from '@ojara/shared';
import type { LucideIcon } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cartLines, STORE } from '@/mock/storefront';
import { storeButton, StoreLinkButton, Thumb } from './primitives';

/**
 * 05.06 Order Confirmed / 05.07 Payment Failed: centred 640 column with a status icon, Fraunces
 * heading, a "what happens next" card, the items and two CTAs.
 */
export function OrderResult({
  tone,
  icon: Icon,
  title,
  sub,
  stepsTitle,
  steps,
  totalLabel,
  total,
  primary,
}: {
  tone: 'success' | 'danger';
  icon: LucideIcon;
  title: string;
  sub: ReactNode;
  stepsTitle: string;
  steps: { icon: LucideIcon; title: string; sub: string }[];
  totalLabel: string;
  total: number;
  primary: { href: string; label: string };
}) {
  const lines = cartLines();
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-8 px-4 pt-12 pb-20 md:pt-16 md:pb-24">
      <span
        className={cn(
          'flex size-16 items-center justify-center rounded-full',
          tone === 'success' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
        )}
      >
        <Icon className="size-[30px]" aria-hidden />
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
          {lines.map((line) => (
            <li key={line.slug} className="flex items-center gap-3.5">
              <Thumb src={line.product.image} alt={line.product.name} className="h-[54px] w-12" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-store-ink">{line.product.name}</span>
                <span className="text-xs text-store-body">
                  {line.variant} · Qty {line.qty}
                </span>
              </span>
              <span className="text-sm font-semibold text-store-ink">{formatKobo(line.total)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-store-border pt-3.5">
          <span className="text-ui text-store-body">{totalLabel}</span>
          <span className="text-sm font-bold text-store-ink">{formatKobo(total)}</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <StoreLinkButton href={primary.href}>{primary.label}</StoreLinkButton>
        <a href={STORE.whatsappHref} className={storeButton('secondary', 'px-[22px]')}>
          <MessageCircle className="size-4" aria-hidden />
          Message the store
        </a>
      </div>
    </div>
  );
}
