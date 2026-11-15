import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetRequestForm } from '@/components/auth/reset-password-forms';

export const metadata: Metadata = { title: 'Reset password' };

/**
 * 02.03 Reset Password. The design resets by SMS code; until an SMS provider is connected this
 * uses an emailed one-time link (see docs/DECISIONS.md). Same split-screen layout.
 */
export default function ResetPasswordPage() {
  return (
    <AuthShell
      headline="Locked out? We’ll get you back in."
      switchPrompt={{ question: 'Remembered it?', label: 'Log in', href: '/login' }}
      before={
        <Link
          href="/login"
          className="flex w-fit items-center gap-1.5 text-ui font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Back to log in
        </Link>
      }
      title="Reset your password"
      subtitle="Enter the email you use for Ojara and we’ll send you a link to choose a new password."
    >
      <ResetRequestForm />
    </AuthShell>
  );
}
