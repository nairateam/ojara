import { describe, expect, it } from 'vitest';
import { productInputSchema, slugify, variantKey, variantLabel } from './index.js';

const base = {
  name: 'Adire Wrap Dress',
  description: '',
  status: 'DRAFT' as const,
  categoryId: null,
  basePriceKobo: 1_850_000,
  promoPriceKobo: null,
  costKobo: null,
  trackStock: true,
  sellWhenSoldOut: false,
  lowStockThreshold: 3,
};
const variant = (options: Record<string, string>, sku: string | null = null) => ({
  options,
  sku,
  priceKobo: null,
  stockQuantity: 5,
  isActive: true,
});

describe('productInputSchema', () => {
  it('accepts a simple product with one variant', () => {
    const parsed = productInputSchema.parse({ ...base, options: [], variants: [variant({})] });
    expect(parsed.description).toBeNull();
  });

  it('accepts variants that cover the option values', () => {
    const result = productInputSchema.safeParse({
      ...base,
      options: [
        { name: 'Size', values: ['S', 'M'] },
        { name: 'Colour', values: ['Indigo'] },
      ],
      variants: [
        variant({ Size: 'S', Colour: 'Indigo' }, 'ADW-S'),
        variant({ Size: 'M', Colour: 'Indigo' }, ''),
      ],
    });
    expect(result.success).toBe(true);
    expect(result.data?.variants[1]?.sku).toBeNull();
  });

  it.each([
    [
      'promo not below price',
      { promoPriceKobo: 1_850_000, options: [], variants: [variant({})] },
      'promoPriceKobo',
    ],
    [
      'several variants without options',
      { options: [], variants: [variant({}), variant({})] },
      'variants',
    ],
    [
      'unknown option value',
      { options: [{ name: 'Size', values: ['S'] }], variants: [variant({ Size: 'XL' })] },
      'variants.0.options',
    ],
    [
      'missing option',
      {
        options: [
          { name: 'Size', values: ['S'] },
          { name: 'Colour', values: ['Red'] },
        ],
        variants: [variant({ Size: 'S' })],
      },
      'variants.0.options',
    ],
    [
      'duplicate variant',
      {
        options: [{ name: 'Size', values: ['S'] }],
        variants: [variant({ Size: 'S' }), variant({ Size: 'S' })],
      },
      'variants.1',
    ],
    [
      'duplicate SKU',
      {
        options: [{ name: 'Size', values: ['S', 'M'] }],
        variants: [variant({ Size: 'S' }, 'X1'), variant({ Size: 'M' }, 'x1')],
      },
      'variants.1.sku',
    ],
    [
      'duplicate option values',
      { options: [{ name: 'Size', values: ['S', 's'] }], variants: [variant({ Size: 'S' })] },
      'options.0.values',
    ],
  ])('rejects %s', (_label, input, path) => {
    const result = productInputSchema.safeParse({ ...base, ...input });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path.join('.'))).toContain(path);
  });
});

describe('catalogue helpers', () => {
  it('builds stable variant keys and labels', () => {
    expect(variantKey({ Size: 'M', Colour: 'Indigo' })).toBe(
      variantKey({ Colour: 'Indigo', Size: 'M' }),
    );
    expect(
      variantLabel({ Size: 'M', Colour: 'Indigo' }, [{ name: 'Size' }, { name: 'Colour' }]),
    ).toBe('M / Indigo');
    expect(variantLabel({}, [])).toBe('');
  });

  it('slugifies names', () => {
    expect(slugify('Àṣọ Òkè Tote & Bag!')).toBe('aso-oke-tote-and-bag');
    expect(slugify('???')).toBe('item');
  });
});
