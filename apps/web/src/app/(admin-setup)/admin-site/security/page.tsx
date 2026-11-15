import type { Metadata } from 'next';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { TwoFactorSetup } from '@/components/auth/two-factor-setup';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Two-step sign-in' };

/**
 * Admin two-factor enrolment (not in the designs). The API refuses every admin route until the
 * account has two-factor enabled, so admins land here after their first sign-in.
 */
export default function AdminSecurityPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Set up two-step sign-in"
        subtitle="Admin accounts must use an authenticator app. It takes about a minute."
      />
      <Card>
        <TwoFactorSetup doneHref="/" />
      </Card>
    </PageContainer>
  );
}
