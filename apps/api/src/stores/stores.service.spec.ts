import { ConflictException, NotFoundException } from '@nestjs/common';
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
  category: 'food',
  state: 'Lagos',
  whatsappNumber: '+2348035550144',
  instagramHandle: null,
  primaryColor: null,
  onboardingStep: 1,
  onboardingCompletedAt: null as Date | null,
  createdAt,
};
const dto = { ...store, onboardingCompletedAt: null, createdAt: createdAt.toISOString() };

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError(`Prisma ${code}`, {
    code,
    clientVersion: 'test',
  });
}

function setup(
  opts: {
    storeCreate?: () => Promise<unknown>;
    storeUpdate?: (args: { data: Record<string, unknown> }) => Promise<unknown>;
    existingSlugs?: string[];
    current?: (Partial<Omit<typeof store, 'status'>> & { status?: string }) | null;
  } = {},
) {
  const tx = {
    plan: { findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'plan_free' }) },
    store: {
      create: vi.fn(opts.storeCreate ?? (() => Promise.resolve(store))),
      findMany: vi.fn(() => Promise.resolve((opts.existingSlugs ?? []).map((slug) => ({ slug })))),
      findUnique: vi.fn(() => Promise.resolve(opts.current === undefined ? store : opts.current)),
      findUniqueOrThrow: vi.fn().mockResolvedValue(store),
      update: vi.fn(
        opts.storeUpdate ??
          ((args: { data: Record<string, unknown> }) =>
            Promise.resolve({ ...store, ...args.data })),
      ),
    },
    storeMember: { create: vi.fn().mockResolvedValue({}) },
    subscription: { create: vi.fn().mockResolvedValue({}) },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };
  const tenantModes: string[] = [];
  const prisma = {
    // Runs the callback with the fake transaction client, recording the active tenant context.
    tenantTransaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => {
      const ctx = TenantContext.get();
      tenantModes.push(ctx?.bypass ? 'system' : (ctx?.storeId ?? 'none'));
      return fn(tx);
    }),
    db: {
      storeMember: {
        findMany: vi.fn().mockResolvedValue([{ role: 'OWNER', store }]),
      },
      store: {
        findUnique: vi.fn(({ where }: { where: { slug: string } }) =>
          Promise.resolve(where.slug === 'taken-shop' ? { id: 'store_other' } : null),
        ),
      },
    },
  } as unknown as PrismaService;
  return { service: new StoresService(prisma), tx, prisma, tenantModes };
}

const input = { name: 'Ada Bakes', slug: 'ada-bakes', currency: 'NGN', country: 'NG' } as const;
const inStore = <T>(fn: () => Promise<T>) => TenantContext.runForStore('store_1', fn, 'user_1');

describe('StoresService.create', () => {
  it('creates the store with the caller as OWNER on the Free plan, in one system transaction', async () => {
    const { service, tx, tenantModes } = setup();
    await expect(service.create('user_1', input)).resolves.toEqual(dto);
    expect(tenantModes).toEqual(['system']);
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

  it('generates a free slug from the name when none is given', async () => {
    const { service, tx } = setup({ existingSlugs: ['adunni-threads', 'adunni-threads-2'] });
    await service.create('user_1', { name: 'Adùnní Threads', currency: 'NGN', country: 'NG' });
    expect(tx.store.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slug: 'adunni-threads-3' }) }),
    );
  });

  it('rejects reserved slugs before touching the database', async () => {
    const { service, prisma } = setup();
    await expect(service.create('user_1', { ...input, slug: 'admin' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.tenantTransaction).not.toHaveBeenCalled();
  });

  it('turns a duplicate slug into a 409', async () => {
    const { service } = setup({ storeCreate: () => Promise.reject(prismaError('P2002')) });
    await expect(service.create('user_1', input)).rejects.toThrow(
      'That store address is already taken',
    );
  });
});

describe('StoresService reads', () => {
  it('lists the stores a user belongs to with their role', async () => {
    const { service } = setup();
    await expect(service.listForUser('user_1')).resolves.toEqual([{ ...dto, role: 'OWNER' }]);
  });

  it('reports slug availability', async () => {
    const { service } = setup();
    await expect(service.slugAvailability('Fresh-Shop')).resolves.toEqual({
      slug: 'fresh-shop',
      available: true,
    });
    await expect(service.slugAvailability('taken-shop')).resolves.toMatchObject({
      available: false,
      reason: 'taken',
    });
    // The store's own current address is fine for that store.
    await expect(service.slugAvailability('taken-shop', 'store_other')).resolves.toMatchObject({
      available: true,
    });
    await expect(service.slugAvailability('admin')).resolves.toMatchObject({
      available: false,
      reason: 'reserved',
    });
    await expect(service.slugAvailability('a!')).resolves.toMatchObject({
      available: false,
      reason: 'invalid',
    });
  });
});

describe('StoresService writes (tenant context)', () => {
  it('updates only the given fields and audits them', async () => {
    const { service, tx, tenantModes } = setup();
    const result = await inStore(() =>
      service.update('store_1', 'user_1', { name: 'Ada Bakery', slug: undefined }),
    );
    expect(result.name).toBe('Ada Bakery');
    expect(tenantModes).toEqual(['store_1']);
    expect(tx.store.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: 'Ada Bakery' } }),
    );
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'store.updated', metadata: { fields: ['name'] } }),
    });
  });

  it('maps a taken slug on update to a 409', async () => {
    const { service } = setup({ storeUpdate: () => Promise.reject(prismaError('P2002')) });
    await expect(
      inStore(() => service.update('store_1', 'user_1', { slug: 'taken-shop' })),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('never moves onboarding progress backwards', async () => {
    const { service, tx } = setup({ current: { onboardingStep: 4 } });
    await inStore(() => service.recordOnboardingStep('store_1', 2));
    expect(tx.store.update).not.toHaveBeenCalled();
    await inStore(() => service.recordOnboardingStep('store_1', 5));
    expect(tx.store.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { onboardingStep: 5 } }),
    );
  });

  it('publishes a draft store, completing onboarding', async () => {
    const { service, tx } = setup({ current: { status: 'DRAFT', onboardingCompletedAt: null } });
    const result = await inStore(() => service.publish('store_1', 'user_1'));
    expect(result.status).toBe('PUBLISHED');
    expect(result.onboardingStep).toBe(6);
    expect(result.onboardingCompletedAt).not.toBeNull();
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'store.published' }),
    });
  });

  it('refuses to publish a suspended store', async () => {
    const { service, tx } = setup({
      current: { status: 'SUSPENDED', onboardingCompletedAt: null },
    });
    await expect(inStore(() => service.publish('store_1', 'user_1'))).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.store.update).not.toHaveBeenCalled();
  });

  it('404s when the store is not visible', async () => {
    const { service } = setup({ current: null });
    await expect(inStore(() => service.publish('store_1', 'user_1'))).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
