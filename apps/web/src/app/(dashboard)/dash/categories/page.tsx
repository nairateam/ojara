import { type CategoryDto, formatKobo } from '@ojara/shared';
import { Archive, Inbox, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SplitPage } from '@/components/app/page-container';
import { PageHeader } from '@/components/app/page-header';
import {
  CategoryForm,
  MenuSwitch,
  MoveButtons,
  RestoreCategoryButton,
} from '@/components/dashboard/category-controls';
import { InitialThumb, ProductThumb } from '@/components/dashboard/thumb';
import { Button } from '@/components/ui/button';
import { DetailPanel, SectionLabel } from '@/components/ui/panels';
import { listCategories, listProducts } from '@/lib/api/catalog';
import { requireMerchant } from '@/lib/auth/guards';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Categories' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const param = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Up to five of the category's products, with a link to the full list. */
async function CategoryProducts({ storeId, category }: { storeId: string; category: CategoryDto }) {
  const list = await listProducts(storeId, { categoryId: category.id, pageSize: 5 });
  const more = list.total - list.items.length;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px]/[19px] font-semibold">
        Products in this category ({category.productCount})
      </span>
      <div className="overflow-hidden rounded-md border border-line">
        {list.items.length ? (
          <ul>
            {list.items.map((p) => (
              <li key={p.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-selected"
                >
                  <ProductThumb
                    publicId={p.coverPublicId}
                    name={p.name}
                    size={32}
                    className="rounded-sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px]/[19px] font-medium">
                    {p.name}
                  </span>
                  <span className="text-xs text-fg-muted">{formatKobo(p.basePriceKobo)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-3 py-3 text-xs text-fg-muted">
            No products yet. Choose this category when you edit a product.
          </p>
        )}
        <div className="flex items-center justify-between border-t border-line bg-paper px-3 py-2 text-xs">
          <span className="text-fg-muted">{more > 0 ? `+ ${more} more` : ''}</span>
          <Link href="/products" className="font-semibold">
            Go to products
          </Link>
        </div>
      </div>
    </div>
  );
}

/** 03.09 Categories: menu order, menu visibility, archived list and the edit panel. */
export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const { membership } = await requireMerchant();
  const { categories, archived, uncategorisedCount } = await listCategories(membership.id);

  const requested = param(sp.category);
  const selectedId = requested === 'none' ? undefined : (requested ?? categories[0]?.id);
  const isNew = selectedId === 'new';
  const selected = isNew ? undefined : categories.find((c) => c.id === selectedId);
  const closeHref = '/categories?category=none';
  const notice = param(sp.saved)
    ? 'Category saved.'
    : param(sp.archived)
      ? 'Category archived. Its products keep it and get it back if you restore it.'
      : undefined;

  const editor =
    isNew || selected ? (
      <CategoryForm
        key={selected?.id ?? 'new'}
        category={selected ?? null}
        closeHref={closeHref}
        notice={notice}
        products={
          selected ? <CategoryProducts storeId={membership.id} category={selected} /> : null
        }
      />
    ) : null;

  return (
    <SplitPage
      panel={
        editor ? (
          <DetailPanel aria-label="Edit category" className="w-[420px]">
            {editor}
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

      {requested && editor ? (
        <section className="overflow-hidden rounded-lg border border-line bg-surface xl:hidden">
          {editor}
        </section>
      ) : null}
      {!editor && notice ? (
        <p role="status" className="rounded-md bg-success-soft px-3.5 py-3 text-ui text-success">
          {notice}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-paper">
              <tr className="text-left text-[11px]/[14px] font-semibold tracking-[0.6px] text-fg-subtle uppercase">
                <th className="py-[9px] pr-3 pl-12 font-semibold">Category</th>
                <th className="px-3 py-[9px] font-semibold">Products</th>
                <th className="px-5 py-[9px] font-semibold">In store menu</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr className="border-t border-line">
                  <td
                    colSpan={3}
                    className="px-5 py-6 text-center text-[13px]/[19px] text-fg-muted"
                  >
                    No categories yet.{' '}
                    <Link href="/categories?category=new" className="font-semibold text-fg">
                      Create your first one
                    </Link>
                    , for example Dresses or Bags.
                  </td>
                </tr>
              ) : null}
              {categories.map((c, i) => {
                const on = c.id === selected?.id;
                return (
                  <tr
                    key={c.id}
                    className={cn(
                      'border-t border-line',
                      on && 'bg-selected shadow-[inset_3px_0_0_var(--ojara-forest)]',
                    )}
                  >
                    <td className="py-3 pr-3 pl-3">
                      <span className="flex items-center gap-3">
                        <MoveButtons
                          id={c.id}
                          name={c.name}
                          first={i === 0}
                          last={i === categories.length - 1}
                        />
                        <InitialThumb name={c.name} size={44} />
                        <Link
                          href={`/categories?category=${c.id}`}
                          scroll={false}
                          className="flex min-w-0 flex-col gap-0.5"
                        >
                          <span className="text-sm font-semibold hover:underline">{c.name}</span>
                          {c.description ? (
                            <span className="truncate text-xs text-fg-muted">{c.description}</span>
                          ) : null}
                        </Link>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[13px]/[19px]">{c.productCount}</td>
                    <td className="px-5 py-3">
                      <MenuSwitch id={c.id} name={c.name} checked={c.showInMenu} />
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-line bg-paper/60">
                <td className="py-3 pr-3 pl-12">
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
                <td className="px-3 py-3 text-[13px]/[19px] text-fg-muted">{uncategorisedCount}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {archived.length ? (
        <section className="flex flex-col gap-2">
          <SectionLabel className="text-[11px]/[14px]">Archived</SectionLabel>
          {archived.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted">
                <Archive className="size-4 text-fg-muted" aria-hidden />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-fg-muted">{a.name}</span>
                <span className="text-xs text-fg-subtle">
                  {a.productCount === 1 ? '1 product' : `${a.productCount} products`} · hidden from
                  your store
                </span>
              </span>
              <RestoreCategoryButton id={a.id} name={a.name} />
            </div>
          ))}
        </section>
      ) : null}
    </SplitPage>
  );
}
