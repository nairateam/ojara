import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type CategoryDto,
  type CategoryCreateInput,
  type CategoryListDto,
  type CategoryUpdateInput,
  PLANS,
  type ProductDetailDto,
  type ProductInput,
  type ProductListDto,
  type ProductListItemDto,
  type ProductListQuery,
  type ProductOption,
  numberedSlug,
  slugify,
  variantKey,
} from '@ojara/shared';
import { PrismaService } from '../database/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

type Tx = Prisma.TransactionClient;

export const CATALOG_ERROR_CODES = {
  planLimit: 'PLAN_LIMIT_REACHED',
  featureLocked: 'PLAN_FEATURE_LOCKED',
  skuTaken: 'SKU_TAKEN',
} as const;

const variantSelect = {
  id: true,
  options: true,
  sku: true,
  priceKobo: true,
  stockQuantity: true,
  isActive: true,
  position: true,
} as const satisfies Prisma.ProductVariantSelect;

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  showInMenu: true,
  position: true,
  archivedAt: true,
} as const satisfies Prisma.CategorySelect;

function toCategory(
  c: Prisma.CategoryGetPayload<{ select: typeof categorySelect }>,
  productCount: number,
): CategoryDto {
  return { ...c, productCount, archivedAt: c.archivedAt?.toISOString() ?? null };
}

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  categoryId: true,
  basePriceKobo: true,
  promoPriceKobo: true,
  costKobo: true,
  trackStock: true,
  sellWhenSoldOut: true,
  lowStockThreshold: true,
  options: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
  variants: { select: variantSelect, orderBy: { position: 'asc' } },
} as const satisfies Prisma.ProductSelect;

type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

function toDetail(p: ProductRow): ProductDetailDto {
  return {
    ...p,
    // Written only through productInputSchema, so the JSON always has these shapes.
    options: p.options as ProductOption[],
    variants: p.variants.map((v) => ({ ...v, options: v.options as Record<string, string> })),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    archivedAt: p.archivedAt?.toISOString() ?? null,
  };
}

function prismaCode(err: unknown): string | undefined {
  return err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined;
}

/** A duplicate SKU (unique per store) becomes a 409 the editor can show on the SKU field. */
function rethrowSkuConflict(err: unknown): never {
  if (prismaCode(err) === 'P2002') {
    throw new ConflictException({
      message: 'One of these SKUs is already used by another product',
      code: CATALOG_ERROR_CODES.skuTaken,
    });
  }
  throw err;
}

