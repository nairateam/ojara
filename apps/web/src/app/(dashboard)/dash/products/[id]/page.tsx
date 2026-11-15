import { PLANS, formatKobo } from '@ojara/shared';
import { Check, Eye, ImagePlus, Monitor, Plus, ShoppingBag, Smartphone, X } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { PageContainer } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { PlanLimitCard } from '@/components/dashboard/system-states';
import { Thumb } from '@/components/dashboard/thumb';
import { UnsavedIndicator } from '@/components/dashboard/unsaved-indicator';
import { PlanLockTag, StatusPill, Tag } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Field, RadioCard, Select, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  COLOUR_SWATCHES,
  MOCK_MERCHANT,
  type MockProductDetail,
  PRODUCT_CATEGORIES,
  productDetail,
} from '@/mock/dashboard';

type Props = { params: Promise<{ id: string }> };

const NEW_PRODUCT: MockProductDetail = {
  slug: 'new',
  name: '',
  status: 'DRAFT',
  description: '',
  images: [],
  priceKobo: 0,
  costKobo: 0,
  category: 'Dresses',
  collections: [],
  sizes: [],
  colours: [],
  variants: [],
  lowStockAlert: 3,
  trackStock: true,
  sellWhenSoldOut: false,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (id === 'new') return { title: 'Add product' };
  return { title: productDetail(id)?.name ?? 'Product not found' };
}

const naira = (kobo: number) => (kobo ? (kobo / 100).toLocaleString('en-NG') : '');

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('gap-4', className)}>
      <div className="flex flex-col gap-1">
        <CardTitle className="text-[15px]/[21px] text-fg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {children}
    </Card>
  );
}

function OptionChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-muted px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function AddChip() {
  return (
    <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold">
      <Plus className="size-3.5" aria-hidden /> Add
    </button>
  );
}

