import { Hammer } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/app/empty-state';
import { ADMIN_NAV, navTitle } from '@/components/app/nav-config';
import { PageHeader } from '@/components/app/page-header';

type Props = { params: Promise<{ section: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: navTitle(ADMIN_NAV, [], (await params).section[0] ?? '') ?? 'Not found' };
}

/** PLACEHOLDER for admin sections until each feature is built. */
export default async function AdminSection({ params }: Props) {
  const { section } = await params;
  const title = navTitle(ADMIN_NAV, [], section[0] ?? '');
  if (!title || section.length > 2) notFound();
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon={Hammer}
        title={`${title} is on its way`}
        body="This admin tool is not built yet."
      />
    </>
  );
}
