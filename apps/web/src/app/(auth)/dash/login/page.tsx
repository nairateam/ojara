import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Log in' };

/** 02.01 Log In. */
export default function LoginPage() {
  return (
    <AuthShell
      headline="Welcome back to your market."
      switchPrompt={{ question: 'New to Ojara?', label: 'Create a free store', href: '/signup' }}
      title="Log in"
      subtitle="Manage orders, products and payouts for your store."
    >
      <LoginForm />
    </AuthShell>
  );
}
