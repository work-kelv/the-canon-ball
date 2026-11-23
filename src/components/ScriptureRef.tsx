import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, X } from 'lucide-react';
// The verse data (~430 KB) is fetched on first use rather than bundled into every page.
import scriptureUrl from '../data/scripture.json?url';
import { type FoundRef, displayRef, findRefs } from '../lib/scriptureRefs';

type Translation = 'web' | 'bsb';
type Verse = [number, number, string];
interface RefData {
  display: string;
  total: number;
  web: Verse[];
  bsb: Verse[];
  links: Record<Translation, string>;
}
interface Scripture {
  meta: { translations: Record<Translation, string> };
  refs: Record<string, RefData>;
}

let dataPromise: Promise<Scripture> | null = null;
const loadScripture = () => (dataPromise ??= fetch(scriptureUrl).then((r) => r.json() as Promise<Scripture>));

const TRANSLATIONS: { id: Translation; short: string; name: string }[] = [
  { id: 'web', short: 'WEB', name: 'World English Bible' },
  { id: 'bsb', short: 'BSB', name: 'Berean Standard Bible' },
];

function useTranslation(): [Translation, (t: Translation) => void] {
  const [t, setT] = useState<Translation>(() => {
    try {
      return localStorage.getItem('bible-translation') === 'bsb' ? 'bsb' : 'web';
    } catch {
      return 'web';
    }
  });
  const set = (next: Translation) => {
    setT(next);
    try {
      localStorage.setItem('bible-translation', next);
    } catch {
      /* storage unavailable */
    }
  };
  return [t, set];
}

function Popover({ found, anchor, onClose }: { found: FoundRef; anchor: HTMLElement; onClose: () => void }) {
  const [data, setData] = useState<RefData | null | undefined>(undefined);
  const [tr, setTr] = useTranslation();
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const phone = window.matchMedia('(max-width: 639px)').matches;

  useEffect(() => {
    let live = true;
    loadScripture()
      .then((s) => live && setData(s.refs[found.key] ?? null))
      .catch(() => live && setData(null));
    return () => {
      live = false;
    };
  }, [found.key]);

  // Position next to the reference (desktop); bottom sheet on phones.
  useLayoutEffect(() => {
    if (phone || !boxRef.current) return;
    const a = anchor.getBoundingClientRect();
    const b = boxRef.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, a.left + a.width / 2 - b.width / 2), window.innerWidth - b.width - 8);
    const below = a.bottom + 8;
    const top = below + b.height > window.innerHeight - 8 ? Math.max(8, a.top - b.height - 8) : below;
    setPos({ left, top });
  }, [anchor, data, tr, phone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (boxRef.current?.contains(t) || anchor.contains(t)) return;
      onClose();
    };
    const onScroll = () => !phone && onClose();
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [anchor, onClose, phone]);

  // Phone bottom sheet: freeze whatever is behind it (the page, or a scrolling side panel),
  // so reaching the end of the passage doesn't start scrolling the background.
  useEffect(() => {
    if (!phone) return;
    const frozen: [HTMLElement, string][] = [];
    for (let el: HTMLElement | null = anchor; el; el = el.parentElement) {
      const oy = getComputedStyle(el).overflowY;
      if (el === document.documentElement || el === document.body || oy === 'auto' || oy === 'scroll') {
        frozen.push([el, el.style.overflow]);
        el.style.overflow = 'hidden';
      }
    }
    return () => frozen.forEach(([el, v]) => (el.style.overflow = v));
  }, [anchor, phone]);

  const verses = data ? data[tr] : [];
  const more = data ? data.total - verses.length : 0;
  const name = TRANSLATIONS.find((x) => x.id === tr)!.name;

  return createPortal(
    <>
      {phone && <div className="animate-fade fixed inset-0 z-[70] touch-none bg-ink/30" aria-hidden />}
      <div
        ref={boxRef}
        role="dialog"
        aria-label={`${data?.display ?? displayRef(found.segments)} — ${name}`}
        className={`fixed z-[71] flex flex-col overflow-hidden border border-rule bg-paper font-sans text-ink shadow-2xl ${
          phone ? 'inset-x-0 bottom-0 max-h-[70vh] rounded-t-xl' : 'w-[22rem] max-w-[calc(100vw-16px)] rounded-md'
        }`}
        style={phone ? undefined : { left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
      >
        <div className="flex items-center gap-2 border-b border-rule px-3.5 py-2.5">
          <div className="min-w-0 flex-1 font-display text-[17px] font-semibold leading-tight">{data?.display ?? displayRef(found.segments)}</div>
          <div role="radiogroup" aria-label="Translation" className="inline-flex shrink-0 rounded-full border border-rule p-0.5 text-[11px]">
            {TRANSLATIONS.map((x) => (
              <button
                key={x.id}
                role="radio"
                aria-checked={tr === x.id}
                title={x.name}
                onClick={() => setTr(x.id)}
                className={`focus-ring rounded-full px-2 py-0.5 font-semibold ${tr === x.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
              >
                {x.short}
              </button>
            ))}
          </div>
          <button onClick={onClose} aria-label="Close" className="focus-ring -mr-1 rounded-full p-1 hover:bg-ink/10">
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-3.5 py-3">
          {data === undefined && <p className="text-sm text-ink-soft">Loading…</p>}
          {data === null && <p className="text-sm text-ink-soft">This passage isn&rsquo;t in the offline text.</p>}
          {data && (
            <p className="font-serif text-[15.5px] leading-relaxed">
              {verses.map(([c, v, t], i) => (
                <Fragment key={`${c}:${v}`}>
                  {(i === 0 || verses[i - 1][0] !== c) && verses.some((x) => x[0] !== verses[0][0]) && (
                    <span className="mr-1 font-sans text-[11px] font-bold text-ink-soft">{c}</span>
                  )}
                  <sup className="mr-0.5 font-sans text-[10px] font-semibold text-ink-soft">{v}</sup>
                  {t}{' '}
                </Fragment>
              ))}
              {more > 0 && <span className="text-ink-soft">… </span>}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule px-3.5 py-2 text-[11px] text-ink-soft">
          <span>{name} · public domain</span>
          {data && (
            <a href={data.links[tr]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-ink underline decoration-rule underline-offset-2 hover:decoration-ink">
              {more > 0 ? `Read all ${data.total} verses` : 'Read in context'}
              <ExternalLink size={10} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

/** A clickable Scripture reference that shows the verse text (WEB or BSB). */
export function ScriptureRef({ found, children }: { found: FoundRef; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onMouseEnter={() => void loadScripture()}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`Read ${displayRef(found.segments)}`}
        className="focus-ring inline cursor-pointer rounded-sm text-inherit underline decoration-current/40 decoration-dotted underline-offset-[3px] hover:decoration-solid"
      >
        {children ?? found.text}
      </button>
      {open && ref.current && <Popover found={found} anchor={ref.current} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Renders text, turning every Scripture reference in it into a ScriptureRef. */
export function RefText({ text }: { text: string }) {
  const found = findRefs(text);
  if (!found.length) return <>{text}</>;
  const parts: ReactNode[] = [];
  let at = 0;
  found.forEach((f, i) => {
    if (f.start > at) parts.push(text.slice(at, f.start));
    parts.push(<ScriptureRef key={i} found={f} />);
    at = f.end;
  });
  if (at < text.length) parts.push(text.slice(at));
  return <>{parts}</>;
}
