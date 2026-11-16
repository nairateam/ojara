import { Body, Controller, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import {
  cartPriceInputSchema,
  cartPriceSchema,
  checkoutInputSchema,
  checkoutResultSchema,
  storefrontOrderSchema,
} from '@ojara/shared';
import type { z } from 'zod';
import { InternalTokenGuard } from '../auth/guards/internal-token.guard.js';
import { Public } from '../common/decorators/public.decorator.js';
import { CheckoutService } from './checkout.service.js';

/** Shopper checkout for the web server (internal token, no session; rate-limited per shopper). */
@ApiTags('internal')
@ApiHeader({ name: 'x-internal-token', required: true })
@Public()
@UseGuards(InternalTokenGuard)
@Controller('internal/storefront/:storeId')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('checkout')
  @HttpCode(200)
  async checkout(
    @Param('storeId') storeId: string,
    @Body({ schema: checkoutInputSchema }) body: z.output<typeof checkoutInputSchema>,
  ) {
    return checkoutResultSchema.parse(await this.checkoutService.checkout(storeId, body));
  }

  @Get('orders/:reference')
  async order(@Param('storeId') storeId: string, @Param('reference') reference: string) {
    return storefrontOrderSchema.parse(await this.checkoutService.getOrder(storeId, reference));
  }

  /** Re-prices the shopper's saved cart before checkout. */
  @Post('cart/price')
  @HttpCode(200)
  async priceCart(
    @Param('storeId') storeId: string,
    @Body({ schema: cartPriceInputSchema }) body: z.output<typeof cartPriceInputSchema>,
  ) {
    return cartPriceSchema.parse(await this.checkoutService.priceCart(storeId, body.lines));
  }
}
