/**
 * Shopper-facing prices and availability, kept pure so they're easy to test and reuse at checkout.
 *
 * - A variant's own price overrides the product price (and isn't discounted).
 * - Otherwise the product's sale price applies when the store's plan allows promotions; the regular
 *   price is then shown crossed out.
 * - A variant can be bought when it's active and in stock, unless stock isn't tracked or the
 *   merchant sells when sold out.
 */

export interface PricingProduct {
  basePriceKobo: number;
  promoPriceKobo: number | null;
  trackStock: boolean;
  sellWhenSoldOut: boolean;
  lowStockThreshold: number;
}

export interface PricingVariant {
  priceKobo: number | null;
  stockQuantity: number;
  isActive: boolean;
}

export function variantPrice(
  product: PricingProduct,
  variant: PricingVariant,
  promotionsAllowed: boolean,
): { priceKobo: number; compareAtKobo: number | null } {
  if (variant.priceKobo !== null) return { priceKobo: variant.priceKobo, compareAtKobo: null };
  const onSale =
    promotionsAllowed &&
    product.promoPriceKobo !== null &&
    product.promoPriceKobo < product.basePriceKobo;
  return onSale
    ? { priceKobo: product.promoPriceKobo!, compareAtKobo: product.basePriceKobo }
    : { priceKobo: product.basePriceKobo, compareAtKobo: null };
}

export function variantAvailable(product: PricingProduct, variant: PricingVariant): boolean {
  if (!variant.isActive) return false;
  return !product.trackStock || product.sellWhenSoldOut || variant.stockQuantity > 0;
}

export function variantLowStock(product: PricingProduct, variant: PricingVariant): boolean {
  return (
    product.trackStock &&
    variant.isActive &&
    variant.stockQuantity > 0 &&
    variant.stockQuantity <= product.lowStockThreshold
  );
}

/** Card price: the cheapest available variant (or cheapest overall when all are sold out). */
export function cardPrice(
  product: PricingProduct,
  variants: PricingVariant[],
  promotionsAllowed: boolean,
): { priceKobo: number; compareAtKobo: number | null; priceVaries: boolean; soldOut: boolean } {
  const active = variants.filter((v) => v.isActive);
  const available = active.filter((v) => variantAvailable(product, v));
  const pool = available.length ? available : active;
  const prices = pool.map((v) => variantPrice(product, v, promotionsAllowed));
  if (prices.length === 0) {
    return {
      ...variantPrice(
        product,
        { priceKobo: null, stockQuantity: 0, isActive: true },
        promotionsAllowed,
      ),
      priceVaries: false,
      soldOut: true,
    };
  }
  const cheapest = prices.reduce((a, b) => (b.priceKobo < a.priceKobo ? b : a));
  return {
    ...cheapest,
    priceVaries: new Set(prices.map((p) => p.priceKobo)).size > 1,
    soldOut: available.length === 0,
  };
}
