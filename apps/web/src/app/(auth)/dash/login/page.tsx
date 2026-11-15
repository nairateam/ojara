import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { getAuthOptions } from '@/lib/api/server';

export const metadata: Metadata = { title: 'Log in' };

type Props = { searchParams: Promise<{ error?: string; reset?: string }> };

/** 02.01 Log In (email + password, optional Google, then 2FA when enabled). */
export default async function LoginPage({ searchParams }: Props) {
  const [{ googleSignIn }, { error, reset }] = await Promise.all([getAuthOptions(), searchParams]);
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
        googleSignIn={googleSignIn}
        initialError={error ? 'Google sign-in didn’t complete. Please try again.' : undefined}
      />
    </AuthShell>
  );
}
