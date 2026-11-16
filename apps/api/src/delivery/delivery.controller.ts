import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  type DeliverySettingsInput,
  deliverySettingsInputSchema,
  deliverySettingsSchema,
} from '@ojara/shared';
import type { AuthUser } from '../auth/auth.types.js';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { StoreRoles } from '../common/decorators/roles.decorator.js';
import { DeliveryService } from './delivery.service.js';

/** Delivery zones, pickup and order notes (03.11). Changing them is for owners and managers. */
@ApiTags('delivery')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/delivery')
export class DeliveryController {
  constructor(private readonly delivery: DeliveryService) {}

  @Get()
  async get(@Param('storeId') storeId: string) {
    return deliverySettingsSchema.parse(await this.delivery.get(storeId));
  }

  @Put()
  @StoreRoles('OWNER', 'MANAGER')
  async update(
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: deliverySettingsInputSchema }) body: DeliverySettingsInput,
  ) {
    return deliverySettingsSchema.parse(await this.delivery.update(storeId, user.id, body));
  }
}
