import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PLANS,
  type StorefrontCategoryDto,
  type StorefrontListDto,
  type StorefrontProductCardDto,
  type StorefrontProductDto,
  type StorefrontStoreDto,
  storefrontListQuerySchema,
} from '@ojara/shared';
import type { z } from 'zod';
import { PrismaService } from '../database/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { TenantContext } from '../tenancy/tenant-context.js';
import {
  cardPrice,
  variantAvailable,
  variantLowStock,
  variantPrice,
} from './storefront-pricing.js';

type Tx = Prisma.TransactionClient;
type ListQuery = z.output<typeof storefrontListQuerySchema>;

/** Products newer than this are tagged "New". */
const NEW_FOR_MS = 14 * 24 * 60 * 60 * 1000;

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  categoryId: true,
  createdAt: true,
  basePriceKobo: true,
  promoPriceKobo: true,
  trackStock: true,
  sellWhenSoldOut: true,
  lowStockThreshold: true,
  options: true,
  variants: { select: { priceKobo: true, stockQuantity: true, isActive: true } },
  images: {
    select: { cloudinaryPublicId: true },
    orderBy: { position: 'asc' },
    take: 1,
  },
} as const satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

/**
 * Read-only shopper view of a published store. Called by the web server (internal token), so it
 * runs without a session: each call opens the store's tenant context itself and only ever returns
 * published products of a published store.
 */
@Injectable()
export class StorefrontService {
  constructor(private readonly prisma: PrismaService) {}

  private run<T>(storeId: string, fn: (tx: Tx, promotions: boolean) => Promise<T>): Promise<T> {
    return TenantContext.runForStore(storeId, () =>
      this.prisma.tenantTransaction(async (tx) => {
        const store = await tx.store.findUnique({
          where: { id: storeId },
          select: { status: true, plan: { select: { key: true } } },
        });
        if (!store || store.status !== 'PUBLISHED') throw new NotFoundException('Store not found');
        return fn(tx, PLANS[store.plan.key].limits.promotions);
      }),
    );
  }

  private toCard(p: CardRow, promotions: boolean, now: number): StorefrontProductCardDto {
    const price = cardPrice(p, p.variants, promotions);
    const firstOption = (p.options as { name: string; values: string[] }[])[0];
    return {
      slug: p.slug,
      name: p.name,
      priceKobo: price.priceKobo,
      compareAtKobo: price.compareAtKobo,
      priceVaries: price.priceVaries,
      coverPublicId: p.images[0]?.cloudinaryPublicId ?? null,
      optionSummary: firstOption ? firstOption.values.join(' · ') : null,
      soldOut: price.soldOut,
      isNew: now - p.createdAt.getTime() < NEW_FOR_MS,
    };
  }

  private publishedProducts(tx: Tx, storeId: string, where: Prisma.ProductWhereInput = {}) {
    return tx.product.findMany({
      where: { storeId, status: 'PUBLISHED', ...where },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      select: cardSelect,
    });
  }

  private async menuCategories(tx: Tx, storeId: string, products: CardRow[]) {
    const categories = await tx.category.findMany({
      where: { storeId, archivedAt: null, showInMenu: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      select: { id: true, slug: true, name: true, description: true },
    });
    return categories.map((c): StorefrontCategoryDto & { id: string } => {
      const inCategory = products.filter((p) => p.categoryId === c.id);
      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        productCount: inCategory.length,
        coverPublicId: inCategory.find((p) => p.images[0])?.images[0]?.cloudinaryPublicId ?? null,
      };
    });
  }

  /** Store identity and menu for the storefront chrome. */
  async getStore(storeId: string): Promise<StorefrontStoreDto> {
    return this.run(storeId, async (tx) => {
      const store = await tx.store.findUniqueOrThrow({
        where: { id: storeId },
        select: {
          name: true,
          slug: true,
          whatsappNumber: true,
          instagramHandle: true,
          contactEmail: true,
          state: true,
          plan: { select: { key: true } },
        },
      });
      const products = await this.publishedProducts(tx, storeId);
      const categories = await this.menuCategories(tx, storeId, products);
      const { plan, ...rest } = store;
      return {
        ...rest,
        removeBranding: PLANS[plan.key].limits.removeBranding,
        categories: categories.map(({ id: _id, ...c }) => c),
        productCount: products.length,
      };
    });
  }

