import {
  ChevronDown,
  CreditCard,
  Globe,
  type LucideIcon,
  Mail,
  MessageCircle,
  PackagePlus,
  Phone,
  Search,
  Truck,
} from 'lucide-react';
import type { Metadata } from 'next';
import { PageContainer } from '@/components/app/page-container';
import { StatusPill } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  HELP_FAQS,
  HELP_GUIDES,
  HELP_POPULAR,
  STORE,
  SUPPORT_CHANNELS,
  SUPPORT_REQUESTS,
} from '@/mock/dashboard-store';

export const metadata: Metadata = { title: 'Help & support' };

const GUIDE_ICONS: Record<(typeof HELP_GUIDES)[number]['icon'], LucideIcon> = {
  package: PackagePlus,
  card: CreditCard,
  truck: Truck,
  globe: Globe,
};

const CHANNEL_ICONS: Record<(typeof SUPPORT_CHANNELS)[number]['icon'], LucideIcon> = {
  whatsapp: MessageCircle,
  mail: Mail,
  phone: Phone,
};

/** 03.14 Help & support. */
export default function HelpPage() {
  return (
    <PageContainer className="gap-6">
      <section className="flex flex-col gap-3.5 rounded-[14px] bg-forest px-5 py-6 text-paper md:px-8 md:py-7">
        <h1 className="font-display text-[22px] font-semibold tracking-display md:text-h-page">
          How can we help, {STORE.ownerFirstName}?
        </h1>
        <form action="/help" role="search" className="w-full max-w-[560px]">
          <label className="flex items-center gap-2.5 rounded-[10px] bg-surface px-4 py-[13px] text-fg has-focus-visible:shadow-focus">
            <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden />
            <input
              type="search"
              name="q"
              aria-label="Search guides"
              placeholder="Search guides — e.g. “refund a customer”"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-fg-subtle"
            />
          </label>
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-fg-on-dark">Popular:</span>
          {HELP_POPULAR.map((p) => (
            <a
              key={p}
              href={`/help?q=${encodeURIComponent(p)}`}
              className="rounded-pill bg-paper/10 px-2.5 py-1 text-xs font-medium text-paper hover:bg-paper/20"
            >
              {p}
            </a>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <h2 className="text-title font-semibold">Getting set up</h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {HELP_GUIDES.map((g) => {
              const Icon = GUIDE_ICONS[g.icon];
              return (
                <a
                  key={g.title}
                  href={`/help?q=${encodeURIComponent(g.title)}`}
                  className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-4 hover:bg-selected"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-surface-muted">
                    <Icon className="size-[18px] text-fg" aria-hidden />
                  </span>
                  <span className="text-ui font-semibold">{g.title}</span>
                  <span className="text-xs leading-[17px] text-fg-muted">{g.body}</span>
                </a>
              );
            })}
          </div>

          <h2 className="text-title font-semibold">Common questions</h2>
          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            {HELP_FAQS.map((f, i) => (
              <details
                key={f.q}
                open={i === 0}
                className="group border-line px-[18px] py-3.5 not-last:border-b"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-ui font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown
                    className="size-4 shrink-0 text-fg-muted transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="pt-2 text-ui leading-5 text-fg-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-5 lg:w-[340px] lg:shrink-0">
          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
            <h2 className="text-title font-semibold">Talk to a person</h2>
            {SUPPORT_CHANNELS.map((c) => {
              const Icon = CHANNEL_ICONS[c.icon];
              return (
                <a
                  key={c.title}
                  href={
                    c.icon === 'whatsapp'
                      ? 'https://wa.me/2347006527200'
                      : c.icon === 'mail'
                        ? 'mailto:support@ojara.store'
                        : 'tel:07006527200'
                  }
                  className="flex items-center gap-3 rounded-[10px] border border-line p-3 hover:bg-selected"
                >
                  <span
                    className={cn(
                      'flex size-[34px] shrink-0 items-center justify-center rounded-full',
                      c.icon === 'whatsapp'
                        ? 'bg-success-soft text-success'
                        : 'bg-surface-muted text-fg-muted',
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-ui font-semibold">{c.title}</span>
                    <span className="text-xs text-fg-muted">{c.body}</span>
                  </span>
                </a>
              );
            })}
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-title font-semibold">Your requests</h2>
              <Button variant="ghost" size="none" className="text-xs">
                New request
              </Button>
            </div>
            {SUPPORT_REQUESTS.map((r) => (
              <div key={r.id} className="flex flex-col gap-1.5 rounded-[10px] bg-paper p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-fg-muted">{r.id}</span>
                  <StatusPill tone="info">{r.status}</StatusPill>
                </div>
                <p className="text-ui font-semibold">{r.title}</p>
                <p className="text-xs text-fg-muted">{r.meta}</p>
              </div>
            ))}
          </section>

          <p className="flex items-center gap-2.5 rounded-[10px] bg-success-soft px-3.5 py-3 text-xs font-semibold text-success">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-success" />
            All systems normal · Paystack operational
          </p>
        </aside>
      </div>
    </PageContainer>
  );
}
