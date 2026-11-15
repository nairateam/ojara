import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { assertAdminSessionAllowed } from './admin-policy.js';
import type { AuthSession, AuthUser } from './auth.types.js';

const admin: AuthUser = {
  id: 'a1',
  email: 'admin@ojara.localhost',
  name: 'Admin',
  emailVerified: true,
  role: 'PLATFORM_ADMIN',
  twoFactorEnabled: true,
};
const now = new Date('2026-11-15T12:00:00Z');
const session = (hoursAgo: number): AuthSession => ({
  id: 's1',
  userId: 'a1',
  createdAt: new Date(now.getTime() - hoursAgo * 3_600_000),
  expiresAt: new Date(now.getTime() + 3_600_000),
});

describe('assertAdminSessionAllowed', () => {
  it('allows an admin with 2FA and a fresh session', () => {
    expect(() => assertAdminSessionAllowed(admin, session(1), 8, now)).not.toThrow();
  });

  it('requires two-factor authentication, with a machine-readable code', () => {
    const noTwoFactor = { ...admin, twoFactorEnabled: false };
    expect(() => assertAdminSessionAllowed(noTwoFactor, session(1), 8, now)).toThrow(
      ForbiddenException,
    );
    try {
      assertAdminSessionAllowed(noTwoFactor, session(1), 8, now);
    } catch (err) {
      expect((err as ForbiddenException).getResponse()).toMatchObject({
        code: 'TWO_FACTOR_REQUIRED',
      });
    }
  });

  it('expires admin sessions after the absolute limit', () => {
    expect(() => assertAdminSessionAllowed(admin, session(9), 8, now)).toThrow(
      UnauthorizedException,
    );
    expect(() => assertAdminSessionAllowed(admin, undefined, 8, now)).toThrow(
      UnauthorizedException,
    );
  });
});
