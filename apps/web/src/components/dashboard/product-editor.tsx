'use client';

import Image from 'next/image';
import {
  CATALOG_LIMITS,
  type CategoryDto,
  formatKobo,
  type ProductDetailDto,
  variantKey,
  variantLabel,
} from '@ojara/shared';
import {
  Archive,
  ArchiveRestore,
  Check,
  CircleAlert,
  CircleCheck,
  ImagePlus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  startTransition,
  useActionState,
  useState,
  useTransition,
} from 'react';
import {
  type ProductFormState,
  saveProduct,
  setProductArchived,
} from '@/app/(dashboard)/dash/products/actions';
import { PageHeader } from '@/components/app/page-header';
import { PlanLockTag, StatusPill, Tag } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Field, RadioCard, Select, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ProductPhotos } from './product-photos';
import { UnsavedIndicator } from './unsaved-indicator';

/* ----------------------------------------- helpers ----------------------------------------- */

/** "18,500" / "₦18500.50" -> kobo; "" -> null; anything unparsable -> NaN (the schema rejects it). */
function toKobo(text: string): number | null {
  const cleaned = text.replace(/[₦,\s]/g, '');
  if (cleaned === '') return null;
  const naira = Number(cleaned);
  return Number.isFinite(naira) ? Math.round(naira * 100) : Number.NaN;
}

const toNaira = (kobo: number | null) =>
  kobo === null ? '' : (kobo / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 });

function toCount(text: string): number {
  const n = Number(text.replace(/[,\s]/g, ''));
  return Number.isInteger(n) ? n : Number.NaN;
}

interface OptionState {
  name: string;
  values: string[];
  /** Text in the "add value" box. */
  draft: string;
}

interface VariantRow {
  sku: string;
  price: string;
  stock: string;
  isActive: boolean;
}

const EMPTY_ROW: VariantRow = { sku: '', price: '', stock: '0', isActive: true };
const OPTION_PRESETS = ['Size', 'Colour', 'Material', 'Style'];

/** Every combination of the option values, in option order: S/Indigo, S/Rust, M/Indigo… */
function combinations(options: { name: string; values: string[] }[]): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, o) => acc.flatMap((combo) => o.values.map((v) => ({ ...combo, [o.name]: v }))),
    [{}],
  );
}

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

function ErrorText({ children }: { children?: string | undefined }) {
  return children ? <p className="text-xs font-medium text-danger">{children}</p> : null;
}

/* ------------------------------------------ editor ------------------------------------------ */

/**
 * 03.05 Add / edit product. Holds the form in client state (variants are regenerated as options
 * change, keeping what was typed for combinations that still exist) and posts one JSON payload to
 * the `saveProduct` Server Action, which validates it with the shared schema.
 */
