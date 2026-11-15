import type { ReactNode } from 'react';
import { PageContainer } from '@/components/app/page-container';
import { SettingsTabs } from '@/components/dashboard-store/settings-tabs';

/** Settings shell (03.15–03.19): title + underline tab bar, section gap 22. */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <PageContainer className="gap-[22px]">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-[22px] font-semibold tracking-display md:text-h-page">
          Settings
        </h1>
        <SettingsTabs />
      </div>
      {children}
    </PageContainer>
  );
}
