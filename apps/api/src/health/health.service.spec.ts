import { describe, expect, it } from 'vitest';
import type { PrismaService } from '../database/prisma.service.js';
import type { RedisService } from '../database/redis.service.js';
import { HealthService } from './health.service.js';

const prisma = (ok: boolean) =>
  ({
    ping: () => (ok ? Promise.resolve(true) : Promise.reject(new Error('down'))),
  }) as PrismaService;
const redis = (ok: boolean) => ({ ping: () => Promise.resolve(ok) }) as RedisService;

describe('HealthService', () => {
  it('reports ok when Postgres and Redis are up', async () => {
    const result = await new HealthService(prisma(true), redis(true)).check();
    expect(result).toMatchObject({ status: 'ok', checks: { postgres: 'up', redis: 'up' } });
  });

  it('reports each failing dependency', async () => {
    const result = await new HealthService(prisma(false), redis(true)).check();
    expect(result).toMatchObject({ status: 'error', checks: { postgres: 'down', redis: 'up' } });
  });
});
