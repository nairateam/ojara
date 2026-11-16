import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CheckoutModule } from '../checkout/checkout.module.js';
import { PaymentsReconcileJob } from './payments-reconcile.job.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsProcessor } from './payments.processor.js';
import { PAYMENTS_QUEUE, PaymentsService } from './payments.service.js';
import { PaystackModule } from './paystack.module.js';
import { PayoutsController } from './payouts.controller.js';
import { PayoutsService } from './payouts.service.js';

@Module({
  imports: [BullModule.registerQueue({ name: PAYMENTS_QUEUE }), PaystackModule, CheckoutModule],
  controllers: [PaymentsController, PayoutsController],
  providers: [PaymentsService, PayoutsService, PaymentsProcessor, PaymentsReconcileJob],
  exports: [PaystackModule],
})
export class PaymentsModule {}
