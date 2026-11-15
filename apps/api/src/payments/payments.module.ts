import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { PaystackClient } from './paystack.client.js';
import { PaymentsReconcileJob } from './payments-reconcile.job.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsProcessor } from './payments.processor.js';
import { PAYMENTS_QUEUE, PaymentsService } from './payments.service.js';

@Module({
  imports: [BullModule.registerQueue({ name: PAYMENTS_QUEUE })],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentsProcessor,
    PaymentsReconcileJob,
    {
      provide: PaystackClient,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => new PaystackClient(config.env.PAYSTACK_SECRET_KEY),
    },
  ],
  exports: [PaystackClient],
})
export class PaymentsModule {}
