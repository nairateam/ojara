import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { platformOrigin } from '@/lib/platform-url';

/** 01.01 Home — PLACEHOLDER: hero block pattern only (inset #E0E3D1 card, radius 28). */
export default async function MarketingHome() {
  const appOrigin = await platformOrigin('dashboard');
  return (
    <section className="px-4 pt-4 md:px-10 md:pt-8">
      <div className="flex min-h-[420px] flex-col justify-center gap-6 rounded-[22px] bg-surface-muted px-6 py-12 md:min-h-[640px] md:rounded-2xl md:px-16">
        <span className="text-xs font-bold tracking-eyebrow text-fg-muted uppercase">Online stores for Nigerian businesses</span>
        <h1 className="max-w-[760px] font-display text-[36px] leading-[1.05] font-semibold tracking-[-1px] md:text-[64px] md:leading-[64px] md:tracking-[-2px]">
          From DMs to a real store — in one afternoon.
        </h1>
        <p className="max-w-[560px] text-lg leading-[27px] text-fg-lead">
          Put your products online, take payments with Paystack and manage delivery, all from your phone.
        </p>
        <div>
          <Button asChild size="cta">
            <a href={`${appOrigin}/signup`}>
              Start free <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
