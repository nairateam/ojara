import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetCodeForm } from '@/components/auth/reset-code-form';
import { ONBOARDING_SELLER } from '@/mock/onboarding';

export const metadata: Metadata = { title: 'Reset password' };

/** 02.03 Reset Password — visual only (the SMS-code flow needs an SMS provider). */
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
          <ArrowLeft className="size-3.5" aria-hidden /> Use a different number
        </Link>
      }
      title="Enter your reset code"
      subtitle={`We sent a 6-digit code by SMS to ${ONBOARDING_SELLER.phoneMasked}. It expires in 10 minutes.`}
    >
      <ResetCodeForm />
    </AuthShell>
  );
}
