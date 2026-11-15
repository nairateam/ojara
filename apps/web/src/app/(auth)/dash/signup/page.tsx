import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';

export const metadata: Metadata = { title: 'Create your store' };

/** 02.02 Sign Up. */
export default function SignupPage() {
  return (
    <AuthShell
      headline="Your market stall, now open online."
      body="Set up a store in an afternoon. Take payments with Paystack, manage delivery and stock, and keep every order in one place."
      switchPrompt={{ question: 'Already selling on Ojara?', label: 'Log in', href: '/login' }}
      title="Create your free store"
      subtitle="No card needed. You can upgrade any time."
    >
      <SignupForm />
    </AuthShell>
  );
}
