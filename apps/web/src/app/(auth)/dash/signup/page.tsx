import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';
import { getAuthOptions } from '@/lib/api/server';

export const metadata: Metadata = { title: 'Create your store' };

/** 02.02 Sign Up. */
export default async function SignupPage() {
  const { googleSignIn } = await getAuthOptions();
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
