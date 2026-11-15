import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Admin log in', robots: { index: false } };

/** Admin sign-in (not in the designs): 02.01 layout; password + two-factor only (no Google/SMS). */
export default function AdminLoginPage() {
  return (
    <AuthShell
      headline="Ojara operations."
      body="Platform admin access. Requires two-step sign-in; sessions end after 8 hours and are recorded in the audit log."
      title="Admin log in"
      subtitle="Platform admins only."
    >
      <LoginForm variant="admin" />
    </AuthShell>
  );
}
