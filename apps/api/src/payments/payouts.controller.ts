import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  type PayoutAccountInput,
  payoutAccountInputSchema,
  payoutAccountSchema,
  payoutBankSchema,
  payoutResolveQuerySchema,
  payoutResolveSchema,
} from '@ojara/shared';
import { z } from 'zod';
import type { AuthUser } from '../auth/auth.types.js';
import { StoreAccessGuard } from '../auth/guards/store-access.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { StoreRoles } from '../common/decorators/roles.decorator.js';
import { PayoutsService } from './payouts.service.js';

/** Where a store's sales are paid (Paystack subaccount). Changing it is owner-only. */
@ApiTags('payouts')
@ApiCookieAuth()
@UseGuards(StoreAccessGuard)
@Controller('stores/:storeId/payouts')
export class PayoutsController {
  constructor(private readonly payouts: PayoutsService) {}

  @Get('banks')
  async banks() {
    return z.array(payoutBankSchema).parse(await this.payouts.banks());
  }

  /** Account-name lookup while the merchant types (shown before they confirm). */
  @Get('resolve')
  @StoreRoles('OWNER')
  async resolve(@Query({ schema: payoutResolveQuerySchema }) q: PayoutAccountInput) {
    return payoutResolveSchema.parse(await this.payouts.resolve(q.bankCode, q.accountNumber));
  }

  @Get('account')
  async account(@Param('storeId') storeId: string) {
    return payoutAccountSchema.parse(await this.payouts.get(storeId));
  }

  @Put('account')
  @StoreRoles('OWNER')
  async connect(
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthUser,
    @Body({ schema: payoutAccountInputSchema }) body: PayoutAccountInput,
  ) {
    return payoutAccountSchema.parse(await this.payouts.connect(storeId, user.id, body));
  }
}
