import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CatalogService } from './catalog.service.js';

/** SHELL: Products, variants and categories CRUD. Routes are added with the feature. */
@ApiTags('catalog')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/catalog')
export class CatalogController {
  constructor(private readonly service: CatalogService) {}
}
