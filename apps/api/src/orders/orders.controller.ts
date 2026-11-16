import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  fulfilmentUpdateSchema,
  orderDetailSchema,
  orderListQuerySchema,
  orderListSchema,
} from '@ojara/shared';
import type { z } from 'zod';
import type { AuthUser } from '../auth/auth.types.js';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OrdersService } from './orders.service.js';

/** Merchant orders: list by tab, detail, fulfilment status. Any store member. */
@ApiTags('orders')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  async list(
    @Param('storeId') storeId: string,
    @Query({ schema: orderListQuerySchema }) query: z.output<typeof orderListQuerySchema>,
  ) {
    return orderListSchema.parse(await this.orders.list(storeId, query));
  }

  @Get(':orderId')
  async get(@Param('storeId') storeId: string, @Param('orderId') orderId: string) {
    return orderDetailSchema.parse(await this.orders.get(storeId, orderId));
  }

  @Patch(':orderId/fulfilment')
  async fulfilment(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: fulfilmentUpdateSchema }) body: z.output<typeof fulfilmentUpdateSchema>,
  ) {
    return orderDetailSchema.parse(
      await this.orders.updateFulfilment(storeId, user.id, orderId, body.status),
    );
  }
}
