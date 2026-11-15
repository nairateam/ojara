/**
 * Proves tenant A cannot read or write tenant B's rows, at two layers:
 *  1. Application: the Prisma tenant extension (createTenantClient) connected as `ojara_app`.
 *  2. Database: raw SQL as `ojara_app` (no extension at all), so only Postgres RLS protects data.
 *
 * Requires a migrated database: DATABASE_URL (ojara_app role) and DATABASE_MIGRATION_URL (owner).
 */
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createBaseClient, createTenantClient } from '../src/database/prisma.service.js';
import { CrossTenantAccessError } from '../src/database/tenant-prisma.extension.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { TenantContext, TenantContextMissingError } from '../src/tenancy/tenant-context.js';

try {
  process.loadEnvFile('.env');
} catch {
  // CI provides env vars directly
}

const APP_URL = process.env.DATABASE_URL;
const OWNER_URL = process.env.DATABASE_MIGRATION_URL;
if (!APP_URL || !OWNER_URL) throw new Error('DATABASE_URL and DATABASE_MIGRATION_URL are required');

const owner = new PrismaClient({ adapter: new PrismaPg({ connectionString: OWNER_URL }) });
const appBase = createBaseClient(APP_URL);
const db = createTenantClient(appBase);

const run = randomUUID().slice(0, 8);
const ids = { storeA: '', storeB: '', productA: '', productB: '' };

beforeAll(async () => {
  const plan = await owner.plan.upsert({
    where: { key: 'FREE' },
    update: {},
    create: { key: 'FREE', name: 'Free', priceKobo: 0, limits: {} },
  });
  const [a, b] = await Promise.all(
    ['a', 'b'].map((suffix) =>
      owner.store.create({ data: { name: `Iso ${suffix}`, slug: `iso-${suffix}-${run}`, planId: plan.id } }),
    ),
  );
  if (!a || !b) throw new Error('store setup failed');
  ids.storeA = a.id;
  ids.storeB = b.id;
  const pa = await owner.product.create({ data: { storeId: a.id, name: 'A product', slug: 'a', basePriceKobo: 100 } });
  const pb = await owner.product.create({ data: { storeId: b.id, name: 'B product', slug: 'b', basePriceKobo: 200 } });
  ids.productA = pa.id;
  ids.productB = pb.id;
});

afterAll(async () => {
  await owner.store.deleteMany({ where: { id: { in: [ids.storeA, ids.storeB] } } });
  await Promise.all([owner.$disconnect(), appBase.$disconnect()]);
});

describe('connection role', () => {
  it('the app connects as a role that cannot bypass RLS', async () => {
    const [role] = await appBase.$queryRaw<{ rolsuper: boolean; rolbypassrls: boolean }[]>`
      SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user`;
    expect(role).toEqual({ rolsuper: false, rolbypassrls: false });
  });
});

