import type { Language } from '../types';
import { formatPct, langColor } from '../lib/books';

interface Segment {
  language: Language;
  value: number;
}

interface Props {
  segments: Segment[];
  /** Total the segments are measured against; defaults to their sum. */
  total?: number;
  className?: string;
  label?: string;
}

/** Horizontal stacked bar; tiny-but-nonzero segments get a 3px sliver so they stay visible. */
export function LanguageBar({ segments, total, className = 'h-3', label }: Props) {
  const sum = total ?? segments.reduce((n, s) => n + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);
  const aria =
    label ??
    visible.map((s) => `${s.language} ${formatPct((s.value / (sum || 1)) * 100)}`).join(', ');

  return (
    <div
      role="img"
      aria-label={aria}
      className={`flex w-full overflow-hidden rounded-[2px] bg-ink/5 ${className}`}
    >
      {visible.map((s) => {
        const pct = sum ? (s.value / sum) * 100 : 0;
        return (
          <div
            key={s.language}
            title={`${s.language}: ${formatPct(pct)}`}
            style={{
              width: `${pct}%`,
              minWidth: pct > 0 ? 3 : 0,
              background: langColor(s.language),
            }}
            className="h-full border-r border-paper/60 last:border-r-0"
          />
        );
      })}
    </div>
  );
}
