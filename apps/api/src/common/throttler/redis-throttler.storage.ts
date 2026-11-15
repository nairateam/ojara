import { Logger } from '@nestjs/common';
import { type ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';

// The record interface is not exported from the package index.
type ThrottlerStorageRecord = Awaited<ReturnType<ThrottlerStorage['increment']>>;

/** Minimal slice of ioredis used here (keeps the class easy to unit test). */
export interface RedisEvalClient {
  status: string;
  connect(): Promise<unknown>;
  eval(script: string, numKeys: number, ...args: (string | number)[]): Promise<unknown>;
}

/**
 * Fixed-window counter + optional block, atomically in one round trip.
 * KEYS[1] = hit counter, KEYS[2] = block marker. ARGV = ttlMs, limit, blockMs.
 * Returns { hits, counterTtlMs, blockTtlMs }.
 */
const SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('PTTL', KEYS[1])
local blocked = redis.call('PTTL', KEYS[2])
if blocked <= 0 and hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  blocked = tonumber(ARGV[3])
end
return {hits, ttl, blocked}
`;

/**
 * @nestjs/throttler storage shared by every API instance via Redis. If Redis is unreachable the
 * request is still rate limited, using this process's in-memory counters, rather than failing:
 * an outage must not take the API down or switch rate limiting off.
 */
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private readonly fallback = new ThrottlerStorageService();
  private warned = false;

  constructor(
    private readonly redis: RedisEvalClient,
    private readonly prefix = 'ojara:throttle',
  ) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    try {
      if (this.redis.status === 'wait' || this.redis.status === 'end') {
        void this.redis.connect().catch(() => undefined);
      }
      const base = `${this.prefix}:${throttlerName}:${key}`;
      const result = (await this.redis.eval(
        SCRIPT,
        2,
        `${base}:hits`,
        `${base}:block`,
        ttl,
        limit,
        blockDuration > 0 ? blockDuration : ttl,
      )) as [number, number, number];
      const [hits, ttlMs, blockMs] = result;
      this.warned = false;
      const isBlocked = blockMs > 0 && hits > limit;
      return {
        totalHits: hits,
        timeToExpire: Math.max(0, Math.ceil(ttlMs / 1000)),
        isBlocked,
        timeToBlockExpire: isBlocked ? Math.ceil(blockMs / 1000) : 0,
      };
    } catch (err) {
      if (!this.warned) {
        this.logger.warn(
          `Redis unavailable for rate limiting; using in-memory counters (${String(err)})`,
        );
        this.warned = true;
      }
      return this.fallback.increment(key, ttl, limit, blockDuration, throttlerName);
    }
  }
}