export function ProductEditor({
  product,
  categories,
  storeName,
  storeAddress,
  promotionsAllowed,
  storeId,
  maxImages,
  maxImageBytes,
  notice,
}: {
  product: ProductDetailDto | null;
  categories: Pick<CategoryDto, 'id' | 'name'>[];
  storeName: string;
  storeAddress: string;
  promotionsAllowed: boolean;
  storeId: string;
  maxImages: number;
  maxImageBytes: number;
  notice?: 'saved' | 'archived' | 'restored' | undefined;
}) {
  const formId = 'product-form';
  const isNew = product === null;
  const archived = product?.status === 'ARCHIVED';

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>(
    product?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
  );
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '');
  const [price, setPrice] = useState(toNaira(product?.basePriceKobo ?? null));
  const [promo, setPromo] = useState(toNaira(product?.promoPriceKobo ?? null));
  const [cost, setCost] = useState(toNaira(product?.costKobo ?? null));
  const [trackStock, setTrackStock] = useState(product?.trackStock ?? true);
  const [sellWhenSoldOut, setSellWhenSoldOut] = useState(product?.sellWhenSoldOut ?? false);
  const [lowStock, setLowStock] = useState(String(product?.lowStockThreshold ?? 3));
  const [options, setOptions] = useState<OptionState[]>(
    (product?.options ?? []).map((o) => ({ ...o, draft: '' })),
  );
  const [rows, setRows] = useState<Record<string, VariantRow>>(() =>
    Object.fromEntries(
      (product?.variants ?? []).map((v) => [
        variantKey(v.options),
        {
          sku: v.sku ?? '',
          price: toNaira(v.priceKobo),
          stock: String(v.stockQuantity),
          isActive: v.isActive,
        },
      ]),
    ),
  );
  const [localError, setLocalError] = useState<string>();
  const [cover, setCover] = useState<string | null>(product?.images[0]?.publicId ?? null);

  const [state, formAction, saving] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [archiving, startArchive] = useTransition();
  const [archiveError, setArchiveError] = useState<string>();
  const errors = state.fieldErrors ?? {};

  const completeOptions = options.filter((o) => o.name.trim() && o.values.length > 0);
  const combos = combinations(
    completeOptions.map((o) => ({ name: o.name.trim(), values: o.values })),
  );
  const variants = combos.map((options) => ({
    options,
    key: variantKey(options),
    label: variantLabel(
      options,
      completeOptions.map((o) => ({ name: o.name.trim() })),
    ),
    row: rows[variantKey(options)] ?? EMPTY_ROW,
  }));
  const hasOptions = completeOptions.length > 0;

  const basePrice = toKobo(price);
  const promoPrice = toKobo(promo);
  const costPrice = toKobo(cost);
  const threshold = toCount(lowStock);
  const active = variants.filter((v) => v.row.isActive);
  const units = active.reduce((n, v) => n + (toCount(v.row.stock) || 0), 0);
  const low = active.filter((v) => {
    const s = toCount(v.row.stock);
    return s > 0 && s <= threshold;
  }).length;
  const soldOut = active.filter((v) => toCount(v.row.stock) === 0).length;
  const margin =
    basePrice && costPrice && basePrice > 0
      ? Math.round(((basePrice - costPrice) / basePrice) * 100)
      : undefined;

  const updateRow = (key: string, patch: Partial<VariantRow>) =>
    setRows((r) => ({ ...r, [key]: { ...(r[key] ?? EMPTY_ROW), ...patch } }));

  const updateOption = (i: number, patch: Partial<OptionState>) =>
    setOptions((opts) => opts.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  function addValue(i: number) {
    const option = options[i];
    if (!option) return;
    const values = option.draft
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v && !option.values.some((x) => x.toLowerCase() === v.toLowerCase()));
    updateOption(i, {
      values: [...option.values, ...values].slice(0, CATALOG_LIMITS.maxOptionValues),
      draft: '',
    });
  }

  function onValueKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue(i);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(undefined);
    const incomplete = options.find(
      (o) => (o.name.trim() && o.values.length === 0) || (!o.name.trim() && o.values.length > 0),
    );
    if (incomplete) {
      setLocalError(
        incomplete.name.trim()
          ? `Add at least one value to “${incomplete.name.trim()}”, or remove it.`
          : 'Give every option a name, e.g. Size.',
      );
      return;
    }
    if (variants.length > CATALOG_LIMITS.maxVariants) {
      setLocalError(`A product can have up to ${CATALOG_LIMITS.maxVariants} variants.`);
      return;
    }
    const payload = {
      name,
      description,
      status,
      categoryId: categoryId || null,
      basePriceKobo: basePrice ?? Number.NaN,
      promoPriceKobo: promotionsAllowed ? promoPrice : null,
      costKobo: costPrice,
      trackStock,
      sellWhenSoldOut,
      lowStockThreshold: threshold,
      options: completeOptions.map((o) => ({ name: o.name.trim(), values: o.values })),
      variants: variants.map((v) => ({
        options: v.options,
        sku: v.row.sku,
        priceKobo: toKobo(v.row.price),
        stockQuantity: toCount(v.row.stock),
        isActive: v.row.isActive,
      })),
    };
    const data = new FormData();
    data.set('payload', JSON.stringify(payload));
    if (product) data.set('productId', product.id);
    startTransition(() => formAction(data));
  }

  function toggleArchive() {
    if (!product) return;
    setArchiveError(undefined);
    startArchive(async () => {
      const result = await setProductArchived(product.id, !archived);
      if (result.message) setArchiveError(result.message);
    });
  }

  const formMessage = localError ?? state.message ?? archiveError;
  const variantErrors = Object.entries(errors).filter(([k]) => k.startsWith('variants'));
  const previewValues = completeOptions[0];
  const sellable = (row: VariantRow) =>
    row.isActive && (!trackStock || sellWhenSoldOut || toCount(row.stock) > 0);

  return (
    <>
      <PageHeader
        back={{ href: '/products', label: 'Products' }}
        title={isNew ? 'Add product' : product.name}
        className="max-lg:[&_a]:hidden"
        badge={
          archived ? (
            <StatusPill tone="neutral">Archived</StatusPill>
          ) : product?.status === 'PUBLISHED' ? (
            <StatusPill tone="success">Published</StatusPill>
          ) : isNew ? null : (
            <StatusPill tone="neutral">Draft</StatusPill>
          )
        }
        actions={
          <>
            <UnsavedIndicator formId={formId} className="hidden sm:flex" />
            {product ? (
              <Button
                type="button"
                variant="secondary"
                onClick={toggleArchive}
                disabled={archiving || saving}
              >
                {archived ? <ArchiveRestore /> : <Archive />}
                {archiving ? 'Working…' : archived ? 'Restore' : 'Archive'}
              </Button>
            ) : null}
            <Button type="submit" form={formId} disabled={saving || archiving}>
              <Check /> {saving ? 'Saving…' : isNew ? 'Save product' : 'Save changes'}
            </Button>
          </>
        }
      />

      {notice && !formMessage ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-md bg-success-soft px-3.5 py-3 text-ui text-success"
        >
          <CircleCheck className="size-4 shrink-0" aria-hidden />
          {notice === 'saved'
            ? 'Product saved.'
            : notice === 'archived'
              ? 'Product archived. It’s hidden from your store and no longer counts towards your plan.'
              : 'Product restored as a draft. Publish it when you’re ready.'}
        </p>
      ) : null}
      {formMessage ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md bg-danger-soft px-3.5 py-3 text-ui text-danger"
        >
          <CircleAlert className="mt-px size-4 shrink-0" aria-hidden />
          {formMessage}
        </p>
      ) : null}

      <form
        id={formId}
        onSubmit={onSubmit}
        noValidate
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard title="Details">
            <Field label="Product name" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="e.g. Adire Wrap Dress"
                aria-invalid={errors.name ? true : undefined}
              />
              <ErrorText>{errors.name}</ErrorText>
            </Field>
            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={5000}
                className="min-h-24 text-sm leading-[21px]"
                placeholder="Fabric, fit, how it’s made…"
              />
            </Field>
          </SectionCard>

          <SectionCard
            title="Images"
            description="The first image is shown on your storefront and in shared links."
          >
            {product ? (
              <ProductPhotos
                storeId={storeId}
                productId={product.id}
                productName={product.name}
                initialImages={product.images}
                maxImages={maxImages}
                maxBytes={maxImageBytes}
                onImagesChange={(images) => setCover(images[0]?.publicId ?? null)}
              />
            ) : (
              <div className="flex items-center gap-3 rounded-md border border-dashed border-line-strong bg-surface-muted/60 p-4">
                <ImagePlus className="size-5 shrink-0 text-fg-muted" aria-hidden />
                <p className="text-[13px]/[19px] text-fg-muted">
                  Save the product first, then add up to {maxImages} photos.
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Pricing"
            description="Paystack’s processing fee comes out of each payout. It is separate from your Ojara plan."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price" htmlFor="price">
                <Input
                  id="price"
                  inputMode="decimal"
                  prefix="₦"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  aria-invalid={errors.basePriceKobo ? true : undefined}
                />
                <ErrorText>{errors.basePriceKobo}</ErrorText>
              </Field>
              <Field
                label="Promotional price"
                htmlFor="promo"
                aside={
                  promotionsAllowed ? undefined : (
                    <PlanLockTag plan="STARTER" className="mr-auto ml-2" />
                  )
                }
                hint={
                  promotionsAllowed
                    ? 'Shown as a sale price, with the price crossed out.'
                    : 'Run sales and discounts on the Starter plan.'
                }
              >
                <Input
                  id="promo"
                  inputMode="decimal"
                  prefix="₦"
                  placeholder="—"
                  value={promotionsAllowed ? promo : ''}
                  onChange={(e) => setPromo(e.target.value)}
                  disabled={!promotionsAllowed}
                  className={promotionsAllowed ? undefined : 'cursor-not-allowed'}
                  aria-invalid={errors.promoPriceKobo ? true : undefined}
                />
                <ErrorText>{errors.promoPriceKobo}</ErrorText>
              </Field>
              <Field
                label="Cost per item"
                htmlFor="cost"
                hint={`Private${margin !== undefined ? ` · Margin ${margin}%` : ''}`}
              >
                <Input
                  id="cost"
                  inputMode="decimal"
                  prefix="₦"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  aria-invalid={errors.costKobo ? true : undefined}
                />
                <ErrorText>{errors.costKobo}</ErrorText>
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Variants"
            description="Add options like size or colour. Each combination gets its own stock, and can have its own price."
          >
            <div className="flex flex-col gap-3">
              {options.map((o, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-md border border-line p-3 sm:flex-row sm:items-start"
                >
                  <div className="sm:w-[132px] sm:shrink-0">
                    <Input
                      aria-label={`Option ${i + 1} name`}
                      list="option-presets"
                      value={o.name}
                      maxLength={20}
                      onChange={(e) => updateOption(i, { name: e.target.value })}
                      placeholder="e.g. Size"
                      className="h-8"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    {o.values.map((v) => (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 rounded-pill bg-surface-muted px-2.5 py-1 text-xs font-medium"
                      >
                        {v}
                        <button
                          type="button"
                          aria-label={`Remove ${v}`}
                          onClick={() =>
                            updateOption(i, { values: o.values.filter((x) => x !== v) })
                          }
                        >
                          <X className="size-3" aria-hidden />
                        </button>
                      </span>
                    ))}
                    <input
                      aria-label={`Add a value to ${o.name || 'this option'}`}
                      value={o.draft}
                      maxLength={30}
                      onChange={(e) => updateOption(i, { draft: e.target.value })}
                      onKeyDown={(e) => onValueKey(i, e)}
                      onBlur={() => addValue(i)}
                      placeholder={o.values.length ? 'Add…' : 'Type a value, press Enter'}
                      className="h-7 min-w-28 flex-1 bg-transparent px-1 text-xs outline-none placeholder:text-fg-subtle"
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove option ${o.name || i + 1}`}
                    onClick={() => setOptions((opts) => opts.filter((_, j) => j !== i))}
                    className="self-end text-fg-subtle hover:text-danger sm:self-center"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ))}
              <datalist id="option-presets">
                {OPTION_PRESETS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              {options.length < CATALOG_LIMITS.maxOptions ? (
                <button
                  type="button"
                  onClick={() =>
                    setOptions((opts) => [
                      ...opts,
                      {
                        name: OPTION_PRESETS.find((p) => !opts.some((o) => o.name === p)) ?? '',
                        values: [],
                        draft: '',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 self-start text-ui font-semibold text-fg hover:underline"
                >
                  <Plus className="size-3.5" aria-hidden />{' '}
                  {options.length ? 'Add another option' : 'Add options like size or colour'}
                </button>
              ) : null}
            </div>

            {hasOptions ? (
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[600px] border-collapse text-[13px]/[19px]">
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
                    {variants.map((v, i) => {
                      const stock = toCount(v.row.stock);
                      const isLow = trackStock && stock > 0 && stock <= threshold;
                      return (
                        <tr key={v.key} className="border-t border-line">
                          <td className="px-3.5 py-1.5 whitespace-nowrap">{v.label}</td>
                          <td className="w-[130px] px-3 py-1.5">
                            <Input
                              aria-label={`SKU for ${v.label}`}
                              value={v.row.sku}
                              maxLength={64}
                              onChange={(e) => updateRow(v.key, { sku: e.target.value })}
                              aria-invalid={errors[`variants.${i}.sku`] ? true : undefined}
                              className="h-8"
                            />
                          </td>
                          <td className="w-[136px] px-3 py-1.5">
                            <Input
                              aria-label={`Price for ${v.label}`}
                              prefix="₦"
                              inputMode="decimal"
                              placeholder={price || '—'}
                              value={v.row.price}
                              onChange={(e) => updateRow(v.key, { price: e.target.value })}
                              aria-invalid={errors[`variants.${i}.priceKobo`] ? true : undefined}
                              className="h-8"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <span className="flex items-center gap-2.5">
                              <Input
                                aria-label={`Stock for ${v.label}`}
                                inputMode="numeric"
                                value={v.row.stock}
                                onChange={(e) => updateRow(v.key, { stock: e.target.value })}
                                aria-invalid={
                                  errors[`variants.${i}.stockQuantity`] ? true : undefined
                                }
                                className="h-8 w-16"
                              />
                              {trackStock && stock === 0 ? (
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
                              aria-label={`${v.label} available`}
                              checked={v.row.isActive}
                              onCheckedChange={(on) => updateRow(v.key, { isActive: on })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
            {variantErrors.length ? (
              <ErrorText>
                {variantErrors.length === 1
                  ? variantErrors[0]?.[1]
                  : `${variantErrors[0]?.[1]} (and ${variantErrors.length - 1} more)`}
              </ErrorText>
            ) : null}
            <ErrorText>{errors.options ?? errors['options.0.values']}</ErrorText>
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <SectionCard title="Status">
            {archived ? (
              <p className="text-[13px]/[19px] text-fg-muted">
                Archived products are hidden from your store. Restore it to publish it again.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                <RadioCard
                  name="status"
                  value="PUBLISHED"
                  checked={status === 'PUBLISHED'}
                  onChange={() => setStatus('PUBLISHED')}
                >
                  <span className="text-[13px]/[19px] font-semibold">Published</span>
                  <span className="text-xs text-fg-muted">Visible on {storeAddress}</span>
                </RadioCard>
                <RadioCard
                  name="status"
                  value="DRAFT"
                  checked={status === 'DRAFT'}
                  onChange={() => setStatus('DRAFT')}
                >
                  <span className="text-[13px]/[19px] font-semibold">Draft</span>
                  <span className="text-xs text-fg-muted">Hidden from customers</span>
                </RadioCard>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Organisation">
            <Field
              label="Category"
              htmlFor="category"
              hint={categories.length ? undefined : 'Create categories on the Categories page.'}
            >
              <Select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </SectionCard>

          <SectionCard title="Inventory">
            {!hasOptions ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Stock" htmlFor="stock">
                  <Input
                    id="stock"
                    inputMode="numeric"
                    value={(rows[''] ?? EMPTY_ROW).stock}
                    onChange={(e) => updateRow('', { stock: e.target.value })}
                    aria-invalid={errors['variants.0.stockQuantity'] ? true : undefined}
                    className="h-9"
                  />
                </Field>
                <Field label="SKU" htmlFor="sku">
                  <Input
                    id="sku"
                    value={(rows[''] ?? EMPTY_ROW).sku}
                    maxLength={64}
                    onChange={(e) => updateRow('', { sku: e.target.value })}
                    aria-invalid={errors['variants.0.sku'] ? true : undefined}
                    placeholder="Optional"
                    className="h-9"
                  />
                </Field>
              </div>
            ) : null}
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
              <Switch
                aria-label="Track stock"
                checked={trackStock}
                onCheckedChange={setTrackStock}
              />
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="flex flex-col gap-0.5">
                <span className="text-[13px]/[19px] font-medium">Sell when sold out</span>
                <span className="text-xs text-fg-muted">
                  Let customers order variants with 0 stock.
                </span>
              </span>
              <Switch
                aria-label="Sell when sold out"
                checked={sellWhenSoldOut}
                onCheckedChange={setSellWhenSoldOut}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="alert" className="text-[13px]/[19px] font-medium">
                Low-stock alert at
              </label>
              <div className="w-[76px] shrink-0">
                <Input
                  id="alert"
                  inputMode="numeric"
                  value={lowStock}
                  onChange={(e) => setLowStock(e.target.value)}
                  suffix={<span className="text-xs">units</span>}
                  aria-invalid={errors.lowStockThreshold ? true : undefined}
                  className="h-8"
                />
              </div>
            </div>
            <ErrorText>{errors.lowStockThreshold}</ErrorText>
          </SectionCard>

          <Card className="gap-3.5">
            <CardTitle className="text-[15px]/[21px] text-fg">Storefront preview</CardTitle>
            <div className="flex flex-col gap-2 rounded-md border border-line bg-store-page p-3.5 text-store-ink">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold">{storeName}</span>
                <ShoppingBag className="size-3.5" aria-hidden />
              </div>
              {cover ? (
                <span className="relative aspect-[5/4] w-full overflow-hidden rounded-xs">
                  <Image src={cover} alt="" fill sizes="290px" className="object-cover" />
                </span>
              ) : (
                <span className="flex aspect-[5/4] w-full items-center justify-center rounded-xs bg-store-band text-xs text-store-muted">
                  No image yet
                </span>
              )}
              <span className="flex flex-col">
                <span className="text-[13px]/[19px] font-semibold">{name || 'Product name'}</span>
                <span className="flex items-baseline gap-1.5 text-[13px]/[19px]">
                  {promotionsAllowed && promoPrice && basePrice && promoPrice < basePrice ? (
                    <>
                      {formatKobo(promoPrice)}
                      <span className="text-xs text-store-muted line-through">
                        {formatKobo(basePrice)}
                      </span>
                    </>
                  ) : basePrice && Number.isInteger(basePrice) && basePrice > 0 ? (
                    formatKobo(basePrice)
                  ) : (
                    '₦—'
                  )}
                </span>
              </span>
              {previewValues && previewValues.values.length > 1 ? (
                <span className="flex flex-wrap gap-1.5">
                  {previewValues.values.map((value) => {
                    const available = variants.some(
                      (v) => v.options[previewValues.name.trim()] === value && sellable(v.row),
                    );
                    return (
                      <span
                        key={value}
                        className={cn(
                          'flex h-7 min-w-8 items-center justify-center rounded-xs border border-store-border px-2 text-[11px]/[14px] font-semibold',
                          !available && 'text-store-muted line-through',
                        )}
                      >
                        {value}
                      </span>
                    );
                  })}
                </span>
              ) : null}
              <span className="mt-1 flex h-9 items-center justify-center rounded-sm bg-store-ink text-xs font-semibold text-white">
                Add to cart
              </span>
            </div>
          </Card>
        </div>
      </form>
    </>
  );
}
