import { PageContainer } from '@/components/app/page-container';
import { Hammer } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/app/empty-state';
import {
  MERCHANT_NAV,
  MERCHANT_NAV_FOOTER,
  MERCHANT_TABS,
  navTitle,
} from '@/components/app/nav-config';
import { PageHeader } from '@/components/app/page-header';

type Props = { params: Promise<{ section: string[] }> };

function titleFor(section: string[]) {
  const first = section[0] ?? '';
  return navTitle(MERCHANT_NAV, [...MERCHANT_NAV_FOOTER, ...MERCHANT_TABS], first);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: titleFor((await params).section) ?? 'Not found' };
}

/** PLACEHOLDER for every dashboard section in the sidebar until its feature is built. */
export default async function DashboardSection({ params }: Props) {
  const { section } = await params;
  const title = titleFor(section);
  if (!title || section.length > 2) notFound();
  return (
    <PageContainer>
      <PageHeader title={title} />
      <EmptyState
        icon={Hammer}
        title={`${title} is on its way`}
        body="This part of your dashboard is being built. The layout, navigation and theming are ready."
      />
    </PageContainer>
  );
}
