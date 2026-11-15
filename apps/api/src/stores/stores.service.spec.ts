import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { TenantContext } from '../tenancy/tenant-context.js';
import { StoresService } from './stores.service.js';

const createdAt = new Date('2026-11-15T10:00:00Z');
const store = {
  id: 'store_1',
  name: 'Ada Bakes',
  slug: 'ada-bakes',
  currency: 'NGN',
  country: 'NG',
  status: 'DRAFT' as const,
  createdAt,
};

function setup(opts: { storeCreate?: () => Promise<unknown> } = {}) {
  const tx = {
    plan: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'plan_free' }) },
    store: { create: vi.fn(opts.storeCreate ?? (() => Promise.resolve(store))) },
    storeMember: { create: vi.fn().mockResolvedValue({}) },
    subscription: { create: vi.fn().mockResolvedValue({}) },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };
  const prisma = {
    // Runs the callback with the fake transaction client, recording the active tenant context.
    tenantTransaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => {
      expect(TenantContext.get()?.bypass).toBe(true);
      return fn(tx);
    }),
    db: {
      storeMember: {
        findMany: vi.fn().mockResolvedValue([{ role: 'OWNER', store }]),
      },
    },
  } as unknown as PrismaService;
  return { service: new StoresService(prisma), tx, prisma };
}

const input = { name: 'Ada Bakes', slug: 'ada-bakes', currency: 'NGN', country: 'NG' } as const;

describe('StoresService', () => {
  it('creates the store with the caller as OWNER on the Free plan, in one system transaction', async () => {
    const { service, tx } = setup();
    await expect(service.create('user_1', input)).resolves.toEqual({
      ...store,
      createdAt: createdAt.toISOString(),
    });
    expect(tx.plan.findUniqueOrThrow).toHaveBeenCalledWith({ where: { key: 'FREE' } });
    expect(tx.storeMember.create).toHaveBeenCalledWith({
      data: { storeId: 'store_1', userId: 'user_1', role: 'OWNER' },
    });
    expect(tx.subscription.create).toHaveBeenCalledWith({
      data: { storeId: 'store_1', planId: 'plan_free', status: 'ACTIVE' },
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ storeId: 'store_1', action: 'store.created' }),
    });
  });

  it('rejects reserved slugs before touching the database', async () => {
    const { service, prisma } = setup();
    await expect(service.create('user_1', { ...input, slug: 'admin' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.tenantTransaction).not.toHaveBeenCalled();
  });

  it('turns a duplicate slug into a 409', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
    const { service } = setup({ storeCreate: () => Promise.reject(duplicate) });
    await expect(service.create('user_1', input)).rejects.toThrow(
      'That store address is already taken',
    );
  });

  it('lists the stores a user belongs to with their role', async () => {
    const { service } = setup();
    await expect(service.listForUser('user_1')).resolves.toEqual([
      { ...store, createdAt: createdAt.toISOString(), role: 'OWNER' },
    ]);
  });
});
