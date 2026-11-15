import { Controller, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { BillingService } from './billing.service.js';

/** SHELL: Plans and subscriptions (Paystack subscriptions). Routes are added with the feature. */
@ApiTags('billing')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/billing')
export class BillingController {
  constructor(private readonly service: BillingService) {}
}
