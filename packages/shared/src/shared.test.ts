import { describe, expect, it } from 'vitest';
import { classifyHost, createStoreSchema, formatKobo, isReservedSlug, nairaToKobo } from './index.js';

describe('classifyHost', () => {
  const root = 'ojara.localhost';
  it.each([
    ['ojara.localhost:3000', { kind: 'marketing' }],
    ['www.ojara.localhost', { kind: 'marketing' }],
    ['app.ojara.localhost:3000', { kind: 'dashboard' }],
    ['ADMIN.ojara.localhost', { kind: 'admin' }],
    ['api.ojara.localhost', { kind: 'api' }],
    ['demo.ojara.localhost:3000', { kind: 'store-subdomain', slug: 'demo' }],
    ['shop.adunni.ng', { kind: 'custom-domain', hostname: 'shop.adunni.ng' }],
    ['a.b.ojara.localhost', { kind: 'invalid' }],
    ['localhost:3000', { kind: 'invalid' }],
  ])('%s', (host, expected) => {
    expect(classifyHost(host, root)).toEqual(expected);
  });
});

describe('slugs', () => {
  it('rejects reserved slugs', () => {
    expect(isReservedSlug('Admin')).toBe(true);
    expect(createStoreSchema.safeParse({ name: 'Shop', slug: 'app' }).success).toBe(false);
  });
  it('accepts valid slugs and normalises case', () => {
    const parsed = createStoreSchema.parse({ name: 'Adunni Threads', slug: 'Adunni-Threads' });
    expect(parsed.slug).toBe('adunni-threads');
    expect(parsed.currency).toBe('NGN');
  });
  it('rejects double hyphens and short slugs', () => {
    expect(createStoreSchema.safeParse({ name: 'Shop', slug: 'a--b' }).success).toBe(false);
    expect(createStoreSchema.safeParse({ name: 'Shop', slug: 'ab' }).success).toBe(false);
  });
});

describe('money', () => {
  it('converts naira to integer kobo', () => {
    expect(nairaToKobo(5000)).toBe(500_000);
    expect(nairaToKobo(19.99)).toBe(1999);
  });
  it('formats kobo as naira', () => {
    expect(formatKobo(128_450_000)).toBe('₦1,284,500');
    expect(formatKobo(1999)).toBe('₦19.99');
    expect(formatKobo(-2_195_000)).toBe('− ₦21,950');
  });
  it('rejects non-integer money', () => {
    expect(() => formatKobo(10.5)).toThrow(TypeError);
  });
});
