'use client';

import { STORE_SLUG_PATTERN } from '@ojara/shared';
import { Check, CircleAlert, CircleCheck, LoaderCircle, Pipette } from 'lucide-react';
import { type CSSProperties, useEffect, useId, useState } from 'react';
import { checkSlugAvailability } from '@/lib/api/browser';
import { cn } from '@/lib/utils';
import { useOnboardingForm } from './onboarding-form';

type SlugStatus =
  | { kind: 'checking' }
  | { kind: 'available' }
  | { kind: 'unavailable'; message: string }
  | { kind: 'error' };

const FORMAT_HINT = 'Use 3–40 lowercase letters, numbers or single hyphens.';

/**
 * Store web address with a live availability check (debounced 400 ms). The server re-checks on
 * save; a 409 from the API shows through the form's `slug` field error.
 */
export function SlugField({
  storeId,
  initialSlug,
  rootDomain,
}: {
  storeId: string;
  initialSlug: string;
  rootDomain: string;
}) {
  const [slug, setSlug] = useState(initialSlug);
  // Result of the last network check, tagged with the address it was for.
  const [remote, setRemote] = useState<{ slug: string; status: SlugStatus } | null>(null);
  const { state } = useOnboardingForm();
  const serverError = state.fieldErrors?.slug;
  const statusId = useId();

  const value = slug.trim().toLowerCase();
  const needsCheck = value !== initialSlug && STORE_SLUG_PATTERN.test(value);
  // Format and "unchanged" are decided locally; only a changed, well-formed address goes to the API.
  const status: SlugStatus =
    value === initialSlug
      ? { kind: 'available' }
      : !needsCheck
        ? { kind: 'unavailable', message: FORMAT_HINT }
        : remote?.slug === value
          ? remote.status
          : { kind: 'checking' };

  useEffect(() => {
    if (!needsCheck) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      checkSlugAvailability(value, storeId, controller.signal)
        .then((r) =>
          setRemote({
            slug: value,
            status: r.available
              ? { kind: 'available' }
              : { kind: 'unavailable', message: r.message ?? 'That address can’t be used.' },
          }),
        )
        .catch(() => {
          if (!controller.signal.aborted) setRemote({ slug: value, status: { kind: 'error' } });
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, needsCheck, storeId]);

  const invalid = Boolean(serverError) || status.kind === 'unavailable';
  const host = `${slug.trim().toLowerCase() || 'your-store'}.${rootDomain}`;

  return (
    <>
      <div
        className={cn(
          'flex h-[46px] items-stretch overflow-hidden rounded-md border-[1.5px] bg-surface has-focus-visible:shadow-focus',
          invalid
            ? 'border-danger'
            : status.kind === 'available'
              ? 'border-success'
              : 'border-line',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3.5">
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            required
            maxLength={40}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={invalid || undefined}
            aria-describedby={statusId}
            className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none"
          />
          {status.kind === 'checking' ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin text-fg-subtle" aria-hidden />
          ) : status.kind === 'available' && !serverError ? (
            <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
          ) : invalid ? (
            <CircleAlert className="size-4 shrink-0 text-danger" aria-hidden />
          ) : null}
        </div>
        <span className="flex items-center border-l border-line bg-paper px-3.5 text-sm text-fg-muted">
          .{rootDomain}
        </span>
      </div>
      <p id={statusId} className="flex flex-wrap gap-x-1.5 text-xs" aria-live="polite">
        {serverError ? (
          <span className="font-medium text-danger">{serverError}</span>
        ) : status.kind === 'checking' ? (
          <span className="text-fg-muted">Checking {host}…</span>
        ) : status.kind === 'available' ? (
          <span className="font-medium text-success">{host} is available.</span>
        ) : status.kind === 'unavailable' ? (
          <span className="font-medium text-danger">{status.message}</span>
        ) : status.kind === 'error' ? (
          <span className="text-fg-muted">
            Couldn’t check right now — we’ll check when you save.
          </span>
        ) : null}
        <span className="text-fg-muted">Use your own domain on Starter.</span>
      </p>
    </>
  );
}

/**
 * Brand colour: preset swatches plus a custom colour (native picker). Posts `brandColour`.
 * A saved colour that isn't a preset shows as the custom swatch.
 */
export function BrandColourPicker({
  swatches,
  initial,
}: {
  swatches: readonly { name: string; hex: string }[];
  initial: string | null;
}) {
  const presetHexes = swatches.map((s) => s.hex.toUpperCase());
  const start = initial?.toUpperCase() ?? swatches[0]?.hex.toUpperCase() ?? '';
  const [value, setValue] = useState(start);
  const [custom, setCustom] = useState(presetHexes.includes(start) ? null : start);

  const swatch = (hex: string, label: string, isCustom = false) => (
    <label
      key={`${label}-${hex}`}
      title={label}
      style={{ '--sw': hex } as CSSProperties}
      className="flex size-10 cursor-pointer rounded-full border-2 border-transparent p-[3px] has-checked:border-(--sw) has-focus-visible:shadow-focus"
    >
      <input
        type="radio"
        name="brandColourChoice"
        checked={value === hex}
        onChange={() => setValue(hex)}
        aria-label={isCustom ? `Custom colour ${hex}` : label}
        className="peer sr-only"
      />
      <span className="flex flex-1 items-center justify-center rounded-full bg-(--sw) [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
        <Check className="size-4 text-white" strokeWidth={2.5} aria-hidden />
      </span>
    </label>
  );

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <input type="hidden" name="brandColour" value={value} />
      {swatches.map((s) => swatch(s.hex.toUpperCase(), s.name))}
      {custom ? swatch(custom, 'Custom', true) : null}
      <label className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-[9px] text-ui font-medium text-fg hover:bg-selected has-focus-visible:shadow-focus">
        <Pipette className="size-3.5 text-fg-muted" aria-hidden /> Custom
        <input
          type="color"
          value={custom ?? '#2A3A7C'}
          onChange={(e) => {
            const hex = e.target.value.toUpperCase();
            setCustom(presetHexes.includes(hex) ? null : hex);
            setValue(hex);
          }}
          aria-label="Choose a custom brand colour"
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