/** 03.05 Edit Product (also /products/new). */
export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === 'new';
  const product = isNew ? NEW_PRODUCT : productDetail(id);
  if (!product) notFound();

  const limit = PLANS[MOCK_MERCHANT.plan].limits.maxProducts;
  if (isNew && MOCK_MERCHANT.productCount >= limit) {
    return (
      <PageContainer>
        <PageHeader back={{ href: '/products', label: 'Products' }} title="Add product" />
        <PlanLimitCard limit={limit} className="max-w-[640px]" />
      </PageContainer>
    );
  }

  const units = product.variants.reduce((n, v) => n + v.stock, 0);
  const low = product.variants.filter(
    (v) => v.stock > 0 && v.stock <= product.lowStockAlert,
  ).length;
  const soldOut = product.variants.filter((v) => v.stock === 0).length;
  const margin =
    product.priceKobo && product.costKobo
      ? Math.round(((product.priceKobo - product.costKobo) / product.priceKobo) * 100)
      : undefined;
  const preview = product.images[0];
  const soldOutVariant = product.variants.find((v) => !v.available);
  const formId = 'product-form';

  return (
    <PageContainer className="gap-5 md:pt-6">
      <PageHeader
        back={{ href: '/products', label: 'Products' }}
        title={isNew ? 'Add product' : product.name}
        className="max-lg:[&_a]:hidden"
        badge={
          product.status === 'PUBLISHED' ? (
            <StatusPill tone="success">Published</StatusPill>
          ) : (
            <StatusPill tone="neutral">Draft</StatusPill>
          )
        }
        actions={
          <>
            <UnsavedIndicator formId={formId} className="hidden sm:flex" />
            <Button variant="secondary">
              <Eye /> Preview
            </Button>
            <Button type="submit" form={formId}>
              <Check /> {isNew ? 'Save product' : 'Save changes'}
            </Button>
          </>
        }
      />

      <form id={formId} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard title="Details">
            <Field label="Product name" htmlFor="name">
              <Input
                id="name"
                name="name"
                defaultValue={product.name}
                placeholder="e.g. Adire Wrap Dress"
              />
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                defaultValue={product.description}
                rows={4}
                className="min-h-24 text-sm leading-[21px]"
                placeholder="Fabric, fit, how it’s made…"
              />
            </Field>
          </SectionCard>

          <SectionCard
            title="Images"
            description="Drag to reorder. The first image is shown on your storefront and in shared links."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.images.map((src, i) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-md">
                  <Thumb src={src} size={200} className="size-full rounded-md" />
                  {i === 0 ? (
                    <span className="absolute top-2 left-2 rounded-xs bg-forest/85 px-1.5 py-0.5 text-[11px]/[14px] font-semibold text-paper">
                      Cover
                    </span>
                  ) : null}
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-line-strong bg-surface-muted/60 p-3 text-center">
                <ImagePlus className="size-5 text-fg" aria-hidden />
                <span className="text-[13px]/[19px] font-semibold">Add images</span>
                <span className="text-[11px]/[14px] text-fg-subtle">JPG or PNG, up to 5 MB</span>
                <input type="file" accept="image/jpeg,image/png" multiple className="sr-only" />
              </label>
            </div>
          </SectionCard>

          <SectionCard
            title="Pricing"
            description="Paystack’s processing fee comes out of each payout. It is separate from your Ojara plan."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price" htmlFor="price">
                <Input
                  id="price"
                  name="price"
                  inputMode="numeric"
                  prefix="₦"
                  defaultValue={naira(product.priceKobo)}
                />
              </Field>
              <Field
                label="Promotional price"
                htmlFor="promo"
                aside={<PlanLockTag plan="STARTER" className="mr-auto ml-2" />}
                hint="Run sales and discounts on the Starter plan."
              >
                <Input
                  id="promo"
                  prefix="₦"
                  placeholder="—"
                  disabled
                  className="cursor-not-allowed"
                />
              </Field>
              <Field
                label="Cost per item"
                htmlFor="cost"
                hint={`Private${margin !== undefined ? ` · Margin ${margin}%` : ''}`}
              >
                <Input
                  id="cost"
                  name="cost"
                  inputMode="numeric"
                  prefix="₦"
                  defaultValue={naira(product.costKobo)}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Variants"
            description="Each size and colour combination has its own stock and price."
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-[72px] text-[13px]/[19px] text-fg-muted">Size</span>
                {product.sizes.map((s) => (
                  <OptionChip key={s}>{s}</OptionChip>
                ))}
                <AddChip />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-[72px] text-[13px]/[19px] text-fg-muted">Colour</span>
                {product.colours.map((c) => (
                  <OptionChip key={c}>
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: COLOUR_SWATCHES[c] }}
                      aria-hidden
                    />
                    {c}
                  </OptionChip>
                ))}
                <AddChip />
              </div>
            </div>
            {product.variants.length ? (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[560px] border-collapse text-[13px]/[19px]">
                  <thead className="bg-paper">
                    <tr className="text-left text-[11px]/[14px] font-semibold tracking-[0.6px] text-fg-subtle uppercase">
                      <th className="px-3.5 py-[9px] font-semibold">Variant</th>
                      <th className="px-3 py-[9px] font-semibold">SKU</th>
                      <th className="px-3 py-[9px] font-semibold">Price</th>
                      <th className="px-3 py-[9px] font-semibold">Stock</th>
                      <th className="px-3.5 py-[9px] text-right font-semibold">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => {
                      const isLow = v.stock > 0 && v.stock <= product.lowStockAlert;
                      const label = `${v.size} / ${v.colour}`;
                      return (
                        <tr key={v.sku} className="border-t border-line">
                          <td className="px-3.5 py-1.5">
                            <span className="flex items-center gap-2 whitespace-nowrap">
                              <span
                                className="size-2.5 rounded-full"
                                style={{ background: COLOUR_SWATCHES[v.colour] }}
                                aria-hidden
                              />
                              {label}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-xs whitespace-nowrap text-fg-muted">
                            {v.sku}
                          </td>
                          <td className="w-[136px] px-3 py-1.5">
                            <Input
                              aria-label={`Price for ${label}`}
                              prefix="₦"
                              defaultValue={naira(v.priceKobo)}
                              className="h-8"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <span className="flex items-center gap-2.5">
                              <Input
                                aria-label={`Stock for ${label}`}
                                inputMode="numeric"
                                defaultValue={v.stock}
                                aria-invalid={v.stock === 0 || undefined}
                                className="h-8 w-14"
                              />
                              {v.stock === 0 ? (
                                <Tag className="text-[10px]/[14px]" tone="danger">
                                  Sold out
                                </Tag>
                              ) : null}
                              {isLow ? (
                                <Tag className="text-[10px]/[14px]" tone="warning">
                                  Low
                                </Tag>
                              ) : null}
                            </span>
                          </td>
                          <td className="px-3.5 py-1.5 text-right">
                            <Switch
                              aria-label={`${label} available`}
                              defaultChecked={v.available}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-md bg-surface-muted px-3.5 py-3 text-[13px]/[19px] text-fg-muted">
                Add sizes or colours to sell this product in more than one option.
              </p>
            )}
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard title="Status">
            <div className="flex flex-col gap-2.5">
              <RadioCard
                name="status"
                value="PUBLISHED"
                defaultChecked={product.status === 'PUBLISHED'}
              >
                <span className="text-[13px]/[19px] font-semibold">Published</span>
                <span className="text-xs text-fg-muted">Visible on {MOCK_MERCHANT.address}</span>
              </RadioCard>
              <RadioCard
                name="status"
                value="DRAFT"
                defaultChecked={product.status !== 'PUBLISHED'}
              >
                <span className="text-[13px]/[19px] font-semibold">Draft</span>
                <span className="text-xs text-fg-muted">Hidden from customers</span>
              </RadioCard>
            </div>
          </SectionCard>

          <SectionCard title="Organisation">
            <Field label="Category" htmlFor="category">
              <Select id="category" name="category" defaultValue={product.category}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Collections" htmlFor="collections">
              <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1.5">
                {product.collections.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-xs bg-surface-muted px-2 py-0.5 text-xs font-medium"
                  >
                    {c}
                    <button type="button" aria-label={`Remove ${c}`}>
                      <X className="size-3" aria-hidden />
                    </button>
                  </span>
                ))}
                <input
                  id="collections"
                  placeholder="Add…"
                  className="min-w-16 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-fg-subtle"
                />
              </div>
            </Field>
          </SectionCard>

          <SectionCard title="Inventory">
            <div className="grid grid-cols-3 overflow-hidden rounded-md bg-paper">
              {[
                { v: units, l: 'units in stock', cls: 'text-fg' },
                { v: low, l: 'low', cls: 'text-warning' },
                { v: soldOut, l: 'sold out', cls: 'text-danger' },
              ].map((s, i) => (
                <div
                  key={s.l}
                  className={cn(
                    'flex flex-col gap-0.5 px-2.5 py-2.5 whitespace-nowrap',
                    i > 0 && 'border-l border-line',
                  )}
                >
                  <span className={cn('font-display text-lg font-semibold', s.cls)}>{s.v}</span>
                  <span className="text-[11px]/[14px] text-fg-muted">{s.l}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px]/[19px] font-medium">Track stock</span>
                <span className="text-xs text-fg-muted">
                  Stock goes down when an order is paid.
                </span>
              </span>
              <Switch aria-label="Track stock" defaultChecked={product.trackStock} />
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px]/[19px] font-medium">Sell when sold out</span>
                <span className="text-xs text-fg-muted">
                  Let customers order variants with 0 stock.
                </span>
              </span>
              <Switch aria-label="Sell when sold out" defaultChecked={product.sellWhenSoldOut} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="alert" className="text-[13px]/[19px] font-medium">
                Low-stock alert at
              </label>
              <div className="w-[76px] shrink-0">
                <Input
                  id="alert"
                  name="lowStockAlert"
                  inputMode="numeric"
                  defaultValue={product.lowStockAlert}
                  suffix={<span className="text-xs">units</span>}
                  className="h-8"
                />
              </div>
            </div>
          </SectionCard>

          <Card className="gap-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px]/[21px] text-fg">Storefront preview</CardTitle>
              <div className="flex overflow-hidden rounded-sm border border-line">
                <span className="flex size-7 items-center justify-center bg-surface-muted">
                  <Smartphone className="size-3.5" aria-label="Phone" />
                </span>
                <span className="flex size-7 items-center justify-center text-fg-subtle">
                  <Monitor className="size-3.5" aria-label="Desktop" />
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-line bg-store-page p-3.5 text-store-ink">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold">{MOCK_MERCHANT.storeName}</span>
                <ShoppingBag className="size-3.5" aria-hidden />
              </div>
              {preview ? (
                <Thumb src={preview} size={248} className="aspect-[5/4] h-auto w-full rounded-xs" />
              ) : (
                <span className="flex aspect-[5/4] w-full items-center justify-center rounded-xs bg-store-band text-xs text-store-muted">
                  No image yet
                </span>
              )}
              <span className="flex flex-col">
                <span className="text-[13px]/[19px] font-semibold">
                  {product.name || 'Product name'}
                </span>
                <span className="text-[13px]/[19px]">
                  {product.priceKobo ? formatKobo(product.priceKobo) : '₦—'}
                </span>
              </span>
              {product.sizes.length > 1 ? (
                <span className="flex gap-1.5">
                  {product.sizes.map((s, i) => {
                    const out = soldOutVariant?.size === s;
                    return (
                      <span
                        key={s}
                        className={cn(
                          'flex h-7 min-w-8 items-center justify-center rounded-xs border px-2 text-[11px]/[14px] font-semibold',
                          i === 1 ? 'border-store-ink' : 'border-store-border',
                          out && 'text-store-muted',
                        )}
                      >
                        {s}
                      </span>
                    );
                  })}
                </span>
              ) : null}
              <span className="mt-1 flex h-9 items-center justify-center rounded-sm bg-store-ink text-xs font-semibold text-white">
                Add to cart
              </span>
            </div>
            {soldOutVariant ? (
              <p className="text-xs text-fg-muted">
                {soldOutVariant.size} {soldOutVariant.colour} is sold out, so customers can’t select
                it.
              </p>
            ) : null}
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}
