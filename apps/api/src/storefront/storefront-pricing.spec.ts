import { describe, expect, it } from 'vitest';
import {
  cardPrice,
  type PricingProduct,
  variantAvailable,
  variantLowStock,
  variantPrice,
} from './storefront-pricing.js';

const product: PricingProduct = {
  basePriceKobo: 2_000_000,
  promoPriceKobo: 1_500_000,
  trackStock: true,
  sellWhenSoldOut: false,
  lowStockThreshold: 3,
};
const v = (
  over: Partial<{ priceKobo: number | null; stockQuantity: number; isActive: boolean }>,
) => ({
  priceKobo: null,
  stockQuantity: 5,
  isActive: true,
  ...over,
});

describe('storefront pricing', () => {
  it('applies the sale price only when the plan allows promotions', () => {
    expect(variantPrice(product, v({}), true)).toEqual({
      priceKobo: 1_500_000,
      compareAtKobo: 2_000_000,
    });
    expect(variantPrice(product, v({}), false)).toEqual({
      priceKobo: 2_000_000,
      compareAtKobo: null,
    });
  });

  it('uses a variant’s own price without a discount', () => {
    expect(variantPrice(product, v({ priceKobo: 2_500_000 }), true)).toEqual({
      priceKobo: 2_500_000,
      compareAtKobo: null,
    });
  });

  it('decides availability from stock, tracking and the sell-when-sold-out setting', () => {
    expect(variantAvailable(product, v({ stockQuantity: 0 }))).toBe(false);
    expect(variantAvailable(product, v({ isActive: false }))).toBe(false);
    expect(variantAvailable({ ...product, sellWhenSoldOut: true }, v({ stockQuantity: 0 }))).toBe(
      true,
    );
    expect(variantAvailable({ ...product, trackStock: false }, v({ stockQuantity: 0 }))).toBe(true);
    expect(variantLowStock(product, v({ stockQuantity: 2 }))).toBe(true);
    expect(variantLowStock(product, v({ stockQuantity: 0 }))).toBe(false);
    expect(variantLowStock({ ...product, trackStock: false }, v({ stockQuantity: 1 }))).toBe(false);
  });

  it('prices cards from the cheapest available variant', () => {
    const card = cardPrice(
      product,
      [v({ priceKobo: 900_000, stockQuantity: 0 }), v({ priceKobo: 1_200_000 }), v({})],
      false,
    );
    expect(card).toEqual({
      priceKobo: 1_200_000,
      compareAtKobo: null,
      priceVaries: true,
      soldOut: false,
    });
  });

  it('marks a card sold out when nothing is available, still showing a price', () => {
    expect(cardPrice(product, [v({ stockQuantity: 0 })], true)).toMatchObject({
      priceKobo: 1_500_000,
      soldOut: true,
    });
    expect(cardPrice(product, [v({ isActive: false })], true)).toMatchObject({ soldOut: true });
  });
});
