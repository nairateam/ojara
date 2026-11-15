import { Injectable } from '@nestjs/common';
import type { HealthDto } from '@ojara/shared';
import { PrismaService } from '../database/prisma.service.js';
import { RedisService } from '../database/redis.service.js';

const TIMEOUT_MS = 2_000;

async function probe(fn: () => Promise<boolean>): Promise<'up' | 'down'> {
  try {
    const ok = await Promise.race([
      fn(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), TIMEOUT_MS).unref()),
    ]);
    return ok ? 'up' : 'down';
  } catch {
    return 'down';
  }
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthDto> {
    const [postgres, redis] = await Promise.all([
      probe(() => this.prisma.ping()),
      probe(() => this.redis.ping()),
    ]);
    return {
      status: postgres === 'up' && redis === 'up' ? 'ok' : 'error',
      checks: { postgres, redis },
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
