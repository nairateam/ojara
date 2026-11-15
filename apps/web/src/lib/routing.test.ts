import { describe, expect, it } from 'vitest';
import { internalPath, routeForHost } from './routing';
import { TenantCache } from './tenant-cache';

const ROOT = 'ojara.localhost';

describe('routeForHost', () => {
  it.each([
    ['ojara.localhost:3000', { kind: 'platform', prefix: '/marketing' }],
    ['app.ojara.localhost:3000', { kind: 'platform', prefix: '/dash' }],
    ['admin.ojara.localhost:3000', { kind: 'platform', prefix: '/admin-site' }],
    ['demo.ojara.localhost:3000', { kind: 'storefront', hostname: 'demo.ojara.localhost' }],
    ['shop.adunni.ng', { kind: 'storefront', hostname: 'shop.adunni.ng' }],
    ['api.ojara.localhost:3000', { kind: 'not-found' }],
    ['localhost:3000', { kind: 'not-found' }],
  ])('%s', (host, target) => {
    expect(routeForHost(host, ROOT).target).toEqual(target);
  });
});

describe('internalPath', () => {
  it('maps the root and nested paths', () => {
    expect(internalPath('/dash', '/')).toBe('/dash');
    expect(internalPath('/dash', '/orders')).toBe('/dash/orders');
  });
});

describe('TenantCache', () => {
  const tenant = {
    storeId: 's1',
    slug: 'demo',
    name: 'Demo',
    status: 'PUBLISHED' as const,
    currency: 'NGN',
    primaryColor: null,
    logoPublicId: null,
    hostname: 'demo.ojara.localhost',
  };

  it('expires entries after the TTL and caches misses for at most 10s', () => {
    let now = 0;
    const cache = new TenantCache(60_000, 100, () => now);
    cache.set('demo', tenant);
    cache.set('nope', null);
    expect(cache.get('demo')).toEqual(tenant);
    expect(cache.get('nope')).toBeNull();
    now = 11_000;
    expect(cache.get('nope')).toBeUndefined();
    expect(cache.get('demo')).toEqual(tenant);
    now = 61_000;
    expect(cache.get('demo')).toBeUndefined();
  });

  it('evicts the oldest entry when full', () => {
    const cache = new TenantCache(60_000, 2);
    cache.set('a', tenant);
    cache.set('b', tenant);
    cache.set('c', tenant);
    expect(cache.size).toBe(2);
    expect(cache.get('a')).toBeUndefined();
  });
});
