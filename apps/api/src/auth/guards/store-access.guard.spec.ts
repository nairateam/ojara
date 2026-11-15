import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../database/prisma.service.js';
import { TenantContext } from '../../tenancy/tenant-context.js';
import type { AuthenticatedRequest, AuthUser } from '../auth.types.js';
import { StoreAccessGuard } from './store-access.guard.js';

function setup(member: { role: 'OWNER' | 'MANAGER' | 'STAFF' } | null, required?: string[]) {
  const findUnique = vi.fn().mockResolvedValue(member);
  const prisma = { db: { storeMember: { findUnique } } } as unknown as PrismaService;
  const reflector = new Reflector();
  vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(required);
  return { guard: new StoreAccessGuard(reflector, prisma), findUnique };
}

function ctx(req: Partial<AuthenticatedRequest>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

const user: AuthUser = { id: 'u1', email: 'a@b.c', name: 'A', emailVerified: true, role: 'USER' };

describe('StoreAccessGuard', () => {
  it('allows members and binds the tenant context to the store', async () => {
    const { guard } = setup({ role: 'STAFF' });
    const req = { user, params: { storeId: 'store_a' } } as Partial<AuthenticatedRequest>;
    await TenantContext.run(async () => {
      await expect(guard.canActivate(ctx(req))).resolves.toBe(true);
      expect(TenantContext.get()?.storeId).toBe('store_a');
      expect(req.storeMembership).toEqual({ storeId: 'store_a', role: 'STAFF' });
    });
  });

  it('rejects non-members with 403', async () => {
    const { guard } = setup(null);
    const req = { user, params: { storeId: 'store_b' } } as Partial<AuthenticatedRequest>;
    await TenantContext.run(async () => {
      await expect(guard.canActivate(ctx(req))).rejects.toBeInstanceOf(ForbiddenException);
      expect(TenantContext.get()?.storeId).toBeUndefined();
    });
  });

  it('enforces @StoreRoles', async () => {
    const { guard } = setup({ role: 'STAFF' }, ['OWNER', 'MANAGER']);
    const req = { user, params: { storeId: 'store_a' } } as Partial<AuthenticatedRequest>;
    await TenantContext.run(async () => {
      await expect(guard.canActivate(ctx(req))).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
