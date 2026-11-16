import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import {
  storefrontListQuerySchema,
  storefrontListSchema,
  storefrontProductSchema,
  storefrontStoreSchema,
} from '@ojara/shared';
import type { z } from 'zod';
import { InternalTokenGuard } from '../auth/guards/internal-token.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import { StorefrontService } from './storefront.service.js';

/**
 * Shopper-facing catalogue for the web server's storefront pages (internal token, no session).
 * Rate-limited per shopper: the web server forwards the browser's IP.
 */
@ApiTags('internal')
@ApiHeader({ name: 'x-internal-token', required: true })
@Public()
@UseGuards(InternalTokenGuard)
@Controller('internal/storefront/:storeId')
export class StorefrontController {
  constructor(private readonly storefront: StorefrontService) {}

  @Get()
  async store(@Param('storeId') storeId: string) {
    return storefrontStoreSchema.parse(await this.storefront.getStore(storeId));
  }

  @Get('products')
  async products(
    @Param('storeId') storeId: string,
    @Query({ schema: storefrontListQuerySchema })
    query: z.output<typeof storefrontListQuerySchema>,
  ) {
    return storefrontListSchema.parse(await this.storefront.listProducts(storeId, query));
  }

  @Get('products/:slug')
  async product(@Param('storeId') storeId: string, @Param('slug') slug: string) {
    return storefrontProductSchema.parse(await this.storefront.getProduct(storeId, slug));
  }
}
