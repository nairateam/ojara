import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';
import { getAuthOptions } from '@/lib/api/server';
import { getSessionUser } from '@/lib/api/session';

export const metadata: Metadata = { title: 'Create your store' };

/** 02.02 Sign Up. */
export default async function SignupPage() {
  const [{ googleSignIn }, user] = await Promise.all([
    getAuthOptions(),
    getSessionUser().catch(() => null),
  ]);
  if (user) redirect('/');
  return (
    <AuthShell
      headline="Your market stall, now open online."
      switchPrompt={{ question: 'Already selling on Ojara?', label: 'Log in', href: '/login' }}
      title="Create your free store"
      subtitle="No card needed. Stay on the Free plan as long as you like."
    >
      <SignupForm googleSignIn={googleSignIn} />
    </AuthShell>
  );
}
