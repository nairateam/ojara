import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Admin log in', robots: { index: false } };

/** Admin sign-in (not in the designs): reuses the 02.01 layout. */
export default function AdminLoginPage() {
  return (
    <AuthShell
      headline="Ojara operations."
      body="Platform admin access. Sessions are logged in the audit log."
      title="Admin log in"
      subtitle="Platform admins only."
    >
      <LoginForm />
    </AuthShell>
  );
}