describe('application layer (Prisma tenant extension)', () => {
  it('only returns the current tenant rows', async () => {
    const rows = await TenantContext.runForStore(ids.storeA, () =>
      db.product.findMany({ where: { id: { in: [ids.productA, ids.productB] } } }),
    );
    expect(rows.map((r) => r.id)).toEqual([ids.productA]);
  });

  it('rejects an explicit filter for another tenant', async () => {
    await expect(
      TenantContext.runForStore(ids.storeA, () => db.product.findMany({ where: { storeId: ids.storeB } })),
    ).rejects.toBeInstanceOf(CrossTenantAccessError);
  });

  it('cannot read another tenant row by id', async () => {
    const row = await TenantContext.runForStore(ids.storeA, () => db.product.findUnique({ where: { id: ids.productB } }));
    expect(row).toBeNull();
  });

  it('cannot update or delete another tenant rows', async () => {
    const updated = await TenantContext.runForStore(ids.storeA, () =>
      db.product.updateMany({ where: { id: ids.productB }, data: { name: 'hacked' } }),
    );
    expect(updated.count).toBe(0);
    await expect(
      TenantContext.runForStore(ids.storeA, () => db.product.delete({ where: { id: ids.productB } })),
    ).rejects.toThrow();
    const b = await owner.product.findUniqueOrThrow({ where: { id: ids.productB } });
    expect(b.name).toBe('B product');
  });

  it('cannot create rows for another tenant', async () => {
    await expect(
      TenantContext.runForStore(ids.storeA, () =>
        db.product.create({ data: { storeId: ids.storeB, name: 'x', slug: `x-${run}`, basePriceKobo: 1 } }),
      ),
    ).rejects.toBeInstanceOf(CrossTenantAccessError);
  });

  it('stamps the tenant storeId on creates', async () => {
    const created = await TenantContext.runForStore(ids.storeA, () =>
      db.category.create({ data: { name: 'Bags', slug: `bags-${run}` } as { name: string; slug: string; storeId: string } }),
    );
    expect(created.storeId).toBe(ids.storeA);
  });

  it('refuses tenant queries with no tenant context', async () => {
    await expect(db.product.findMany()).rejects.toBeInstanceOf(TenantContextMissingError);
    await expect(db.store.findMany()).rejects.toBeInstanceOf(TenantContextMissingError);
  });

  it('system context (explicit opt-out) sees every tenant', async () => {
    const rows = await TenantContext.runAsSystem('test', () =>
      db.product.findMany({ where: { id: { in: [ids.productA, ids.productB] } } }),
    );
    expect(rows).toHaveLength(2);
  });
});

describe('database layer (Postgres RLS, raw SQL as ojara_app)', () => {
  async function withTenantTx<T>(storeId: string | null, fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
    const pool = new pg.Pool({ connectionString: APP_URL, max: 1 });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (storeId) await client.query(`SELECT set_config('app.current_store_id', $1, true)`, [storeId]);
      return await fn(client);
    } finally {
      await client.query('ROLLBACK').catch(() => undefined);
      client.release();
      await pool.end();
    }
  }

  it('returns no tenant rows without a tenant setting', async () => {
    const res = await withTenantTx(null, (c) =>
      c.query('SELECT id FROM products WHERE id = ANY($1)', [[ids.productA, ids.productB]]),
    );
    expect(res.rowCount).toBe(0);
  });

  it('only exposes the current tenant rows, even for an explicit id lookup', async () => {
    const res = await withTenantTx(ids.storeA, (c) =>
      c.query('SELECT id FROM products WHERE id = ANY($1)', [[ids.productA, ids.productB]]),
    );
    expect(res.rows.map((r: { id: string }) => r.id)).toEqual([ids.productA]);
    const stores = await withTenantTx(ids.storeA, (c) => c.query('SELECT id FROM stores WHERE id = $1', [ids.storeB]));
    expect(stores.rowCount).toBe(0);
  });

  it('cannot update or delete another tenant rows', async () => {
    const upd = await withTenantTx(ids.storeA, (c) =>
      c.query(`UPDATE products SET name = 'hacked' WHERE id = $1`, [ids.productB]),
    );
    expect(upd.rowCount).toBe(0);
    const del = await withTenantTx(ids.storeA, (c) => c.query('DELETE FROM products WHERE id = $1', [ids.productB]));
    expect(del.rowCount).toBe(0);
  });

  it('rejects inserting a row for another tenant (WITH CHECK)', async () => {
    await expect(
      withTenantTx(ids.storeA, (c) =>
        c.query(
          `INSERT INTO products (id, "storeId", name, slug, "basePriceKobo", "updatedAt") VALUES ($1, $2, 'x', $3, 1, now())`,
          [randomUUID(), ids.storeB, `rls-${run}`],
        ),
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('rejects moving a row to another tenant', async () => {
    await expect(
      withTenantTx(ids.storeA, (c) => c.query('UPDATE products SET "storeId" = $1 WHERE id = $2', [ids.storeB, ids.productA])),
    ).rejects.toMatchObject({ code: '42501' });
  });
});
