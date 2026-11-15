import {
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  type LucideIcon,
  Megaphone,
  Plus,
  Quote,
  Sparkles,
} from 'lucide-react';
import type * as React from 'react';
import { PlanLockTag } from '@/components/ui/badge';
import { SectionLabel } from '@/components/ui/panels';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  BRAND_COLOURS,
  HOMEPAGE_SECTIONS,
  type HomepageSectionKey,
  STORE,
  type ThemeKey,
  THEMES,
} from '@/mock/dashboard-store';

/** lucide-react 1.x dropped brand icons; a plain outline "Instagram" glyph in the same style. */
function InstagramGlyph(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

const SECTION_ICONS: Record<HomepageSectionKey, LucideIcon | typeof InstagramGlyph> = {
  announcement: Megaphone,
  hero: ImageIcon,
  categories: LayoutGrid,
  new: Sparkles,
  story: Quote,
  instagram: InstagramGlyph,
};

function PanelBlock({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('flex flex-col gap-3 border-t border-line px-[22px] py-4', className)}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </section>
  );
}

/**
 * Storefront editor settings panel (03.10): 380 wide, surface, 1px right border. Theme radio
 * tiles, brand colours, homepage section toggles and the store-open switch.
 */
export function StorefrontEditorPanel({
  theme = 'market',
  selectedSection = 'hero',
}: {
  theme?: ThemeKey;
  selectedSection?: HomepageSectionKey;
}) {
  return (
    <aside
      aria-label="Storefront settings"
      className="flex w-full shrink-0 flex-col border-b border-line bg-surface lg:w-[380px] lg:border-r lg:border-b-0"
    >
      <div className="flex flex-col gap-1 px-[22px] pt-[22px] pb-4">
        <h1 className="font-display text-[22px] font-semibold tracking-display">Storefront</h1>
        <p className="text-ui text-fg-muted">Changes go live when you press Publish.</p>
      </div>

      <PanelBlock label="Theme">
        <fieldset className="grid grid-cols-3 gap-2.5">
          <legend className="sr-only">Theme</legend>
          {THEMES.map((t) => (
            <label
              key={t.key}
              className={cn(
                'flex cursor-pointer flex-col gap-1.5 rounded-[10px] border p-1.5 has-checked:border-[1.5px] has-checked:border-forest has-checked:p-[5.5px] has-focus-visible:shadow-focus',
                t.soon ? 'cursor-not-allowed border-line opacity-80' : 'border-line',
              )}
            >
              <input
                type="radio"
                name="theme"
                value={t.key}
                defaultChecked={t.key === theme}
                disabled={t.soon}
                className="sr-only"
              />
              <span
                aria-hidden
                className="flex h-[52px] flex-col gap-1 rounded-sm border border-line/60 p-1.5"
                style={{ backgroundColor: t.page }}
              >
                <span className="h-1.5 w-10 rounded-[3px]" style={{ backgroundColor: t.a }} />
                <span className="h-1.5 w-6 rounded-[3px]" style={{ backgroundColor: t.b }} />
              </span>
              <span className="flex items-center justify-between gap-1 px-0.5">
                <span className={cn('text-xs font-semibold', t.soon && 'text-fg-muted')}>
                  {t.name}
                </span>
                {t.soon ? (
                  <span className="text-micro font-semibold text-fg-subtle">Soon</span>
                ) : null}
              </span>
            </label>
          ))}
        </fieldset>
      </PanelBlock>

      <PanelBlock label="Brand">
        <div className="flex items-center gap-3">
          <span
            aria-label={`${STORE.name} logo`}
            role="img"
            className="flex size-10 items-center justify-center rounded-md bg-store-accent font-display text-xl font-bold text-store-accent-ink"
          >
            {STORE.name.charAt(0)}
          </span>
          <fieldset className="flex flex-1 items-center gap-2">
            <legend className="sr-only">Brand colour</legend>
            {BRAND_COLOURS.map((c, i) => (
              <label key={c} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="brandColour"
                  value={c}
                  defaultChecked={i === 0}
                  aria-label={`Colour ${c}`}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="block size-6 rounded-full ring-offset-2 ring-offset-surface peer-focus-visible:ring-2 peer-focus-visible:ring-forest"
                  style={{ backgroundColor: c }}
                />
              </label>
            ))}
          </fieldset>
          <button type="button" className="text-xs font-semibold hover:text-fg-muted">
            Edit
          </button>
        </div>
      </PanelBlock>

      <PanelBlock label="Homepage sections">
        <ul className="flex flex-col gap-1.5">
          {HOMEPAGE_SECTIONS.map((s) => {
            const Icon = SECTION_ICONS[s.key];
            const selected = s.key === selectedSection;
            return (
              <li
                key={s.key}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2',
                  selected
                    ? 'bg-selected shadow-[inset_0_0_0_1.5px_var(--ojara-forest)]'
                    : 'bg-paper',
                )}
              >
                <GripVertical
                  className="size-3.5 shrink-0 cursor-grab text-fg-subtle"
                  aria-label={`Reorder ${s.label}`}
                />
                <Icon
                  className={cn(
                    'size-[15px] shrink-0',
                    s.lockedPlan ? 'text-fg-subtle' : 'text-fg-muted',
                  )}
                  aria-hidden
                />
                <span
                  id={`section-${s.key}`}
                  className={cn(
                    'min-w-0 flex-1 text-ui font-medium',
                    s.lockedPlan ? 'text-fg-subtle' : 'text-fg',
                  )}
                >
                  {s.label}
                </span>
                {s.lockedPlan ? (
                  <PlanLockTag plan={s.lockedPlan} />
                ) : (
                  <Switch
                    size="sm"
                    defaultChecked={s.enabled}
                    aria-labelledby={`section-${s.key}`}
                  />
                )}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="inline-flex w-fit items-center gap-1.5 text-ui font-semibold hover:text-fg-muted"
        >
          <Plus className="size-3.5" aria-hidden /> Add section
        </button>
      </PanelBlock>

      <PanelBlock label="Store status" className="lg:border-b-0">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span id="store-open" className="text-ui font-semibold">
              Store is open
            </span>
            <span className="text-xs text-fg-muted">
              Switch off to close temporarily — customers see a “back soon” page.
            </span>
          </div>
          <Switch tone="success" defaultChecked aria-labelledby="store-open" />
        </div>
      </PanelBlock>
    </aside>
  );
}
