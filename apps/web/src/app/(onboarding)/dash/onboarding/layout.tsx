import type { ReactNode } from 'react';
import { requireUser } from '@/lib/auth/guards';

/**
 * Onboarding needs an account (signed in) but not a store yet. Saving each step and creating the
 * store (POST /v1/stores) come with the onboarding feature.
 */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return children;
}
