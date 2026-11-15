import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * List search field (03.03 / 03.04 / 03.07): surface, 1px border, radius 8, padding 8/12, 16px
 * search icon. A GET form so the query lands in ?q= without client JS.
 */
export function SearchField({
  placeholder,
  defaultValue,
  name = 'q',
  className,
  hidden,
}: {
  placeholder: string;
  defaultValue?: string;
  name?: string;
  className?: string;
  /** Extra params to keep (e.g. the active status tab). */
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form role="search" className={cn('min-w-0', className)}>
      {Object.entries(hidden ?? {}).map(([k, v]) =>
        v ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <label className="flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 focus-within:border-forest focus-within:shadow-focus">
        <Search className="size-4 shrink-0 text-fg-subtle" aria-hidden />
        <input
          type="search"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[13px]/[19px] outline-none placeholder:text-fg-subtle"
        />
      </label>
    </form>
  );
}

/** Filter dropdown button (§7): secondary style, padding 8/10/8/12, 13/500, chevron-down 14. */
export function FilterButton({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface pr-2.5 pl-3 text-[13px]/[19px] font-medium whitespace-nowrap text-fg hover:bg-selected',
        className,
      )}
    >
      {label}
      <ChevronDown className="size-3.5 text-fg-muted" aria-hidden />
    </button>
  );
}
