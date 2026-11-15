import { formatKobo } from '@ojara/shared';
import { Archive, Check, GripVertical, ImagePlus, Inbox, Plus, X } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SplitPage } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import { Thumb } from '@/components/dashboard/thumb';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { DetailPanel, SectionLabel } from '@/components/ui/panels';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  ARCHIVED_CATEGORIES,
  CATEGORIES,
  CATEGORY_DESCRIPTIONS,
  type MockCategory,
} from '@/mock/dashboard';

export const metadata: Metadata = { title: 'Categories' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const DEFAULT_SELECTED = 'dresses';

const NEW_CATEGORY: MockCategory = {
  id: 'new',
  name: '',
  description: '',
  products: 0,
  inMenu: true,
  image: '',
  items: [],
};

/** "Edit category" form: name, description, cover image, products, archive / save footer. */
function CategoryEditor({ category, closeHref }: { category: MockCategory; closeHref: string }) {
  const isNew = category.id === 'new';
  const more = category.products - category.items.length;
  return (
    <form className="flex min-h-full flex-1 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
        <span className="flex flex-col gap-0.5">
          <SectionLabel className="text-[11px]/[14px]">
            {isNew ? 'New category' : 'Edit category'}
          </SectionLabel>
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.4px]">
            {category.name || 'Untitled category'}
          </h2>
        </span>
        <Link
          href={closeHref}
          scroll={false}
          aria-label="Close"
          className="inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-selected"
        >
          <X className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-[18px] px-6 py-5">
        <Field label="Name" htmlFor="category-name">
          <Input
            id="category-name"
            name="name"
            defaultValue={category.name}
            placeholder="e.g. Dresses"
            className="text-sm"
          />
        </Field>
        <Field label="Description (optional)" htmlFor="category-description">
          <Textarea
            id="category-description"
            name="description"
            defaultValue={CATEGORY_DESCRIPTIONS[category.id] ?? category.description}
            className="min-h-16 text-[13px]/[19px]"
            rows={2}
          />
        </Field>
        <div className="flex flex-col gap-2">
          <span className="text-[13px]/[19px] font-semibold">Cover image</span>
          <div className="flex items-center gap-3">
            {category.image ? (
              <Thumb src={category.image} size={72} className="rounded-md" />
            ) : (
              <span className="flex size-[72px] items-center justify-center rounded-md bg-surface-muted">
                <ImagePlus className="size-5 text-fg-muted" aria-hidden />
              </span>
            )}
            <span className="flex flex-col gap-1">
              <span className="text-xs text-fg-muted">Shown on your homepage category tiles.</span>
              <button type="button" className="w-fit text-[13px]/[19px] font-semibold">
                {category.image ? 'Change image' : 'Upload image'}
              </button>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px]/[19px] font-semibold">
            Products in this category ({category.products})
          </span>
          <div className="overflow-hidden rounded-md border border-line">
            <ul>
              {category.items.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center gap-2.5 border-b border-line px-3 py-2 last:border-b-0"
                >
                  <Thumb src={p.image} size={32} className="rounded-sm" />
                  <span className="min-w-0 flex-1 truncate text-[13px]/[19px] font-medium">
                    {p.name}
                  </span>
                  <span className="text-xs text-fg-muted">{formatKobo(p.priceKobo)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    className="text-fg-subtle hover:text-fg"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line bg-paper px-3 py-2 text-xs">
              <span className="text-fg-muted">{more > 0 ? `+ ${more} more` : ''}</span>
              <Link href="/products" className="font-semibold">
                Add products
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line px-6 py-4">
        {isNew ? (
          <span />
        ) : (
          <button
            type="button"
            className="flex items-center gap-1.5 text-[13px]/[19px] font-semibold text-danger"
          >
            <Archive className="size-4" aria-hidden /> Archive category
          </button>
        )}
        <Button type="submit">
          <Check /> Save
        </Button>
      </div>
    </form>
  );
}

/** 03.09 Categories: menu-order table, archived list, "Edit category" panel. */
export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const param = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const selectedId = param === 'none' ? undefined : (param ?? DEFAULT_SELECTED);
  const selected =
    selectedId === 'new' ? NEW_CATEGORY : CATEGORIES.find((c) => c.id === selectedId);
  const closeHref = '/categories?category=none';

  return (
    <SplitPage
      panel={
        selected ? (
          <DetailPanel aria-label="Edit category" className="w-[420px]">
            <CategoryEditor category={selected} closeHref={closeHref} />
          </DetailPanel>
        ) : null
      }
    >
      <PageHeader
        title="Categories"
        className="max-lg:[&_h1]:hidden"
        subtitle="Group products so customers can browse your store."
        actions={
          <Button asChild className="hidden lg:inline-flex">
            <Link href="/categories?category=new" scroll={false}>
              <Plus /> New category
            </Link>
          </Button>
        }
      />

      {param && selected ? (
        <section className="overflow-hidden rounded-lg border border-line bg-surface xl:hidden">
          <CategoryEditor category={selected} closeHref={closeHref} />
        </section>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-paper">
              <tr className="text-left text-[11px]/[14px] font-semibold tracking-[0.6px] text-fg-subtle uppercase">
                <th className="py-[9px] pr-3 pl-11 font-semibold">Category</th>
                <th className="px-3 py-[9px] font-semibold">Products</th>
                <th className="px-5 py-[9px] font-semibold">In store menu</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((c) => {
                const on = c.id === selected?.id;
                return (
                  <tr
                    key={c.id}
                    className={cn(
                      'border-t border-line',
                      on && 'bg-selected shadow-[inset_3px_0_0_var(--ojara-forest)]',
                    )}
                  >
                    <td className="py-3 pr-3 pl-4">
                      <span className="flex items-center gap-3">
                        <GripVertical
                          className="size-4 shrink-0 cursor-grab text-fg-subtle"
                          aria-label={`Drag ${c.name}`}
                        />
                        <Thumb src={c.image} size={44} />
                        <Link
                          href={`/categories?category=${c.id}`}
                          scroll={false}
                          className="flex min-w-0 flex-col gap-0.5"
                        >
                          <span className="text-sm font-semibold hover:underline">{c.name}</span>
                          <span className="truncate text-xs text-fg-muted">{c.description}</span>
                        </Link>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[13px]/[19px]">{c.products}</td>
                    <td className="px-5 py-3">
                      <Switch
                        aria-label={`Show ${c.name} in store menu`}
                        defaultChecked={c.inMenu}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-line bg-paper/60">
                <td className="py-3 pr-3 pl-11">
                  <span className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-muted">
                      <Inbox className="size-4 text-fg-muted" aria-hidden />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-fg-muted">Not in a category</span>
                      <span className="text-xs text-fg-subtle">Still shown under Shop all</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[13px]/[19px] text-fg-muted">0</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="-mt-1.5 flex items-center gap-2 text-xs text-fg-muted">
        <GripVertical className="size-3.5 text-fg-subtle" aria-hidden />
        Drag rows to change the order of your store menu.
      </p>

      <section className="flex flex-col gap-2">
        <SectionLabel className="text-[11px]/[14px]">Archived</SectionLabel>
        {ARCHIVED_CATEGORIES.map((a) => (
          <div
            key={a.name}
            className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted">
              <Archive className="size-4 text-fg-muted" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium text-fg-muted">{a.name}</span>
              <span className="text-xs text-fg-subtle">{a.detail}</span>
            </span>
            <button type="button" className="text-[13px]/[19px] font-semibold">
              Restore
            </button>
          </div>
        ))}
      </section>
    </SplitPage>
  );
}
