import { notFound } from 'next/navigation';
import { MARKETING_LINKS } from '@/components/marketing/marketing-header';

type Props = { params: Promise<{ slug: string[] }> };

/** PLACEHOLDER for 01.02 How it works, 01.03 Stores on Ojara, 01.05/01.06 Help. */
export default async function MarketingPlaceholder({ params }: Props) {
  const { slug } = await params;
  const link = MARKETING_LINKS.find((l) => l.href === `/${slug[0] ?? ''}`);
  if (!link || slug.length > 2) notFound();
  return (
    <section className="flex flex-col gap-3 px-4 py-20 md:px-20">
      <h1 className="font-display text-[36px] font-semibold tracking-[-1px] md:text-5xl">{link.label}</h1>
      <p className="text-lg text-fg-lead">This page is coming soon.</p>
    </section>
  );
}
