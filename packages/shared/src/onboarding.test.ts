import { describe, expect, it } from 'vitest';
import {
  brandColourSchema,
  instagramHandleSchema,
  nigerianPhoneSchema,
  numberedSlug,
  STORE_SLUG_PATTERN,
  suggestStoreSlug,
  updateStoreSchema,
} from './index.js';

describe('suggestStoreSlug', () => {
  it.each([
    ['Adùnní Threads', 'adunni-threads'],
    ['  Ada & Sons Bakery!! ', 'ada-and-sons-bakery'],
    ['Ọjà Èkó', 'oja-eko'],
    ['AB', 'ab-store'],
    ['!!!', 'my-store'],
    ['Admin', 'admin-store'],
    ['x'.repeat(60), 'x'.repeat(40)],
  ])('%s -> %s', (name, slug) => {
    expect(suggestStoreSlug(name)).toBe(slug);
    expect(STORE_SLUG_PATTERN.test(slug)).toBe(true);
  });

  it('numbers slugs within the length limit', () => {
    expect(numberedSlug('ada', 2)).toBe('ada-2');
    const long = numberedSlug('a'.repeat(40), 12);
    expect(long).toHaveLength(40);
    expect(STORE_SLUG_PATTERN.test(long)).toBe(true);
  });
});

describe('nigerianPhoneSchema', () => {
  it.each([
    ['803 555 0144', '+2348035550144'],
    ['0803-555-0144', '+2348035550144'],
    ['+234 803 555 0144', '+2348035550144'],
    ['2349035550144', '+2349035550144'],
  ])('%s -> %s', (input, expected) => {
    expect(nigerianPhoneSchema.parse(input)).toBe(expected);
  });

  it.each(['12345', '603 555 0144', '0803 555 014', 'call me', '+44 7700 900123'])(
    'rejects %s',
    (input) => {
      expect(nigerianPhoneSchema.safeParse(input).success).toBe(false);
    },
  );
});

describe('store field schemas', () => {
  it('normalises Instagram handles', () => {
    expect(instagramHandleSchema.parse('@adunni.threads')).toBe('adunni.threads');
    expect(instagramHandleSchema.parse('  ')).toBeNull();
    expect(instagramHandleSchema.safeParse('bad handle!').success).toBe(false);
  });

  it('upper-cases brand colours and rejects other formats', () => {
    expect(brandColourSchema.parse('#2a3a7c')).toBe('#2A3A7C');
    expect(brandColourSchema.safeParse('red').success).toBe(false);
  });

  it('accepts partial store updates and validates each field', () => {
    expect(updateStoreSchema.parse({ name: ' Ada ', slug: 'Ada-Bakes' })).toEqual({
      name: 'Ada',
      slug: 'ada-bakes',
    });
    expect(updateStoreSchema.safeParse({ state: 'Atlantis' }).success).toBe(false);
    expect(updateStoreSchema.safeParse({ slug: 'admin' }).success).toBe(false);
  });
});
