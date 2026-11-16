import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { PaystackClient } from './paystack.client.js';

/** The Paystack API client, shared by payments (webhooks, payouts) and checkout. */
@Module({
  providers: [
    {
      provide: PaystackClient,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => new PaystackClient(config.env.PAYSTACK_SECRET_KEY),
    },
  ],
  exports: [PaystackClient],
})
export class PaystackModule {}
