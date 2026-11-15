import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { safeReturnPath } from '@/lib/routing';

export const metadata: Metadata = { title: 'Admin log in', robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; expired?: string }> };

/**
 * Admin sign-in (not in the designs): 02.01 layout; password + two-factor only (no Google/SMS).
 * No "already signed in" skip here: a merchant session doesn't grant admin access, and an expired
 * admin session must sign in again.
 */
export default async function AdminLoginPage({ searchParams }: Props) {
  const { next, expired } = await searchParams;
  return (
    <AuthShell
      headline="Ojara operations."
      body="Platform admin access. Requires two-step sign-in; sessions end after 8 hours and are recorded in the audit log."
      title="Admin log in"
      subtitle={
        expired
          ? 'Your admin session has ended (8-hour limit). Log in again to continue.'
          : 'Platform admins only.'
      }
    >
      <LoginForm variant="admin" redirectTo={safeReturnPath(next) ?? '/'} />
    </AuthShell>
  );
}
