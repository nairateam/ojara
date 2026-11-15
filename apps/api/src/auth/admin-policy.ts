import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { AuthSession, AuthUser } from './auth.types.js';

export const AUTH_ERROR_CODES = {
  twoFactorRequired: 'TWO_FACTOR_REQUIRED',
  adminSessionExpired: 'ADMIN_SESSION_EXPIRED',
} as const;

/**
 * Extra requirements whenever a PLATFORM_ADMIN uses admin powers (admin routes, or access to a
 * store they are not a member of):
 * - two-factor authentication must be enabled on the account, and
 * - the session must be younger than ADMIN_SESSION_MAX_HOURS (absolute, not sliding).
 * Better Auth separately refuses to create admin sessions from Google or email-link sign-in.
 */
export function assertAdminSessionAllowed(
  user: AuthUser,
  session: AuthSession | undefined,
  maxHours: number,
  now: Date = new Date(),
): void {
  if (!user.twoFactorEnabled) {
    throw new ForbiddenException({
      message: 'Set up two-factor authentication to use admin features',
      code: AUTH_ERROR_CODES.twoFactorRequired,
    });
  }
  const startedAt = session?.createdAt.getTime() ?? 0;
  if (now.getTime() - startedAt > maxHours * 60 * 60 * 1000) {
    throw new UnauthorizedException({
      message: 'Your admin session has expired. Please sign in again.',
      code: AUTH_ERROR_CODES.adminSessionExpired,
    });
  }
}
