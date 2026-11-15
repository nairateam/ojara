import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Log in' };

/** 02.01 Log In (SMS OTP alternative not built yet). */
export default function LoginPage() {
  return (
    <AuthShell
      headline="Welcome back to your market."
      body="Check new orders, update stock and share your store — all from one place."
      switchPrompt={{ question: 'New to Ojara?', label: 'Create a free store', href: '/signup' }}
      title="Log in"
      subtitle="Use the email you signed up with."
    >
      <LoginForm />
    </AuthShell>
  );
}
