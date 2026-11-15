import { formatKobo } from '@ojara/shared';
import { Camera, Check, CircleCheck, Pencil, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { NativeSelect } from '@/components/onboarding/fields';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { PhonePreview, ProductsSoFar } from '@/components/onboarding/phone-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DRAFT_PRODUCT, ONBOARDING_PRODUCTS, PRODUCT_CATEGORIES } from '@/mock/onboarding';

export const metadata: Metadata = { title: 'Set up your store · Add products' };

function SmallField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className ?? ''}`}>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-fg">
        {label}
      </label>
      {children}
    </div>
  );
}

/** 02.06 Onboarding 3 · Add your first products (visual form). */
export default function OnboardingProductsPage() {
  return (
    <OnboardingShell
      step={3}
      title="Add your first products"
      subtitle="Start with three or more. You can add the rest later — the Free plan holds up to 20."
      formClassName="gap-[18px]"
      preview={
        <PhonePreview caption="Your store so far">
          <ProductsSoFar />
        </PhonePreview>
      }
    >
      <ul className="overflow-hidden rounded-lg border border-line bg-surface">
        {ONBOARDING_PRODUCTS.map((p) => (
          <li
            key={p.name}
            className="flex items-center gap-3 border-line px-3.5 py-2.5 not-first:border-t"
          >
            <Image
              src={p.image}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-md object-cover"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-ui font-semibold text-fg">{p.name}</span>
              <span className="truncate text-xs text-fg-muted">
                {formatKobo(p.priceKobo)} · {p.stock} in stock
                {p.variants ? ` · ${p.variants}` : ''}
              </span>
            </span>
            <CircleCheck className="size-[18px] shrink-0 text-success" aria-label="Saved" />
            <button
              type="button"
              aria-label={`Edit ${p.name}`}
              className="rounded-xs p-0.5 text-fg-subtle hover:text-fg"
            >
              <Pencil className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3.5 rounded-lg border-[1.5px] border-forest bg-surface p-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-ui font-bold text-fg">{DRAFT_PRODUCT.label}</h2>
          <span className="text-xs text-fg-subtle">Tip: phone photos in daylight work great</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex shrink-0 gap-2">
            <Image
              src={DRAFT_PRODUCT.image}
              alt={DRAFT_PRODUCT.name}
              width={88}
              height={88}
              className="size-[88px] rounded-[10px] object-cover"
            />
            <label className="flex size-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border-[1.5px] border-line-strong bg-paper text-[11px] font-semibold text-fg hover:bg-selected has-focus-visible:shadow-focus">
              <Camera className="size-[18px]" aria-hidden />
              Add photo
              <input type="file" accept="image/*" multiple className="sr-only" />
            </label>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <SmallField label="Product name" htmlFor="product-name">
              <Input id="product-name" name="name" defaultValue={DRAFT_PRODUCT.name} />
            </SmallField>
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              <SmallField label="Price" htmlFor="price" className="w-[110px]">
                <Input
                  id="price"
                  name="price"
                  inputMode="numeric"
                  prefix="₦"
                  defaultValue={DRAFT_PRODUCT.price}
                />
              </SmallField>
              <SmallField label="In stock" htmlFor="stock" className="w-[84px]">
                <Input
                  id="stock"
                  name="stock"
                  inputMode="numeric"
                  defaultValue={DRAFT_PRODUCT.stock}
                />
              </SmallField>
              <SmallField label="Category" htmlFor="category" className="min-w-[110px] flex-1">
                <NativeSelect
                  id="category"
                  name="category"
                  size="sm"
                  defaultValue={DRAFT_PRODUCT.category}
                >
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </NativeSelect>
              </SmallField>
            </div>
          </div>
        </div>
        <label
          htmlFor="has-variants"
          className="flex cursor-pointer items-center gap-2.5 rounded-md bg-paper px-3 py-2.5 text-ui text-fg"
        >
          <Switch id="has-variants" name="hasVariants" />
          This product comes in different sizes or colours
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary">
            <Plus /> Save &amp; add another
          </Button>
          <Button type="button">
            <Check /> Save product
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
