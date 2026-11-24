import type { LucideIcon } from 'lucide-react';

export interface ViewTab<T extends string> {
  id: T;
  label: string;
  /** Shorter label for phones. */
  short?: string;
  icon: LucideIcon;
}

/**
 * Switches between the Characters views (timeline, network, directory): rounded tabs, the current one
 * filled in ink. (The Bible and Church History are single scrolling pages with numbered sections.)
 */
export function ViewTabs<T extends string>({
  label,
  value,
  onChange,
  tabs,
  className = '',
}: {
  label: string;
  value: T;
  onChange: (id: T) => void;
  tabs: ViewTab<T>[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={`flex flex-wrap gap-1 font-sans ${className}`}>
      {tabs.map(({ id, label: l, short, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-current={value === id ? 'page' : undefined}
          className={`focus-ring inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
            value === id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
          }`}
        >
          <Icon size={14} aria-hidden className="shrink-0" />
          {short ? (
            <>
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{l}</span>
            </>
          ) : (
            l
          )}
        </button>
      ))}
    </nav>
  );
}
