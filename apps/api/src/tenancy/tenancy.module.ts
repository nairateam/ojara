import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { TenancyController } from './tenancy.controller.js';
import { TenancyService } from './tenancy.service.js';
import { TenantContextMiddleware } from './tenant-context.middleware.js';

@Module({
  controllers: [TenancyController],
  providers: [TenancyService],
  exports: [TenancyService],
})
export class TenancyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantContextMiddleware).forRoutes('*splat');
  }
}
