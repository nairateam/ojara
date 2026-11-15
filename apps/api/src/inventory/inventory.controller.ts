import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { InventoryService } from './inventory.service.js';

/** SHELL: Stock levels, adjustments and low-stock alerts. Routes are added with the feature. */
@ApiTags('inventory')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}
}
