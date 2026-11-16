import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppConfigService } from '../config/app-config.service.js';
import { type Prisma, PrismaClient } from '../generated/prisma/client.js';
import { TenantContext, TenantContextMissingError } from '../tenancy/tenant-context.js';
import { tenantExtension } from './tenant-prisma.extension.js';

/**
 * Every tenant query runs in a short transaction (to apply the RLS setting). Prisma's default 2 s
 * wait to *start* one is too short when the database is waking up (Neon suspends idle compute;
 * resuming takes a few seconds), which failed the first request after a quiet period.
 */
export const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 15_000 } as const;

export function createBaseClient(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    transactionOptions: TRANSACTION_OPTIONS,
  });
}

export function createTenantClient(base: PrismaClient) {
  return base.$extends(tenantExtension(base));
}

export type TenantPrismaClient = ReturnType<typeof createTenantClient>;

/**
 * Owns the database connection (as the non-superuser `ojara_app` role).
 *
 * - `db`: the tenant-scoped client. Use this for all application queries.
 * - `tenantTransaction()`: interactive transaction with RLS settings applied, for multi-step
 *   atomic work and raw SQL.
 * - `base`: unscoped client. Only for Better Auth (global auth tables) and health checks.
 */
@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly base: PrismaClient;
  readonly db: TenantPrismaClient;

  constructor(config: AppConfigService) {
    this.base = createBaseClient(config.env.DATABASE_URL);
    this.db = createTenantClient(this.base);
  }

  /**
   * Runs `fn` in one transaction with the current tenant (or system bypass) applied via
   * SET LOCAL-equivalent `set_config(..., true)`. RLS is the guard here: queries on `tx` are not
   * rewritten by the extension, so always include `storeId` in writes.
   */
  async tenantTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    const ctx = TenantContext.get();
    if (!ctx?.bypass && !ctx?.storeId) throw new TenantContextMissingError('transaction', 'run');
    return this.base.$transaction(async (tx) => {
      if (ctx.bypass) {
        await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', true)`;
      } else {
        await tx.$executeRaw`SELECT set_config('app.current_store_id', ${ctx.storeId}, true)`;
      }
      return fn(tx);
    });
  }

  async ping(): Promise<boolean> {
    await this.base.$queryRaw`SELECT 1`;
    return true;
  }

  async onModuleDestroy(): Promise<void> {
    await this.base.$disconnect();
  }
}
