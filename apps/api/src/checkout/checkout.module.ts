import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module.js';
import { PaystackModule } from '../payments/paystack.module.js';
import { CheckoutController } from './checkout.controller.js';
import { CheckoutService } from './checkout.service.js';
import { PaymentConfirmationService } from './payment-confirmation.service.js';

@Module({
  imports: [PaystackModule, EmailModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, PaymentConfirmationService],
  exports: [PaymentConfirmationService],
})
export class CheckoutModule {}
