import {
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AppConfigService } from '../config/app-config.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { verifyPaystackSignature } from './paystack-signature.js';
import { PaymentsService } from './payments.service.js';

@ApiExcludeController()
@Public()
@SkipThrottle()
@Controller('webhooks')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly config: AppConfigService,
  ) {}

  @Post('paystack')
  @HttpCode(200)
  async paystack(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-paystack-signature') signature: string | undefined,
  ) {
    const secret = this.config.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new ServiceUnavailableException('Paystack is not configured');
    if (!req.rawBody || !verifyPaystackSignature(req.rawBody, signature, secret)) {
      throw new UnauthorizedException('Invalid signature');
    }
    return this.payments.recordPaystackEvent(req.body);
  }
}
