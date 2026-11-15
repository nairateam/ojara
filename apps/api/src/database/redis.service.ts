import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { AppConfigService } from '../config/app-config.service.js';

/** Shared Redis connection for health checks and future caching (tenant resolution, rate limits). */
@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(config: AppConfigService) {
    this.client = new Redis(config.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    // Connection errors surface through ping(); avoid unhandled 'error' events crashing the app.
    this.client.on('error', () => undefined);
  }

  async ping(): Promise<boolean> {
    if (this.client.status === 'wait' || this.client.status === 'end') await this.client.connect();
    return (await this.client.ping()) === 'PONG';
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
