import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { ProductInput } from '@ojara/shared';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CatalogService } from './catalog.service.js';

const now = new Date('2026-11-16T10:00:00Z');
const row = (over: Record<string, unknown> = {}) => ({
  id: 'p1',
  name: 'Adire Wrap Dress',
  slug: 'adire-wrap-dress',
  description: null,
  status: 'DRAFT',
  categoryId: null,
  basePriceKobo: 1_850_000,
  promoPriceKobo: null,
  costKobo: null,
  trackStock: true,
  sellWhenSoldOut: false,
  lowStockThreshold: 3,
  options: [],
  createdAt: now,
  updatedAt: now,
  archivedAt: null,
  variants: [],
  ...over,
});

const input = (over: Partial<ProductInput> = {}): ProductInput => ({
  name: 'Adire Wrap Dress',
  description: null,
  status: 'PUBLISHED',
  categoryId: null,
  basePriceKobo: 1_850_000,
  promoPriceKobo: null,
  costKobo: null,
  trackStock: true,
  sellWhenSoldOut: false,
  lowStockThreshold: 3,
  options: [{ name: 'Size', values: ['S', 'M'] }],
  variants: [
    { options: { Size: 'S' }, sku: 'ADW-S', priceKobo: null, stockQuantity: 4, isActive: true },
    { options: { Size: 'M' }, sku: 'ADW-M', priceKobo: null, stockQuantity: 2, isActive: true },
  ],
  ...over,
});