  /**
   * Listing for /shop and /shop/:category. Filtering and sorting happen in memory: a store has at
   * most a few thousand products (plan limits), and prices depend on variants and the plan.
   */
  async listProducts(storeId: string, query: ListQuery): Promise<StorefrontListDto> {
    return this.run(storeId, async (tx, promotions) => {
      const all = await this.publishedProducts(tx, storeId);
      let category: (StorefrontCategoryDto & { id: string }) | null = null;
      if (query.category) {
        const categories = await this.menuCategories(tx, storeId, all);
        category = categories.find((c) => c.slug === query.category) ?? null;
        if (!category) throw new NotFoundException('Category not found');
      }

      const now = Date.now();
      const q = query.q?.toLowerCase();
      let cards = all
        .filter((p) => !category || p.categoryId === category.id)
        .filter((p) => !q || p.name.toLowerCase().includes(q))
        .map((p) => this.toCard(p, promotions, now))
        .filter((c) => query.min === undefined || c.priceKobo >= query.min)
        .filter((c) => query.max === undefined || c.priceKobo <= query.max)
        .filter((c) => !query.inStock || !c.soldOut);

      if (query.sort === 'price-asc') cards = cards.sort((a, b) => a.priceKobo - b.priceKobo);
      if (query.sort === 'price-desc') cards = cards.sort((a, b) => b.priceKobo - a.priceKobo);

      const start = (query.page - 1) * query.pageSize;
      const { id: _id, ...categoryDto } = category ?? { id: '' };
      return {
        items: cards.slice(start, start + query.pageSize),
        total: cards.length,
        page: query.page,
        pageSize: query.pageSize,
        category: category ? (categoryDto as StorefrontCategoryDto) : null,
      };
    });
  }

  async getProduct(storeId: string, slug: string): Promise<StorefrontProductDto> {
    return this.run(storeId, async (tx, promotions) => {
      const product = await tx.product.findFirst({
        where: { storeId, slug, status: 'PUBLISHED' },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          basePriceKobo: true,
          promoPriceKobo: true,
          trackStock: true,
          sellWhenSoldOut: true,
          lowStockThreshold: true,
          options: true,
          category: { select: { id: true, slug: true, name: true, archivedAt: true } },
          images: {
            select: { cloudinaryPublicId: true, width: true, height: true, alt: true },
            orderBy: { position: 'asc' },
          },
          variants: {
            where: { isActive: true },
            orderBy: { position: 'asc' },
            select: {
              id: true,
              options: true,
              priceKobo: true,
              stockQuantity: true,
              isActive: true,
            },
          },
        },
      });
      if (!product || product.variants.length === 0) {
        throw new NotFoundException('Product not found');
      }

      const variants = product.variants.map((v) => ({
        id: v.id,
        options: v.options as Record<string, string>,
        ...variantPrice(product, v, promotions),
        available: variantAvailable(product, v),
        lowStock: variantLowStock(product, v),
      }));
      const category = product.category && !product.category.archivedAt ? product.category : null;

      const now = Date.now();
      const others = await this.publishedProducts(tx, storeId, { id: { not: product.id } });
      const sameCategory = category ? others.filter((p) => p.categoryId === category.id) : [];
      const related = [...sameCategory, ...others.filter((p) => !sameCategory.includes(p))]
        .slice(0, 4)
        .map((p) => this.toCard(p, promotions, now));

      return {
        slug: product.slug,
        name: product.name,
        description: product.description,
        category: category ? { slug: category.slug, name: category.name } : null,
        images: product.images.map((i) => ({
          publicId: i.cloudinaryPublicId,
          width: i.width,
          height: i.height,
          alt: i.alt,
        })),
        options: product.options as { name: string; values: string[] }[],
        variants,
        soldOut: !variants.some((v) => v.available),
        related,
      };
    });
  }
}
