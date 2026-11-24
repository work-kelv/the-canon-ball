import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * The one pattern for every detail view on the site: a bottom sheet on phones and a side sheet from
 * 768px, with the same controls everywhere — "← Back to …" at the top and bottom, ‹ › to step through
 * the list, Esc to close, ←/→ to step. A modal sheet dims the page, keeps focus inside and stops the
 * page behind from scrolling; a non-modal one (the character inspector, the map on phones) leaves the
 * page usable around it.
 */

/** Subscribe to a media query (e.g. '(min-width: 1024px)'). */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const typing = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
};

/** Esc and ←/→ for a detail view; ignored while typing in a field. */
export function useDetailKeys(onClose: (() => void) | null, onPrev?: (() => void) | null, onNext?: (() => void) | null) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.defaultPrevented || typing(e.target)) return;
      if (e.key === 'Escape' && onClose) {
        // Leave Esc to an open Bible-verse pop-up first.
        if (document.querySelector('[data-popover-open]')) return;
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose, onPrev, onNext]);
}

const navBtn = 'focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rule hover:border-ink/50 disabled:opacity-30';

/** The shared top row: Back, a short title, "3 of 12", ‹ ›. Used by sheets and by inline explorers. */
export function DetailHeader({
  backLabel,
  onBack,
  title,
  position,
  onPrev,
  onNext,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  backRef,
  className = '',
}: {
  backLabel?: string;
  onBack?: () => void;
  title?: ReactNode;
  position?: string;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  prevLabel?: string;
  nextLabel?: string;
  backRef?: RefObject<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onBack && (
        <button
          ref={backRef}
          onClick={onBack}
          title="Esc"
          className="focus-ring inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 font-sans text-[13.5px] font-medium text-paper active:opacity-80"
        >
          <ArrowLeft size={16} aria-hidden />
          {backLabel ?? 'Back'}
        </button>
      )}
      <span className="min-w-0 flex-1 font-sans text-[12.5px] leading-tight text-ink-soft"><span className="hidden sm:inline">{title}</span></span>
      {position && <span className="shrink-0 font-sans text-[12.5px] tabular-nums text-ink-soft">{position}</span>}
      {(onPrev !== undefined || onNext !== undefined) && (
        <span className="flex shrink-0 gap-1">
          <button onClick={onPrev ?? undefined} disabled={!onPrev} aria-label={prevLabel} title={`${prevLabel} (←)`} className={navBtn}>
            <ChevronLeft size={17} aria-hidden />
          </button>
          <button onClick={onNext ?? undefined} disabled={!onNext} aria-label={nextLabel} title={`${nextLabel} (→)`} className={navBtn}>
            <ChevronRight size={17} aria-hidden />
          </button>
        </span>
      )}
    </div>
  );
}

const WIDTH = { md: 'md:max-w-[28rem]', lg: 'md:max-w-[32rem]', xl: 'md:max-w-[40rem]' } as const;

export function DetailSheet({
  label,
  labelledBy,
  backLabel,
  onClose,
  title,
  position,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  modal = true,
  width = 'md',
  phoneHeight = 88,
  footer = true,
  children,
}: {
  /** Accessible name, or labelledBy pointing at the sheet's own heading. */
  label?: string;
  labelledBy?: string;
  backLabel: string;
  onClose: () => void;
  title?: ReactNode;
  position?: string;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  prevLabel?: string;
  nextLabel?: string;
  modal?: boolean;
  width?: keyof typeof WIDTH;
  /** Height cap on phones, in % of the screen. */
  phoneHeight?: number;
  footer?: boolean;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [returnTo] = useState(() => document.activeElement as HTMLElement | null);

  useDetailKeys(onClose, onPrev, onNext);

  // Focus Back when opened; give focus back to whatever opened the sheet when it closes.
  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
    return () => {
      if (returnTo && document.contains(returnTo)) returnTo.focus({ preventScroll: true });
    };
  }, [returnTo]);

  // A new item starts at its top.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [title, position, children]);

  // Modal: the page behind stays put, and Tab stays inside the sheet.
  useEffect(() => {
    if (!modal) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const f = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select, input, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', trap);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener('keydown', trap);
    };
  }, [modal]);

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal={modal}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      style={{ ['--sheet-h' as string]: `${phoneHeight}vh` }}
      className={`animate-sheet pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex max-h-[var(--sheet-h)] flex-col overflow-hidden rounded-t-2xl border-t border-rule bg-paper shadow-[0_-12px_40px_rgb(0_0_0/0.18)] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-full md:rounded-none md:border-l md:border-t-0 md:shadow-2xl ${WIDTH[width]}`}
    >
      <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-ink/20 md:hidden" />
      <DetailHeader
        backRef={backRef}
        backLabel={backLabel}
        onBack={onClose}
        title={title}
        position={position}
        onPrev={onPrev}
        onNext={onNext}
        prevLabel={prevLabel}
        nextLabel={nextLabel}
        className="shrink-0 border-b border-rule bg-paper px-3 py-2"
      />
      <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
        {footer && (
          <DetailHeader
            backLabel={backLabel}
            onBack={onClose}
            onPrev={onPrev}
            onNext={onNext}
            prevLabel={prevLabel}
            nextLabel={nextLabel}
            className="border-t border-rule px-3 py-3"
          />
        )}
      </div>
    </div>
  );

  return createPortal(
    modal ? (
      <div className="fixed inset-0 z-50">
        <div className="animate-fade absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
        {panel}
      </div>
    ) : (
      panel
    ),
    document.body,
  );
}