/**
 * Products (with their variants) and categories for one store. Every method runs inside the
 * request's tenant context (StoreAccessGuard); writes use one tenant transaction, where RLS is the
 * guard, so every query also names `storeId` explicitly.
 */
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------- products ---------------------------------- */

  async listProducts(storeId: string, query: ProductListQuery): Promise<ProductListDto> {
    const search: Prisma.ProductWhereInput = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' } },
            { variants: { some: { sku: { contains: query.q, mode: 'insensitive' } } } },
          ],
        }
      : {};
    const where: Prisma.ProductWhereInput = {
      storeId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId
        ? { categoryId: query.categoryId === 'none' ? null : query.categoryId }
        : {}),
      ...search,
    };

    return this.prisma.tenantTransaction(async (tx) => {
      // Sequential: one transaction means one connection.
      const total = await tx.product.count({ where });
      const groups = await tx.product.groupBy({
        by: ['status'],
        where: { storeId },
        _count: { _all: true },
      });
      const rows = await tx.product.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          basePriceKobo: true,
          promoPriceKobo: true,
          trackStock: true,
          lowStockThreshold: true,
          updatedAt: true,
          category: { select: { name: true } },
          variants: { select: { stockQuantity: true, isActive: true } },
        },
      });

      const counts = { ALL: 0, DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 };
      for (const g of groups) {
        counts[g.status] = g._count._all;
        counts.ALL += g._count._all;
      }

      const items: ProductListItemDto[] = rows.map((p) => {
        const active = p.variants.filter((v) => v.isActive);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          status: p.status,
          categoryName: p.category?.name ?? null,
          basePriceKobo: p.basePriceKobo,
          promoPriceKobo: p.promoPriceKobo,
          variantCount: active.length,
          stockTotal: active.reduce((sum, v) => sum + v.stockQuantity, 0),
          lowStockCount: active.filter(
            (v) => v.stockQuantity > 0 && v.stockQuantity <= p.lowStockThreshold,
          ).length,
          outOfStockCount: active.filter((v) => v.stockQuantity === 0).length,
          trackStock: p.trackStock,
          updatedAt: p.updatedAt.toISOString(),
        };
      });

      return { items, total, page: query.page, pageSize: query.pageSize, counts };
    });
  }

  async getProduct(storeId: string, productId: string): Promise<ProductDetailDto> {
    const product = await this.prisma.db.product.findFirst({
      where: { id: productId, storeId },
      select: productSelect,
    });
    if (!product) throw new NotFoundException('Product not found');
    return toDetail(product);
  }

  async createProduct(
    storeId: string,
    actorId: string,
    input: ProductInput,
  ): Promise<ProductDetailDto> {
    try {
      return await this.prisma.tenantTransaction(async (tx) => {
        await this.assertWithinPlan(tx, storeId);
        await this.assertPromotionAllowed(tx, storeId, input);
        await this.assertCategory(tx, storeId, input.categoryId);
        const product = await tx.product.create({
          data: {
            storeId,
            slug: await this.freeProductSlug(tx, storeId, slugify(input.name)),
            ...this.productFields(input),
          },
          select: { id: true },
        });
        await tx.productVariant.createMany({
          data: input.variants.map((v, position) => ({
            storeId,
            productId: product.id,
            options: v.options,
            sku: v.sku,
            priceKobo: v.priceKobo,
            stockQuantity: v.stockQuantity,
            isActive: v.isActive,
            position,
          })),
        });
        await this.audit(tx, storeId, actorId, 'product.created', product.id);
        return toDetail(
          await tx.product.findUniqueOrThrow({ where: { id: product.id }, select: productSelect }),
        );
      });
    } catch (err) {
      rethrowSkuConflict(err);
    }
  }

  /**
   * Replaces a product's details and variant set. Variants are matched by option combination, so
   * an existing size keeps its id (and stock history) when the editor saves; variants no longer
   * listed are deleted (order items keep their own snapshot, so past orders are unaffected).
   */
  async updateProduct(
    storeId: string,
    actorId: string,
    productId: string,
    input: ProductInput,
  ): Promise<ProductDetailDto> {
    try {
      return await this.prisma.tenantTransaction(async (tx) => {
        const existing = await tx.product.findFirst({
          where: { id: productId, storeId },
          select: {
            id: true,
            status: true,
            categoryId: true,
            variants: { select: { id: true, options: true } },
          },
        });
        if (!existing) throw new NotFoundException('Product not found');
        await this.assertPromotionAllowed(tx, storeId, input);
        // Keeping the current category is fine even if it has since been archived.
        if (input.categoryId !== existing.categoryId) {
          await this.assertCategory(tx, storeId, input.categoryId);
        }

        await tx.product.update({
          where: { id: productId },
          data: this.productFields(input, existing.status === 'ARCHIVED'),
        });

        const byKey = new Map(
          existing.variants.map((v) => [variantKey(v.options as Record<string, string>), v.id]),
        );
        const keep = new Set<string>();
        const updates: { id: string; data: Prisma.ProductVariantUpdateInput }[] = [];
        const creates: Prisma.ProductVariantCreateManyInput[] = [];
        input.variants.forEach((v, position) => {
          const fields = {
            options: v.options,
            sku: v.sku,
            priceKobo: v.priceKobo,
            stockQuantity: v.stockQuantity,
            isActive: v.isActive,
            position,
          };
          const id = byKey.get(variantKey(v.options));
          if (id) {
            keep.add(id);
            updates.push({ id, data: fields });
          } else {
            creates.push({ storeId, productId, ...fields });
          }
        });
        const removed = existing.variants.filter((v) => !keep.has(v.id)).map((v) => v.id);

        // Delete first and clear kept SKUs, so SKUs can move between variants in one save.
        if (removed.length) {
          await tx.productVariant.deleteMany({ where: { storeId, id: { in: removed } } });
        }
        if (updates.length) {
          await tx.productVariant.updateMany({
            where: { storeId, id: { in: updates.map((u) => u.id) } },
            data: { sku: null },
          });
        }
        for (const u of updates) {
          await tx.productVariant.update({ where: { id: u.id }, data: u.data });
        }
        if (creates.length) await tx.productVariant.createMany({ data: creates });

        await this.audit(tx, storeId, actorId, 'product.updated', productId, {
          variantsAdded: creates.length,
          variantsRemoved: removed.length,
        });
        return toDetail(
          await tx.product.findUniqueOrThrow({ where: { id: productId }, select: productSelect }),
        );
      });
    } catch (err) {
      rethrowSkuConflict(err);
    }
  }

  /** Hides a product from the storefront and frees its slot in the plan limit. */
  async archiveProduct(storeId: string, actorId: string, productId: string) {
    return this.setArchived(storeId, actorId, productId, true);
  }

  /** Brings an archived product back as a draft (counts against the plan limit again). */
  async restoreProduct(storeId: string, actorId: string, productId: string) {
    return this.setArchived(storeId, actorId, productId, false);
  }

  private async setArchived(
    storeId: string,
    actorId: string,
    productId: string,
    archive: boolean,
  ): Promise<ProductDetailDto> {
    return this.prisma.tenantTransaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, storeId },
        select: { status: true },
      });
      if (!product) throw new NotFoundException('Product not found');
      const isArchived = product.status === 'ARCHIVED';
      if (archive !== isArchived) {
        if (!archive) await this.assertWithinPlan(tx, storeId);
        await tx.product.update({
          where: { id: productId },
          data: archive
            ? { status: 'ARCHIVED', archivedAt: new Date() }
            : { status: 'DRAFT', archivedAt: null },
        });
        await this.audit(
          tx,
          storeId,
          actorId,
          archive ? 'product.archived' : 'product.restored',
          productId,
        );
      }
      return toDetail(
        await tx.product.findUniqueOrThrow({ where: { id: productId }, select: productSelect }),
      );
    });
  }

  /** `archived`: saving an archived product keeps it archived (only restore brings it back). */
  private productFields(input: ProductInput, archived = false) {
    return {
      name: input.name,
      description: input.description,
      status: archived ? ('ARCHIVED' as const) : input.status,
      categoryId: input.categoryId,
      basePriceKobo: input.basePriceKobo,
      promoPriceKobo: input.promoPriceKobo,
      costKobo: input.costKobo,
      trackStock: input.trackStock,
      sellWhenSoldOut: input.sellWhenSoldOut,
      lowStockThreshold: input.lowStockThreshold,
      options: input.options,
    };
  }

  private async planLimits(tx: Tx, storeId: string) {
    const store = await tx.store.findUniqueOrThrow({
      where: { id: storeId },
      select: { plan: { select: { key: true } } },
    });
    return PLANS[store.plan.key].limits;
  }

  /** Sale prices are a Starter feature (pricing page: "Discounts & sale prices"). */
  private async assertPromotionAllowed(tx: Tx, storeId: string, input: ProductInput) {
    if (input.promoPriceKobo === null) return;
    if (!(await this.planLimits(tx, storeId)).promotions) {
      throw new ForbiddenException({
        message: 'Sale prices are available on the Starter plan. Remove the promotional price.',
        code: CATALOG_ERROR_CODES.featureLocked,
      });
    }
  }

  /** Free-plan stores can list a limited number of (non-archived) products. */
  private async assertWithinPlan(tx: Tx, storeId: string) {
    const limit = (await this.planLimits(tx, storeId)).maxProducts;
    const used = await tx.product.count({ where: { storeId, status: { not: 'ARCHIVED' } } });
    if (used >= limit) {
      throw new ForbiddenException({
        message: `Your plan allows ${limit} products. Archive one or upgrade to add more.`,
        code: CATALOG_ERROR_CODES.planLimit,
      });
    }
  }

  private async assertCategory(tx: Tx, storeId: string, categoryId: string | null) {
    if (!categoryId) return;
    const found = await tx.category.findFirst({
      where: { id: categoryId, storeId, archivedAt: null },
      select: { id: true },
    });
    if (!found) throw new BadRequestException('That category no longer exists');
  }

  private async freeProductSlug(tx: Tx, storeId: string, base: string): Promise<string> {
    const rows = await tx.product.findMany({
      where: { storeId, slug: { startsWith: base } },
      select: { slug: true },
    });
    const taken = new Set(rows.map((r) => r.slug));
    let candidate = base;
    for (let n = 2; taken.has(candidate); n++) candidate = numberedSlug(base, n);
    return candidate;
  }

  private audit(
    tx: Tx,
    storeId: string,
    actorId: string,
    action: string,
    entityId: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return tx.auditLog.create({
      data: {
        storeId,
        actorId,
        action,
        entity: action.startsWith('category') ? 'Category' : 'Product',
        entityId,
        ...(metadata ? { metadata } : {}),
      },
    });
  }

  /* --------------------------------- categories --------------------------------- */

  async listCategories(storeId: string): Promise<CategoryListDto> {
    return this.prisma.tenantTransaction(async (tx) => {
      const rows = await tx.category.findMany({
        where: { storeId },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
        select: {
          ...categorySelect,
          _count: { select: { products: { where: { status: { not: 'ARCHIVED' } } } } },
        },
      });
      const uncategorisedCount = await tx.product.count({
        where: { storeId, categoryId: null, status: { not: 'ARCHIVED' } },
      });
      const all = rows.map(({ _count, ...c }) => toCategory(c, _count.products));
      return {
        categories: all.filter((c) => c.archivedAt === null),
        archived: all.filter((c) => c.archivedAt !== null),
        uncategorisedCount,
      };
    });
  }

  async createCategory(
    storeId: string,
    actorId: string,
    input: CategoryCreateInput,
  ): Promise<CategoryDto> {
    return this.prisma.tenantTransaction(async (tx) => {
      const existing = await tx.category.findMany({
        where: { storeId },
        select: { name: true, slug: true, position: true },
      });
      if (existing.some((c) => c.name.toLowerCase() === input.name.toLowerCase())) {
        throw new ConflictException('You already have a category with that name');
      }
      const base = slugify(input.name, 60);
      const taken = new Set(existing.map((c) => c.slug));
      let slug = base;
      for (let n = 2; taken.has(slug); n++) slug = numberedSlug(base, n);
      const position = existing.reduce((max, c) => Math.max(max, c.position + 1), 0);
      const category = await tx.category.create({
        data: {
          storeId,
          name: input.name,
          slug,
          position,
          description: input.description ?? null,
          showInMenu: input.showInMenu ?? true,
        },
        select: categorySelect,
      });
      await this.audit(tx, storeId, actorId, 'category.created', category.id);
      return toCategory(category, 0);
    });
  }

  /**
   * Updates name, description or menu visibility. The slug (storefront URL) never changes, so
   * shared links keep working after a rename.
   */
  async updateCategory(
    storeId: string,
    actorId: string,
    categoryId: string,
    input: CategoryUpdateInput,
  ): Promise<void> {
    await this.prisma.tenantTransaction(async (tx) => {
      if (input.name) {
        const clash = await tx.category.findFirst({
          where: {
            storeId,
            id: { not: categoryId },
            name: { equals: input.name, mode: 'insensitive' },
          },
          select: { id: true },
        });
        if (clash) throw new ConflictException('You already have a category with that name');
      }
      const data = Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined),
      ) as Prisma.CategoryUpdateManyMutationInput;
      const updated = await tx.category.updateMany({ where: { id: categoryId, storeId }, data });
      if (updated.count === 0) throw new NotFoundException('Category not found');
      await this.audit(tx, storeId, actorId, 'category.updated', categoryId, {
        fields: Object.keys(data),
      });
    });
  }

  /**
   * Archive hides a category from the store and the editor's picker; its products keep it, and get
   * it back on restore. Restored categories go to the end of the menu.
   */
  async setCategoryArchived(
    storeId: string,
    actorId: string,
    categoryId: string,
    archive: boolean,
  ): Promise<void> {
    await this.prisma.tenantTransaction(async (tx) => {
      const position = archive
        ? undefined
        : ((
            await tx.category.aggregate({
              where: { storeId, archivedAt: null },
              _max: { position: true },
            })
          )._max.position ?? -1) + 1;
      const updated = await tx.category.updateMany({
        where: { id: categoryId, storeId },
        data: archive ? { archivedAt: new Date() } : { archivedAt: null, position },
      });
      if (updated.count === 0) throw new NotFoundException('Category not found');
      await this.audit(
        tx,
        storeId,
        actorId,
        archive ? 'category.archived' : 'category.restored',
        categoryId,
      );
    });
  }

  /** Sets the menu order from the full list of active category ids. */
  async reorderCategories(storeId: string, actorId: string, ids: string[]): Promise<void> {
    await this.prisma.tenantTransaction(async (tx) => {
      const active = await tx.category.findMany({
        where: { storeId, archivedAt: null },
        select: { id: true },
      });
      const known = new Set(active.map((c) => c.id));
      if (
        ids.length !== known.size ||
        new Set(ids).size !== ids.length ||
        !ids.every((id) => known.has(id))
      ) {
        throw new BadRequestException('The category list changed. Reload and try again.');
      }
      for (const [position, id] of ids.entries()) {
        await tx.category.update({ where: { id }, data: { position } });
      }
      await this.audit(tx, storeId, actorId, 'category.reordered', storeId);
    });
  }
}
