import { Prisma, type PrismaClient } from '../generated/prisma/client.js';
import { TenantContext, TenantContextMissingError } from '../tenancy/tenant-context.js';
import { GLOBAL_MODELS, TENANT_MODELS, TENANT_ROOT_MODELS } from './tenant-models.js';

/**
 * Prisma operation args are typed per model/operation; inside `$allOperations` they arrive as a
 * union we cannot narrow generically. We treat them as plain records here, which is safe because
 * we only add/override `where.storeId` and `data.storeId` and then hand them back to Prisma.
 */
type Args = Record<string, unknown>;

const WHERE_OPS = new Set([
  'findUnique',
  'findUniqueOrThrow',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'delete',
  'deleteMany',
]);

export class CrossTenantAccessError extends Error {
  constructor(model: string) {
    super(`Refusing to access ${model} of a store other than the current tenant`);
    this.name = 'CrossTenantAccessError';
  }
}

function isRecord(value: unknown): value is Args {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Adds the tenant's storeId to a where clause; an explicit filter for another store is an error. */
function scopeWhere(model: string, where: unknown, storeId: string): Args {
  const base = isRecord(where) ? where : {};
  if (base.storeId !== undefined && base.storeId !== storeId)
    throw new CrossTenantAccessError(model);
  return { ...base, storeId };
}

function scopeData(model: string, data: unknown, storeId: string): Args {
  if (!isRecord(data)) throw new CrossTenantAccessError(model);
  if ('store' in data) {
    // Relation-style writes (`store: { connect }`) could point anywhere; require the scalar.
    throw new CrossTenantAccessError(model);
  }
  if (data.storeId !== undefined && data.storeId !== storeId)
    throw new CrossTenantAccessError(model);
  return { ...data, storeId };
}

/** Returns new args with the tenant's storeId forced into where/data clauses. */
export function scopeArgs(
  model: string,
  operation: string,
  rawArgs: unknown,
  storeId: string,
): Args {
  const args: Args = isRecord(rawArgs) ? { ...rawArgs } : {};

  if (WHERE_OPS.has(operation)) {
    args.where = scopeWhere(model, args.where, storeId);
    if (operation.startsWith('update') && isRecord(args.data) && 'storeId' in args.data) {
      if (args.data.storeId !== storeId) throw new CrossTenantAccessError(model);
    }
    return args;
  }

  switch (operation) {
    case 'create':
      args.data = scopeData(model, args.data, storeId);
      return args;
    case 'createMany':
    case 'createManyAndReturn': {
      const rows: unknown[] = Array.isArray(args.data) ? args.data : [args.data];
      args.data = rows.map((row) => scopeData(model, row, storeId));
      return args;
    }
    case 'upsert':
      args.where = scopeWhere(model, args.where, storeId);
      args.create = scopeData(model, args.create, storeId);
      if (isRecord(args.update) && 'storeId' in args.update && args.update.storeId !== storeId) {
        throw new CrossTenantAccessError(model);
      }
      return args;
    default:
      throw new Error(`Tenant extension does not know how to scope ${model}.${operation}`);
  }
}

/**
 * Application-layer tenant isolation.
 *
 * - Tenant models (storeId column): storeId is injected into every query; writes for another
 *   store are rejected; queries without a tenant context throw TenantContextMissingError.
 * - Store (RLS on id): requires a tenant or system context.
 * - Global models: passed through untouched.
 *
 * Every scoped query runs in a short transaction that first sets the Postgres GUC used by the RLS
 * policies (`set_config(..., true)` == SET LOCAL, which cannot take bind parameters), so the
 * database enforces the same boundary even if this extension has a bug.
 *
 * Limitation: because each query opens its own batch transaction, do not call the extended client
 * inside `$transaction(async (tx) => ...)`. Use PrismaService.tenantTransaction() for multi-step
 * atomic work.
 */
export function tenantExtension(base: PrismaClient) {
  return Prisma.defineExtension({
    name: 'ojara-tenant-isolation',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (GLOBAL_MODELS.has(model)) return query(args);

          const ctx = TenantContext.get();
          if (ctx?.bypass) {
            const [, result] = await base.$transaction([
              base.$executeRaw`SELECT set_config('app.bypass_rls', 'on', true)`,
              query(args),
            ]);
            return result;
          }

          const storeId = ctx?.storeId;
          if (!storeId) throw new TenantContextMissingError(model, operation);

          const scoped = TENANT_MODELS.has(model)
            ? scopeArgs(model, operation, args, storeId)
            : TENANT_ROOT_MODELS.has(model)
              ? args
              : (() => {
                  throw new Error(`Model ${model} is not classified in tenant-models.ts`);
                })();

          const [, result] = await base.$transaction([
            base.$executeRaw`SELECT set_config('app.current_store_id', ${storeId}, true)`,
            // `scoped` has the same shape Prisma expects for this operation (see Args note above).
            query(scoped as typeof args),
          ]);
          return result;
        },
      },
    },
  });
}
