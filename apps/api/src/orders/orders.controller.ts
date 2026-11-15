import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { OrdersService } from './orders.service.js';

/** SHELL: Order lifecycle (separate payment and fulfilment statuses). Routes are added with the feature. */
@ApiTags('orders')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/orders')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}
}
