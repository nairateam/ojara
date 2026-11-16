import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  type CreateStoreInput,
  DEFAULT_PLAN_KEY,
  isReservedSlug,
  numberedSlug,
  ONBOARDING_STEP_COUNT,
  type SlugAvailabilityDto,
  type StoreDto,
  type StoreMembershipDto,
  type StoreSummaryDto,
  storeSlugSchema,
  suggestStoreSlug,
  type UpdateStoreInput,
} from '@ojara/shared';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { TenantContext } from '../tenancy/tenant-context.js';

const storeSelect = {
  id: true,
  name: true,
  slug: true,
  currency: true,
  country: true,
  status: true,
  category: true,
  state: true,
  whatsappNumber: true,
  instagramHandle: true,
  primaryColor: true,
  onboardingStep: true,
  onboardingCompletedAt: true,
  createdAt: true,
} as const satisfies Prisma.StoreSelect;

type StoreRow = Prisma.StoreGetPayload<{ select: typeof storeSelect }>;

function toDto(store: StoreRow): StoreDto {
  return {
    ...store,
    // Written only through the validated schemas, so it is always a known category id.
    category: store.category as StoreDto['category'],
    onboardingCompletedAt: store.onboardingCompletedAt?.toISOString() ?? null,
    createdAt: store.createdAt.toISOString(),
  };
}

const SLUG_TAKEN = 'That store address is already taken';

function prismaCode(err: unknown): string | undefined {
  return err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined;
}

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a store with the caller as OWNER on the Free plan. Runs as a system operation because
   * the tenant does not exist yet; every row written carries the new store's id. Without a slug,
   * one is generated from the name and numbered until free ("ada-bakes", "ada-bakes-2", ...).
   */
  async create(userId: string, input: CreateStoreInput): Promise<StoreDto> {
    // Defence in depth: the Zod schema already rejects reserved slugs.
    if (input.slug && isReservedSlug(input.slug)) {
      throw new ConflictException('This store address is reserved');
    }

    return TenantContext.runAsSystem('store-create', () =>
      this.prisma.tenantTransaction(async (tx) => {
        const plan = await tx.plan.findUniqueOrThrow({ where: { key: DEFAULT_PLAN_KEY } });
        const slug = input.slug ?? (await this.freeSlug(tx, suggestStoreSlug(input.name)));
        try {
          const store = await tx.store.create({
            data: {
              name: input.name,
              slug,
              currency: input.currency,
              country: input.country,
              category: input.category ?? null,
              state: input.state ?? null,
              whatsappNumber: input.whatsappNumber ?? null,
              instagramHandle: input.instagramHandle ?? null,
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
          if (prismaCode(err) === 'P2002') throw new ConflictException(SLUG_TAKEN);
          throw err;
        }
      }),
    );
  }

  /** First free slug among base, base-2, base-3, ... (checked across all stores). */
  private async freeSlug(tx: Prisma.TransactionClient, base: string): Promise<string> {
    const rows = await tx.store.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    const taken = new Set(rows.map((s) => s.slug));
    let candidate = base;
    for (let n = 2; taken.has(candidate); n++) candidate = numberedSlug(base, n);
    return candidate;
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
   * Whether a web address can be used. Checked across all stores (system read that reveals only
   * whether the address exists; store addresses are public anyway). `forStoreId` treats that
   * store's own current address as available.
   */
  async slugAvailability(raw: string, forStoreId?: string): Promise<SlugAvailabilityDto> {
    const parsed = storeSlugSchema.safeParse(raw);
    if (!parsed.success) {
      const slug = raw.trim().toLowerCase();
      const reserved = isReservedSlug(slug);
      return {
        slug,
        available: false,
        reason: reserved ? 'reserved' : 'invalid',
        message: reserved
          ? 'This store address is reserved'
          : (parsed.error.issues[0]?.message ?? 'Invalid address'),
      };
    }
    const slug = parsed.data;
    const existing = await TenantContext.runAsSystem('slug-availability', () =>
      this.prisma.db.store.findUnique({ where: { slug }, select: { id: true } }),
    );
    if (existing && existing.id !== forStoreId) {
      return { slug, available: false, reason: 'taken', message: SLUG_TAKEN };
    }
    return { slug, available: true };
  }

  /** Updates store details (tenant context; StoreAccessGuard). Audited with the changed fields. */
  async update(storeId: string, actorId: string, input: UpdateStoreInput): Promise<StoreDto> {
    const data = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined),
    ) as UpdateStoreInput;
    try {
      return await this.prisma.tenantTransaction(async (tx) => {
        const store = await tx.store.update({ where: { id: storeId }, data, select: storeSelect });
        await tx.auditLog.create({
          data: {
            storeId,
            actorId,
            action: 'store.updated',
            entity: 'Store',
            entityId: storeId,
            metadata: { fields: Object.keys(data) },
          },
        });
        return toDto(store);
      });
    } catch (err) {
      if (prismaCode(err) === 'P2002') throw new ConflictException(SLUG_TAKEN);
      if (prismaCode(err) === 'P2025') throw new NotFoundException();
      throw err;
    }
  }

  /** Records the furthest onboarding step reached; never moves backwards. */
  async recordOnboardingStep(storeId: string, step: number): Promise<StoreDto> {
    return this.prisma.tenantTransaction(async (tx) => {
      const current = await tx.store.findUnique({
        where: { id: storeId },
        select: { onboardingStep: true },
      });
      if (!current) throw new NotFoundException();
      const store =
        step > current.onboardingStep
          ? await tx.store.update({
              where: { id: storeId },
              data: { onboardingStep: step },
              select: storeSelect,
            })
          : await tx.store.findUniqueOrThrow({ where: { id: storeId }, select: storeSelect });
      return toDto(store);
    });
  }

  /**
   * Takes the store live and completes onboarding. Suspended or disabled stores can't publish
   * themselves (that is an admin decision).
   */
  async publish(storeId: string, actorId: string): Promise<StoreDto> {
    return this.prisma.tenantTransaction(async (tx) => {
      const current = await tx.store.findUnique({
        where: { id: storeId },
        select: { status: true, onboardingCompletedAt: true },
      });
      if (!current) throw new NotFoundException();
      if (current.status === 'SUSPENDED' || current.status === 'DISABLED') {
        throw new ConflictException('This store can’t be published. Please contact support.');
      }
      const store = await tx.store.update({
        where: { id: storeId },
        data: {
          status: 'PUBLISHED',
          onboardingStep: ONBOARDING_STEP_COUNT,
          onboardingCompletedAt: current.onboardingCompletedAt ?? new Date(),
        },
        select: storeSelect,
      });
      if (current.status !== 'PUBLISHED') {
        await tx.auditLog.create({
          data: { storeId, actorId, action: 'store.published', entity: 'Store', entityId: storeId },
        });
      }
      return toDto(store);
    });
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
