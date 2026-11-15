import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  type CreateStoreInput,
  DEFAULT_PLAN_KEY,
  isReservedSlug,
  type StoreDto,
  type StoreMembershipDto,
  type StoreSummaryDto,
} from '@ojara/shared';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { TenantContext } from '../tenancy/tenant-context.js';

type StoreRow = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  country: string;
  status: StoreDto['status'];
  createdAt: Date;
};

function toDto(store: StoreRow): StoreDto {
  return { ...store, createdAt: store.createdAt.toISOString() };
}

const storeSelect = {
  id: true,
  name: true,
  slug: true,
  currency: true,
  country: true,
  status: true,
  createdAt: true,
} as const;

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a store with the caller as OWNER on the Free plan. Runs as a system operation because
   * the tenant does not exist yet; every row written carries the new store's id.
   */
  async create(userId: string, input: CreateStoreInput): Promise<StoreDto> {
    // Defence in depth: the Zod schema already rejects reserved slugs.
    if (isReservedSlug(input.slug)) throw new ConflictException('This store address is reserved');

    return TenantContext.runAsSystem('store-create', () =>
      this.prisma.tenantTransaction(async (tx) => {
        const plan = await tx.plan.findUniqueOrThrow({ where: { key: DEFAULT_PLAN_KEY } });
        try {
          const store = await tx.store.create({
            data: {
              name: input.name,
              slug: input.slug,
              currency: input.currency,
              country: input.country,
              contactEmail: input.contactEmail ?? null,
              contactPhone: input.contactPhone ?? null,
              planId: plan.id,
            },
            select: storeSelect,
          });
          await tx.storeMember.create({ data: { storeId: store.id, userId, role: 'OWNER' } });
          await tx.subscription.create({
            data: { storeId: store.id, planId: plan.id, status: 'ACTIVE' },
          });
          await tx.auditLog.create({
            data: {
              storeId: store.id,
              actorId: userId,
              action: 'store.created',
              entity: 'Store',
              entityId: store.id,
            },
          });
          return toDto(store);
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
            throw new ConflictException('That store address is already taken');
          }
          throw err;
        }
      }),
    );
  }

  /** Stores the user belongs to (across tenants, so filtered explicitly by userId). */
  async listForUser(userId: string): Promise<StoreMembershipDto[]> {
    const memberships = await TenantContext.runAsSystem('list-my-stores', () =>
      this.prisma.db.storeMember.findMany({
        where: { userId },
        include: { store: { select: storeSelect } },
        orderBy: { createdAt: 'asc' },
      }),
    );
    return memberships.map((m) => ({ ...toDto(m.store), role: m.role }));
  }

  /** Current tenant's store. Must be called inside a tenant context (StoreAccessGuard). */
  async getCurrent(storeId: string): Promise<StoreDto> {
    const store = await this.prisma.db.store.findUnique({
      where: { id: storeId },
      select: storeSelect,
    });
    if (!store) throw new NotFoundException();
    return toDto(store);
  }

  /**
   * Shell data for the dashboard: plan, product usage and paid orders awaiting fulfilment.
   * Must be called inside a tenant context (StoreAccessGuard); RLS scopes every count.
   */
  async getSummary(storeId: string): Promise<StoreSummaryDto> {
    // One transaction for all three reads: each extended-client query opens its own transaction
    // (to apply the tenant setting), and three at once can time out waiting for a connection.
    const { store, productCount, openOrders } = await this.prisma.tenantTransaction(async (tx) => ({
      store: await tx.store.findUnique({
        where: { id: storeId },
        select: { ...storeSelect, plan: { select: { key: true } } },
      }),
      productCount: await tx.product.count({ where: { storeId, archivedAt: null } }),
      openOrders: await tx.order.count({
        where: {
          storeId,
          paymentStatus: 'PAID',
          fulfilmentStatus: { in: ['PENDING', 'PROCESSING', 'READY_FOR_DISPATCH'] },
        },
      }),
    }));
    if (!store) throw new NotFoundException();
    const { plan, ...row } = store;
    return { store: toDto(row), plan: plan.key, productCount, openOrders };
  }
}
