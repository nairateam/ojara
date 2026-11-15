import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { NoAdminAccess } from '@/components/auth/no-admin-access';
import { SignOutButton } from '@/components/auth/sign-out';
import { Wordmark } from '@/components/brand/wordmark';
import { requireUser } from '@/lib/auth/guards';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Ojara Admin' },
  robots: { index: false, follow: false },
};

/**
 * Admin two-factor enrolment lives outside the admin shell: the shell sends admins without
 * two-factor here, so it can't wrap this page too. Admins who already have two-factor go on to
 * the console.
 */
export default async function AdminSetupLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (user.role !== 'PLATFORM_ADMIN') return <NoAdminAccess />;
  if (user.twoFactorEnabled) redirect('/');

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 lg:px-8">
        <span className="flex items-center gap-2">
          <Wordmark size="sm" />
          <span className="rounded-xs bg-surface-muted px-[7px] py-0.5 text-micro font-bold tracking-label text-fg-muted">
            ADMIN
          </span>
        </span>
        <SignOutButton className="inline-flex items-center gap-2 text-ui font-semibold text-fg-muted hover:text-fg disabled:opacity-60" />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
