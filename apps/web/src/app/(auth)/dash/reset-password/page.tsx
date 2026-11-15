import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { FormField } from '@/components/auth/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = { title: 'Reset password' };

/** 02.03 Reset Password — PLACEHOLDER (the SMS-code flow in the design needs an SMS provider). */
export default function ResetPasswordPage() {
  return (
    <AuthShell
      headline="Locked out? We'll get you back in."
      body="We'll send a reset link to the email on your account."
      switchPrompt={{ question: 'Remembered it?', label: 'Log in', href: '/login' }}
      title="Reset your password"
      subtitle="Password reset is coming soon. Contact support if you're locked out."
    >
      <form className="flex flex-col gap-[18px]">
        <FormField id="email" label="Email">
          <Input id="email" name="email" type="email" size="lg" disabled placeholder="you@business.com" />
        </FormField>
        <Button size="lg" className="w-full" disabled>
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
