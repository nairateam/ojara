import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { getAuthOptions } from '@/lib/api/server';
import { getSessionUser } from '@/lib/api/session';
import { safeReturnPath } from '@/lib/routing';

export const metadata: Metadata = { title: 'Log in' };

type Props = { searchParams: Promise<{ error?: string; reset?: string; next?: string }> };

/** 02.01 Log In (email + password, optional Google, then 2FA when enabled). */
export default async function LoginPage({ searchParams }: Props) {
  const [{ googleSignIn }, { error, reset, next }, user] = await Promise.all([
    getAuthOptions(),
    searchParams,
    // Already signed in: skip the form. If the API is unreachable, just show the form.
    getSessionUser().catch(() => null),
  ]);
  const redirectTo = safeReturnPath(next) ?? '/';
  if (user) redirect(redirectTo);

  return (
    <AuthShell
      headline="Welcome back to your market."
      switchPrompt={{ question: 'New to Ojara?', label: 'Create a free store', href: '/signup' }}
      title="Log in"
      subtitle={
        reset === 'done'
          ? 'Your password has been changed. Log in with your new password.'
          : 'Manage orders, products and payouts for your store.'
      }
    >
      <LoginForm
        redirectTo={redirectTo}
        googleSignIn={googleSignIn}
        initialError={error ? 'Google sign-in didn’t complete. Please try again.' : undefined}
      />
    </AuthShell>
  );
}
