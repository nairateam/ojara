import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CustomersService } from './customers.service.js';

/** SHELL: Per-store customer records (customers have no accounts). Routes are added with the feature. */
@ApiTags('customers')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}
}
