import { describe, expect, it } from 'vitest';
import {
  internalPath,
  loginPath,
  ROUTE_PREFIX,
  routeForHost,
  safeReturnPath,
  signedOutRedirect,
} from './routing';
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

describe('safeReturnPath', () => {
  it.each([
    ['/orders?status=open', '/orders?status=open'],
    ['/', '/'],
    ['//evil.com', undefined],
    ['/\\evil.com', undefined],
    ['https://evil.com', undefined],
    ['orders', undefined],
    ['', undefined],
    [null, undefined],
  ])('%s -> %s', (input, expected) => {
    expect(safeReturnPath(input)).toBe(expected);
  });

  it('builds login paths', () => {
    expect(loginPath('/')).toBe('/login');
    expect(loginPath('//evil.com')).toBe('/login');
    expect(loginPath('/orders?x=1')).toBe('/login?next=%2Forders%3Fx%3D1');
  });
});

describe('signedOutRedirect', () => {
  const dash = ROUTE_PREFIX.dashboard;
  const admin = ROUTE_PREFIX.admin;

  it('sends signed-out visitors on private pages to /login with a return path', () => {
    expect(signedOutRedirect(dash, '/orders', '?page=2', false)).toBe(
      '/login?next=%2Forders%3Fpage%3D2',
    );
    expect(signedOutRedirect(dash, '/', '', false)).toBe('/login');
    expect(signedOutRedirect(admin, '/merchants', '', false)).toBe('/login?next=%2Fmerchants');
  });

  it('lets public auth pages and cookie holders through', () => {
    expect(signedOutRedirect(dash, '/login', '', false)).toBeNull();
    expect(signedOutRedirect(dash, '/reset-password/new', '?token=x', false)).toBeNull();
    expect(signedOutRedirect(dash, '/orders', '', true)).toBeNull();
    expect(signedOutRedirect(admin, '/login', '', false)).toBeNull();
    expect(signedOutRedirect(admin, '/signup', '', false)).toBe('/login?next=%2Fsignup');
  });

  it('never gates marketing', () => {
    expect(signedOutRedirect(ROUTE_PREFIX.marketing, '/pricing', '', false)).toBeNull();
  });

  it('does not treat look-alike paths as public', () => {
    expect(signedOutRedirect(dash, '/login-help', '', false)).toBe('/login?next=%2Flogin-help');
  });
});
