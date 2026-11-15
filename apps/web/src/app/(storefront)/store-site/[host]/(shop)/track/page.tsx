import { CUSTOMER_FULFILMENT_LABELS, formatKobo } from '@ojara/shared';
import { MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import {
  PageTitle,
  StoreField,
  storeButton,
  storeInput,
  Thumb,
} from '@/components/storefront/primitives';
import { getStore, type HostParams } from '@/components/storefront/store';
import { cn } from '@/lib/utils';
import { cartLines, ORDER, STORE } from '@/mock/storefront';

export const metadata: Metadata = { title: 'Track your order' };

/** 05.08 Track Order: lookup form + sample order card with a 4-step progress bar. */
export default async function TrackOrderPage({ params }: { params: HostParams }) {
  const store = await getStore(params);
  const lines = cartLines();
  const currentIndex = ORDER.timeline.findIndex((s) => s.status === ORDER.status);
  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 pt-8 pb-16 md:pt-14 md:pb-[88px]">
      <PageTitle>Track your order</PageTitle>
      <form action="/track" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <StoreField label="Order number" htmlFor="order" className="flex-1">
          <input id="order" name="order" defaultValue={ORDER.number} className={storeInput} />
        </StoreField>
        <StoreField label="Phone used at checkout" htmlFor="phone" className="flex-1">
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={ORDER.phoneMasked}
            className={storeInput}
          />
        </StoreField>
        <button type="submit" className={storeButton('ink', 'px-[22px] py-[13px] text-sm')}>
          Find order
        </button>
      </form>

      <article className="flex flex-col gap-[22px] rounded-[14px] border border-store-border bg-store-card p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl font-medium text-store-ink">Order {ORDER.number}</h2>
            <p className="text-ui text-store-body">
              Placed {ORDER.placedAt} · Paid {formatKobo(ORDER.total)}
            </p>
          </div>
          <span className="rounded-pill bg-info-soft px-3 py-1.5 text-ui font-semibold text-info">
            {CUSTOMER_FULFILMENT_LABELS[ORDER.status]}
          </span>
        </div>
        <ol className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4">
          {ORDER.timeline.map((step, i) => {
            const done = i < currentIndex;
            const current = i === currentIndex;
            return (
              <li
                key={step.status}
                className="flex flex-col gap-2"
                aria-current={current ? 'step' : undefined}
              >
                <span
                  aria-hidden
                  className={cn(
                    'h-[5px] rounded-[3px]',
                    done ? 'bg-success' : current ? 'bg-store-primary' : 'bg-store-border',
                  )}
                />
                <span
                  className={cn(
                    'text-ui',
                    done || current
                      ? 'font-semibold text-store-ink'
                      : 'font-medium text-store-muted',
                  )}
                >
                  {CUSTOMER_FULFILMENT_LABELS[step.status]}
                </span>
                {step.note ? <span className="text-xs text-store-body">{step.note}</span> : null}
              </li>
            );
          })}
        </ol>
        <div className="flex flex-col gap-6 border-t border-store-border pt-5 sm:flex-row">
          <ul className="flex flex-1 flex-col gap-3">
            {lines.map((line) => (
              <li key={line.slug} className="flex items-center gap-3">
                <Thumb
                  src={line.product.image}
                  alt={line.product.name}
                  className="h-14 w-12 rounded-sm"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-store-ink">{line.product.name}</span>
                  <span className="text-xs text-store-body">
                    {line.variantShort.split(' · ')[0]} · ×{line.qty}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1.5 sm:w-[260px]">
            <span className="text-2xs font-semibold tracking-[1px] text-store-body uppercase">
              Delivering to
            </span>
            <span className="text-sm font-semibold text-store-ink">
              {ORDER.shortName} · {ORDER.town}, {ORDER.state}
            </span>
            <span className="text-ui leading-[19px] text-store-body">
              We’ll text you the rider’s number when it’s on its way.
            </span>
          </div>
        </div>
      </article>
      <a
        href={STORE.whatsappHref}
        className="flex items-center gap-2 text-sm font-semibold text-store-primary"
      >
        <MessageCircle className="size-4 shrink-0" aria-hidden />
        Question about this order? WhatsApp {store.name}
      </a>
    </section>
  );
}
