import { randomUUID } from 'node:crypto';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BillingModule } from './billing/billing.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';
import { RedisThrottlerStorage } from './common/throttler/redis-throttler.storage.js';
import { AppConfigService } from './config/app-config.service.js';
import { ConfigModule } from './config/config.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { DatabaseModule } from './database/database.module.js';
import { RedisService } from './database/redis.service.js';
import { DeliveryModule } from './delivery/delivery.module.js';
import { DomainsModule } from './domains/domains.module.js';
import { EmailModule } from './email/email.module.js';
import { HealthModule } from './health/health.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { MediaModule } from './media/media.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { StoresModule } from './stores/stores.module.js';
import { TenancyModule } from './tenancy/tenancy.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.env.LOG_LEVEL,
          // Honour an upstream request id (load balancer / web proxy) or mint one.
          genReqId: (req, res) => {
            const incoming = req.headers['x-request-id'];
            const id =
              typeof incoming === 'string' && /^[\w-]{8,64}$/.test(incoming)
                ? incoming
                : randomUUID();
            res.setHeader('x-request-id', id);
            return id;
          },
          redact: [
            'req.headers.cookie',
            'req.headers.authorization',
            'req.headers["x-internal-token"]',
            'req.headers["x-paystack-signature"]',
          ],
          autoLogging: { ignore: (req) => req.url === '/v1/health' },
          ...(config.isProduction || config.isTest
            ? {}
            : {
                transport: { target: 'pino-pretty', options: { singleLine: true, colorize: true } },
              }),
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      // Counters live in Redis so limits hold across API instances; falls back to memory if Redis
      // is down. Auth endpoints have stricter limits enforced by Better Auth (stored in Postgres).
      inject: [RedisService],
      useFactory: (redis: RedisService) => ({
        throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
        storage: new RedisThrottlerStorage(redis.client),
      }),
    }),
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        connection: { url: config.env.REDIS_URL, maxRetriesPerRequest: null },
        prefix: 'ojara',
      }),
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    TenancyModule,
    EmailModule,
    AuthModule,
    UsersModule,
    StoresModule,
    CatalogModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    BillingModule,
    DeliveryModule,
    CustomersModule,
    MediaModule,
    DomainsModule,
    AdminModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    // Order matters: throttle first, then SessionGuard/RolesGuard (registered in AuthModule).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
