import { Module } from '@nestjs/common';
import { DeliveryModule } from '../delivery/delivery.module.js';
import { StorefrontController } from './storefront.controller.js';
import { StorefrontService } from './storefront.service.js';

@Module({
  imports: [DeliveryModule],
  controllers: [StorefrontController],
  providers: [StorefrontService],
})
export class StorefrontModule {}