function setup(
  opts: {
    plan?: string;
    used?: number;
    existing?: Record<string, unknown> | null;
    variantCreateMany?: () => Promise<unknown>;
    categories?: { name: string; slug: string; position: number }[];
  } = {},
) {
  const tx = {
    store: {
      findUniqueOrThrow: vi.fn().mockResolvedValue({ plan: { key: opts.plan ?? 'FREE' } }),
    },
    product: {
      count: vi.fn().mockResolvedValue(opts.used ?? 0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(opts.existing === undefined ? null : opts.existing),
      create: vi.fn().mockResolvedValue({ id: 'p1' }),
      update: vi.fn().mockResolvedValue({}),
      findUniqueOrThrow: vi.fn().mockResolvedValue(row()),
    },
    productVariant: {
      createMany: vi.fn(opts.variantCreateMany ?? (() => Promise.resolve({ count: 1 }))),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn().mockResolvedValue({}),
    },
    category: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue(opts.categories ?? []),
      create: vi.fn((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: 'c1', ...args.data }),
      ),
    },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
  };
  const prisma = {
    tenantTransaction: vi.fn((fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaService;
  return { service: new CatalogService(prisma), tx };
}

describe('CatalogService products', () => {
  it('creates a product with its variants in order and a unique slug', async () => {
    const { service, tx } = setup();
    tx.product.findMany.mockResolvedValue([{ slug: 'adire-wrap-dress' }]);
    await service.createProduct('s1', 'u1', input());
    expect(tx.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ storeId: 's1', slug: 'adire-wrap-dress-2' }),
      }),
    );
    const calls = tx.productVariant.createMany.mock.calls as unknown as [
      { data: { sku: string; position: number; storeId: string }[] },
    ][];
    const variants = calls[0]![0];
    expect(variants.data.map((v) => [v.sku, v.position, v.storeId])).toEqual([
      ['ADW-S', 0, 's1'],
      ['ADW-M', 1, 's1'],
    ]);
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'product.created', entity: 'Product' }),
    });
  });

  it('refuses new products at the plan limit (Free: 20)', async () => {
    const { service, tx } = setup({ used: 20 });
    const err = await service.createProduct('s1', 'u1', input()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ForbiddenException);
    expect((err as ForbiddenException).getResponse()).toMatchObject({ code: 'PLAN_LIMIT_REACHED' });
    expect(tx.product.create).not.toHaveBeenCalled();
  });

  it('allows sale prices on Starter but not on Free', async () => {
    const free = setup({ plan: 'FREE' });
    const err = await free.service
      .createProduct('s1', 'u1', input({ promoPriceKobo: 1_500_000 }))
      .catch((e: unknown) => e);
    expect((err as ForbiddenException).getResponse()).toMatchObject({
      code: 'PLAN_FEATURE_LOCKED',
    });
    const starter = setup({ plan: 'STARTER' });
    await starter.service.createProduct('s1', 'u1', input({ promoPriceKobo: 1_500_000 }));
    expect(starter.tx.product.create).toHaveBeenCalled();
  });

  it('turns a duplicate SKU into a 409 with SKU_TAKEN', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'test',
    });
    const { service } = setup({ variantCreateMany: () => Promise.reject(duplicate) });
    const err = await service.createProduct('s1', 'u1', input()).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ConflictException);
    expect((err as ConflictException).getResponse()).toMatchObject({ code: 'SKU_TAKEN' });
  });

  it('keeps matching variants, adds new ones and removes the rest on save', async () => {
    const { service, tx } = setup({
      existing: {
        id: 'p1',
        status: 'PUBLISHED',
        variants: [
          { id: 'v-s', options: { Size: 'S' } },
          { id: 'v-xl', options: { Size: 'XL' } },
        ],
      },
    });
    await service.updateProduct('s1', 'u1', 'p1', input());
    expect(tx.productVariant.deleteMany).toHaveBeenCalledWith({
      where: { storeId: 's1', id: { in: ['v-xl'] } },
    });
    expect(tx.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'v-s' },
      data: expect.objectContaining({ sku: 'ADW-S', stockQuantity: 4, position: 0 }),
    });
    expect(tx.productVariant.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ options: { Size: 'M' }, productId: 'p1', position: 1 })],
    });
  });

  it('keeps an archived product archived when it is edited', async () => {
    const { service, tx } = setup({ existing: { id: 'p1', status: 'ARCHIVED', variants: [] } });
    await service.updateProduct('s1', 'u1', 'p1', input({ status: 'PUBLISHED' }));
    expect(tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ARCHIVED' }) }),
    );
  });

  it('404s for a product in another store (not visible)', async () => {
    const { service } = setup({ existing: null });
    await expect(service.updateProduct('s1', 'u1', 'nope', input())).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('checks the plan limit when restoring, not when archiving', async () => {
    const archived = setup({ existing: { status: 'ARCHIVED' }, used: 20 });
    await expect(archived.service.restoreProduct('s1', 'u1', 'p1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    const live = setup({ existing: { status: 'PUBLISHED' }, used: 20 });
    await live.service.archiveProduct('s1', 'u1', 'p1');
    expect(live.tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ARCHIVED' }) }),
    );
  });
});

describe('CatalogService categories', () => {
  it('adds a category at the end with a unique slug', async () => {
    const { service, tx } = setup({
      categories: [{ name: 'Dresses', slug: 'dresses', position: 0 }],
    });
    const created = await service.createCategory('s1', 'u1', { name: 'Headwear' });
    expect(created).toMatchObject({ name: 'Headwear', slug: 'headwear', position: 1 });
    expect(tx.category.create).toHaveBeenCalled();
  });

  it('reorders only when given exactly the active categories', async () => {
    const { service, tx } = setup();
    tx.category.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }]);
    const update = vi.fn().mockResolvedValue({});
    Object.assign(tx.category, { update });

    await expect(service.reorderCategories('s1', 'u1', ['a'])).rejects.toThrow('changed');
    await expect(service.reorderCategories('s1', 'u1', ['a', 'a'])).rejects.toThrow('changed');
    await expect(service.reorderCategories('s1', 'u1', ['a', 'x'])).rejects.toThrow('changed');
    expect(update).not.toHaveBeenCalled();

    await service.reorderCategories('s1', 'u1', ['b', 'a']);
    expect(update.mock.calls).toEqual([
      [{ where: { id: 'b' }, data: { position: 0 } }],
      [{ where: { id: 'a' }, data: { position: 1 } }],
    ]);
  });

  it('rejects a duplicate category name (any case)', async () => {
    const { service } = setup({
      categories: [{ name: 'Dresses', slug: 'dresses', position: 0 }],
    });
    await expect(service.createCategory('s1', 'u1', { name: 'dresses' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
