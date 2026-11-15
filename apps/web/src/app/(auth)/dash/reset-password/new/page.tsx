import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { NewPasswordForm } from '@/components/auth/reset-password-forms';
import { Alert } from '@/components/ui/feedback';

export const metadata: Metadata = { title: 'Choose a new password' };

type Props = { searchParams: Promise<{ token?: string; error?: string }> };

/** Landing page for the reset link (Better Auth redirects here with ?token= or ?error=). */
export default async function NewPasswordPage({ searchParams }: Props) {
  const { token, error } = await searchParams;
  const valid = Boolean(token) && !error;
  return (
    <AuthShell
      headline="Locked out? We’ll get you back in."
      switchPrompt={{ question: 'Remembered it?', label: 'Log in', href: '/login' }}
      title={valid ? 'Choose a new password' : 'This link has expired'}
      subtitle={
        valid
          ? 'Pick something you haven’t used before. At least 8 characters.'
          : 'Reset links work once and expire after an hour.'
      }
    >
      {valid && token ? (
        <NewPasswordForm token={token} />
      ) : (
        <Alert tone="error" title="We couldn’t use that reset link">
          <Link href="/reset-password" className="font-semibold underline">
            Request a new link
          </Link>
        </Alert>
      )}
    </AuthShell>
  );
}
