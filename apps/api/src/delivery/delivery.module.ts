import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller.js';
import { DeliveryService } from './delivery.service.js';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
