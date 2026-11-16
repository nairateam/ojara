'use client';

import { Archive, ArrowDown, ArrowUp, Check, CircleAlert, ImagePlus, X } from 'lucide-react';
import Link from 'next/link';
import {
  type FormEvent,
  type ReactNode,
  startTransition,
  useActionState,
  useState,
  useTransition,
} from 'react';
import {
  type CategoryFormState,
  moveCategory,
  saveCategory,
  setCategoryArchived,
  setCategoryInMenu,
} from '@/app/(dashboard)/dash/categories/actions';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import { SectionLabel } from '@/components/ui/panels';
import { Switch } from '@/components/ui/switch';

function InlineError({ children }: { children?: string | undefined }) {
  return children ? (
    <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-danger">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  ) : null;
}

/** "Edit category" panel form (03.09): name, description, products, archive / save. */
export function CategoryForm({
  category,
  closeHref,
  products,
  notice,
}: {
  category: { id: string; name: string; description: string | null } | null;
  closeHref: string;
  /** Server-rendered list of the category's products. */
  products?: ReactNode;
  notice?: string | undefined;
}) {
  const [state, action, saving] = useActionState<CategoryFormState, FormData>(saveCategory, {});
  const [archiving, startArchive] = useTransition();
  const [archiveError, setArchiveError] = useState<string>();
  const isNew = category === null;

  // Submit via a transition so React doesn't clear the fields when saving fails.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-full flex-1 flex-col" noValidate>
      <input type="hidden" name="id" value={category?.id ?? 'new'} />
      <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
        <span className="flex flex-col gap-0.5">
          <SectionLabel className="text-[11px]/[14px]">
            {isNew ? 'New category' : 'Edit category'}
          </SectionLabel>
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.4px]">
            {category?.name || 'Untitled category'}
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
        {notice ? (
          <p role="status" className="rounded-md bg-success-soft px-3 py-2 text-xs text-success">
            {notice}
          </p>
        ) : null}
        <InlineError>{state.message ?? archiveError}</InlineError>
        <Field label="Name" htmlFor="category-name">
          <Input
            id="category-name"
            name="name"
            required
            maxLength={60}
            defaultValue={category?.name ?? ''}
            placeholder="e.g. Dresses"
            className="text-sm"
            aria-invalid={state.fieldErrors?.name ? true : undefined}
          />
          {state.fieldErrors?.name && state.fieldErrors.name !== state.message ? (
            <InlineError>{state.fieldErrors.name}</InlineError>
          ) : null}
        </Field>
        <Field label="Description (optional)" htmlFor="category-description">
          <Textarea
            id="category-description"
            name="description"
            maxLength={300}
            defaultValue={category?.description ?? ''}
            className="min-h-16 text-[13px]/[19px]"
            rows={2}
          />
        </Field>
        <div className="flex flex-col gap-2">
          <span className="text-[13px]/[19px] font-semibold">Cover image</span>
          <div className="flex items-center gap-3">
            <span className="flex size-[72px] items-center justify-center rounded-md bg-surface-muted">
              <ImagePlus className="size-5 text-fg-muted" aria-hidden />
            </span>
            <span className="text-xs text-fg-muted">
              Shown on your homepage category tiles. Image upload is coming soon.
            </span>
          </div>
        </div>
        {products}
      </div>

      <div className="flex items-center justify-between border-t border-line px-6 py-4">
        {category ? (
          <button
            type="button"
            disabled={archiving}
            onClick={() =>
              startArchive(async () => {
                setArchiveError(undefined);
                const result = await setCategoryArchived(category.id, true);
                if (result.message) setArchiveError(result.message);
              })
            }
            className="flex items-center gap-1.5 text-[13px]/[19px] font-semibold text-danger disabled:opacity-60"
          >
            <Archive className="size-4" aria-hidden />{' '}
            {archiving ? 'Archiving…' : 'Archive category'}
          </button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={saving || archiving}>
          <Check /> {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

/** "In store menu" switch on a category row; saves immediately. */
export function MenuSwitch({ id, name, checked }: { id: string; name: string; checked: boolean }) {
  const [on, setOn] = useState(checked);
  const [pending, start] = useTransition();
  return (
    <Switch
      aria-label={`Show ${name} in store menu`}
      checked={on}
      disabled={pending}
      onCheckedChange={(next) => {
        setOn(next);
        start(async () => {
          const result = await setCategoryInMenu(id, next);
          if (result.message) setOn(!next);
        });
      }}
    />
  );
}

/** Up / down buttons for the menu order (instead of drag and drop, which is not built). */
export function MoveButtons({
  id,
  name,
  first,
  last,
}: {
  id: string;
  name: string;
  first: boolean;
  last: boolean;
}) {
  const [pending, start] = useTransition();
  const button = (direction: -1 | 1, disabled: boolean) => (
    <button
      type="button"
      aria-label={`Move ${name} ${direction < 0 ? 'up' : 'down'}`}
      disabled={disabled || pending}
      onClick={() => start(async () => void (await moveCategory(id, direction)))}
      className="inline-flex size-6 items-center justify-center rounded-sm text-fg-subtle hover:bg-selected hover:text-fg disabled:opacity-30"
    >
      {direction < 0 ? (
        <ArrowUp className="size-3.5" aria-hidden />
      ) : (
        <ArrowDown className="size-3.5" aria-hidden />
      )}
    </button>
  );
  return (
    <span className="flex flex-col">
      {button(-1, first)}
      {button(1, last)}
    </span>
  );
}

export function RestoreCategoryButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label={`Restore ${name}`}
      disabled={pending}
      onClick={() => start(async () => void (await setCategoryArchived(id, false)))}
      className="text-[13px]/[19px] font-semibold disabled:opacity-60"
    >
      {pending ? 'Restoring…' : 'Restore'}
    </button>
  );
}
