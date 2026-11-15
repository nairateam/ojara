import { notFound } from 'next/navigation';
import { getTenant } from '@/lib/tenant';

type Props = { params: Promise<{ host: string }> };

/** 05.01 Storefront home — PLACEHOLDER: hero + product grid skeleton. */
export default async function StorefrontHome({ params }: Props) {
  const tenant = await getTenant(decodeURIComponent((await params).host));
  if (!tenant) notFound();
  return (
    <>
      <section className="grid gap-8 px-4 py-10 md:grid-cols-2 md:px-16 md:py-16">
        <div className="flex flex-col justify-center gap-5">
          <span className="text-xs font-semibold tracking-eyebrow text-store-eyebrow uppercase">
            New this week
          </span>
          <h1 className="font-serif text-[40px] leading-[1.05] font-medium tracking-[-1.5px] md:text-[64px] md:leading-[65px]">
            Welcome to {tenant.name}
          </h1>
          <p className="max-w-[460px] text-base leading-[25px] text-store-body">
            Our online store is being set up. Products will appear here soon.
          </p>
        </div>
        <div className="min-h-[280px] rounded-[14px] bg-store-band md:min-h-[440px]" aria-hidden />
      </section>
      <section className="flex flex-col gap-6 px-4 pb-16 md:px-16">
        <h2 className="font-serif text-[30px] font-medium tracking-[-0.5px]">New this week</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" aria-hidden>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[4/5] rounded-[14px] border border-store-border bg-store-card" />
              <div className="h-4 w-3/4 rounded-xs bg-store-band" />
              <div className="h-4 w-1/3 rounded-xs bg-store-band" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
