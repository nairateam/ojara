import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { AppConfigService } from '../config/app-config.service.js';
import type { PrismaService } from '../database/prisma.service.js';
import { TenancyService } from './tenancy.service.js';
import { TenantContext } from './tenant-context.js';

const demo = {
  id: 'store_demo',
  slug: 'demo',
  name: 'Demo Store',
  status: 'PUBLISHED',
  currency: 'NGN',
  primaryColor: null,
  logoPublicId: null,
};

function setup() {
  const storeFindFirst = vi.fn((args: { where: { slug: string } }) => {
    expect(TenantContext.get()?.bypass).toBe(true);
    return Promise.resolve(args.where.slug === 'demo' ? demo : null);
  });
  const domainFindFirst = vi.fn((args: { where: { hostname: string } }) =>
    Promise.resolve(args.where.hostname === 'shop.adunni.ng' ? { store: { ...demo, archivedAt: null } } : null),
  );
  const prisma = { db: { store: { findFirst: storeFindFirst }, domain: { findFirst: domainFindFirst } } } as unknown as PrismaService;
  const config = { env: { ROOT_DOMAIN: 'ojara.localhost' } } as AppConfigService;
  return new TenancyService(prisma, config);
}

describe('TenancyService.resolveHost', () => {
  it('resolves a store sub-domain', async () => {
    await expect(setup().resolveHost('demo.ojara.localhost:3000')).resolves.toMatchObject({
      storeId: 'store_demo',
      hostname: 'demo.ojara.localhost',
    });
  });

  it('resolves a verified custom domain', async () => {
    await expect(setup().resolveHost('shop.adunni.ng')).resolves.toMatchObject({ hostname: 'shop.adunni.ng' });
  });

  it('404s for unknown stores and platform hosts', async () => {
    const service = setup();
    await expect(service.resolveHost('nope.ojara.localhost')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.resolveHost('app.ojara.localhost')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.resolveHost('ojara.localhost')).rejects.toBeInstanceOf(NotFoundException);
  });
});
