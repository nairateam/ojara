import { z } from 'zod';
import { clientEnv } from '@/env';
import { apiRequest } from './client';

/** Browser-side API calls. Sends the Better Auth session cookie (shared on *.ROOT_DOMAIN). */
const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  emailVerified: z.boolean(),
});

export function signInWithEmail(email: string, password: string) {
  return apiRequest({
    baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
    path: '/auth/sign-in/email',
    method: 'POST',
    body: { email, password },
    credentials: 'include',
    schema: z.object({ user: authUserSchema }).loose(),
  });
}

export function signUpWithEmail(input: { name: string; email: string; password: string }) {
  return apiRequest({
    baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
    path: '/auth/sign-up/email',
    method: 'POST',
    body: { ...input, callbackURL: `${window.location.origin}/` },
    credentials: 'include',
    schema: z.object({ user: authUserSchema }).loose(),
  });
}
