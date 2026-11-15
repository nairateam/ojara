import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { RedisService } from './redis.service.js';

/**
 * Infrastructure-only module (Postgres via Prisma, Redis). It has no controller on purpose:
 * database access is never exposed over HTTP. Health is reported by the health module.
 */
@Global()
@Module({
  providers: [PrismaService, RedisService],
  exports: [PrismaService, RedisService],
})
export class DatabaseModule {}
