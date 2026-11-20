import type { ReactNode } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * A compact "Label: value ▾" dropdown. The visible chip is styled; a transparent native
 * <select> sits on top so it stays keyboard- and touch-friendly (native picker on phones).
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  groups,
  allLabel = 'All',
  icon,
  className = '',
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options?: SelectOption[];
  groups?: { label: string; options: SelectOption[] }[];
  allLabel?: string;
  icon?: ReactNode;
  className?: string;
}) {
  const flat = options ?? groups?.flatMap((g) => g.options) ?? [];
  const current = flat.find((o) => o.value === value);
  const active = !!value;
  return (
    <div
      className={`relative inline-flex min-w-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-[13px] transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
        active ? 'border-ink bg-ink text-paper' : 'border-rule bg-paper/70 text-ink hover:border-ink/60'
      } ${className}`}
    >
      {icon}
      <span className={active ? 'text-paper/70' : 'text-ink-soft'}>{label}</span>
      <span className="min-w-0 truncate font-medium">{current ? current.label.replace(/ \(\d+\)$/, '') : allLabel}</span>
      <ChevronDown size={14} aria-hidden className="ml-auto shrink-0 opacity-70" />
      <select
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">{allLabel}</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
        {groups?.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export function Segmented<T extends string | null>({
  value,
  onChange,
  options,
  label,
  className = '',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: ReactNode; title?: string }[];
  label: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-full border border-rule bg-paper/70 p-0.5 font-sans text-[13px] ${className}`}>
      {options.map((o) => (
        <button
          key={String(o.id)}
          role="radio"
          aria-checked={value === o.id}
          title={o.title}
          onClick={() => onChange(o.id)}
          className={`focus-ring inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 font-medium transition-colors ${
            value === o.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, className = '' }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Search characters</span>
      <Search size={15} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search people…"
        className="focus-ring w-full rounded-full border border-rule bg-paper/70 py-1.5 pl-9 pr-8 font-sans text-sm placeholder:text-ink-soft/70 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-soft hover:bg-ink/10 hover:text-ink"
        >
          <X size={13} />
        </button>
      )}
    </label>
  );
}
