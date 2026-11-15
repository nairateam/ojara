import { describe, expect, it, vi } from 'vitest';
import { type RedisEvalClient, RedisThrottlerStorage } from './redis-throttler.storage.js';

function fakeRedis(result: [number, number, number] | Error): RedisEvalClient {
  return {
    status: 'ready',
    connect: vi.fn(() => Promise.resolve()),
    eval: vi.fn(() => (result instanceof Error ? Promise.reject(result) : Promise.resolve(result))),
  };
}

describe('RedisThrottlerStorage', () => {
  it('maps the Redis counter to a throttler record (seconds)', async () => {
    const redis = fakeRedis([3, 42_500, -2]);
    const storage = new RedisThrottlerStorage(redis);
    await expect(storage.increment('ip:1', 60_000, 5, 0, 'default')).resolves.toEqual({
      totalHits: 3,
      timeToExpire: 43,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'ojara:throttle:default:ip:1:hits',
      'ojara:throttle:default:ip:1:block',
      60_000,
      5,
      60_000,
    );
  });

  it('reports a block once the limit is exceeded', async () => {
    const storage = new RedisThrottlerStorage(fakeRedis([6, 30_000, 60_000]));
    await expect(storage.increment('ip:1', 60_000, 5, 60_000, 'default')).resolves.toMatchObject({
      totalHits: 6,
      isBlocked: true,
      timeToBlockExpire: 60,
    });
  });

  it('still rate limits in memory when Redis is down', async () => {
    const storage = new RedisThrottlerStorage(fakeRedis(new Error('ECONNREFUSED')));
    let last;
    for (let i = 0; i < 3; i++)
      last = await storage.increment('ip:2', 60_000, 2, 60_000, 'default');
    expect(last).toMatchObject({ totalHits: 3, isBlocked: true });
  });
});
