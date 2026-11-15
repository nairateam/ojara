import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { DeliveryService } from './delivery.service.js';

/** SHELL: Delivery zones, fees and pickup settings. Routes are added with the feature. */
@ApiTags('delivery')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/delivery')
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}
}
