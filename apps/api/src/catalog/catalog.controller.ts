import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  type CategoryCreateInput,
  categoryCreateSchema,
  categoryListSchema,
  categoryOrderSchema,
  type CategoryUpdateInput,
  categoryUpdateSchema,
  categorySchema,
  type ProductInput,
  productDetailSchema,
  productInputSchema,
  type ProductListQuery,
  productListQuerySchema,
  productListSchema,
} from '@ojara/shared';
import type { AuthUser } from '../auth/auth.types.js';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { StoreRoles } from '../common/decorators/roles.decorator.js';
import { CatalogService } from './catalog.service.js';

/**
 * Products (with variants) and categories. Any store member can manage the catalogue; archiving a
 * category is for owners and managers.
 */
@ApiTags('catalog')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('products')
  async listProducts(
    @Param('storeId') storeId: string,
    @Query({ schema: productListQuerySchema }) query: ProductListQuery,
  ) {
    return productListSchema.parse(await this.catalog.listProducts(storeId, query));
  }

  @Get('products/:productId')
  async getProduct(@Param('storeId') storeId: string, @Param('productId') productId: string) {
    return productDetailSchema.parse(await this.catalog.getProduct(storeId, productId));
  }

  @Post('products')
  async createProduct(
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: productInputSchema }) body: ProductInput,
  ) {
    return productDetailSchema.parse(await this.catalog.createProduct(storeId, user.id, body));
  }

  @Put('products/:productId')
  async updateProduct(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: productInputSchema }) body: ProductInput,
  ) {
    return productDetailSchema.parse(
      await this.catalog.updateProduct(storeId, user.id, productId, body),
    );
  }

  @Post('products/:productId/archive')
  @HttpCode(200)
  async archiveProduct(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return productDetailSchema.parse(
      await this.catalog.archiveProduct(storeId, user.id, productId),
    );
  }

  @Post('products/:productId/restore')
  @HttpCode(200)
  async restoreProduct(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return productDetailSchema.parse(
      await this.catalog.restoreProduct(storeId, user.id, productId),
    );
  }

  @Get('categories')
  async listCategories(@Param('storeId') storeId: string) {
    return categoryListSchema.parse(await this.catalog.listCategories(storeId));
  }

  @Post('categories')
  async createCategory(
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: categoryCreateSchema }) body: CategoryCreateInput,
  ) {
    return categorySchema.parse(await this.catalog.createCategory(storeId, user.id, body));
  }

  /** Menu order: every active category id, in order. Declared before :categoryId routes. */
  @Put('categories/order')
  @HttpCode(204)
  async reorderCategories(
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: categoryOrderSchema }) body: { ids: string[] },
  ) {
    await this.catalog.reorderCategories(storeId, user.id, body.ids);
  }

  @Patch('categories/:categoryId')
  @HttpCode(204)
  async updateCategory(
    @Param('storeId') storeId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: categoryUpdateSchema }) body: CategoryUpdateInput,
  ) {
    await this.catalog.updateCategory(storeId, user.id, categoryId, body);
  }

  @Post('categories/:categoryId/archive')
  @HttpCode(204)
  @StoreRoles('OWNER', 'MANAGER')
  async archiveCategory(
    @Param('storeId') storeId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.catalog.setCategoryArchived(storeId, user.id, categoryId, true);
  }

  @Post('categories/:categoryId/restore')
  @HttpCode(204)
  async restoreCategory(
    @Param('storeId') storeId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.catalog.setCategoryArchived(storeId, user.id, categoryId, false);
  }
}
