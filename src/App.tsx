import { useState, type ReactNode } from 'react';
import { Church, ExternalLink, Languages, Map as MapIcon, Moon, ScrollText, Sun, Users } from 'lucide-react';
import { langColor } from './lib/books';
import { REFERENCES } from './lib/references';

export type Section = 'languages' | 'characters' | 'map' | 'history';

const NAV: { id: Section; label: string; short: string; href: string; icon: typeof Languages }[] = [
  { id: 'languages', label: 'Languages', short: 'Languages', href: './', icon: Languages },
  { id: 'characters', label: 'Characters', short: 'Characters', href: 'characters.html', icon: Users },
  { id: 'map', label: 'Map', short: 'Map', href: 'map.html', icon: MapIcon },
  { id: 'history', label: 'Church History', short: 'History', href: 'history.html', icon: Church },
];

const INTRO: Record<Section, { eyebrow: string; text: ReactNode }> = {
  languages: {
    eyebrow: 'Sixty-six books · Three tongues',
    text: (
      <>
        The Protestant Bible by the languages it was first written in —{' '}
        <span style={{ color: langColor('Hebrew') }}>Biblical Hebrew</span>,{' '}
        <span style={{ color: langColor('Aramaic') }}>Biblical Aramaic</span> and{' '}
        <span style={{ color: langColor('Greek') }}>Koine Greek</span>.
      </>
    ),
  },
  characters: {
    eyebrow: 'Lives · Lineage · Eras',
    text: 'The people of Scripture — who they were, whom they loved, mentored and opposed, when they lived, and where in the canon they appear.',
  },
  map: {
    eyebrow: 'Places · Routes · Settings',
    text: 'Where each book was written and where it is set — with the great journeys of Scripture across the Mediterranean and the Ancient Near East.',
  },
  history: {
    eyebrow: 'Councils · Creeds · Translations',
    text: 'How the church branched, what the historic creeds confess and why, where other movements differ, and how the Bible reached the world’s languages — chapter and verse.',
  },
};

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    // Apply the class synchronously so canvas/SVG colours read the new CSS variables on re-render.
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
    setDark(next);
  };
  return [dark, toggle] as const;
}

function References({ section }: { section: Section }) {
  return (
    <section aria-labelledby="refs" className="mt-12 border-t border-rule pt-6">
      <h2 id="refs" className="font-display text-xl font-semibold">
        References
      </h2>
      <ol className="mt-3 grid gap-x-8 gap-y-4 font-sans text-[13px] leading-snug md:grid-cols-2">
        {REFERENCES[section].map((r, i) => (
          <li key={r.title} className="flex gap-3">
            <span className="w-5 shrink-0 text-right tabular-nums text-ink-soft">{i + 1}.</span>
            <div className="min-w-0">
              <div className="font-semibold">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-2 hover:decoration-ink">
                    {r.title}
                  </a>
                ) : (
                  <i>{r.title}</i>
                )}
              </div>
              <div className="text-ink-soft">{r.detail}</div>
              <div className="mt-0.5 text-ink-soft">
                <span className="text-ink">Used for:</span> {r.use}
              </div>
              {r.links && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {r.links.map((l) => (
                    <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[12px] underline decoration-rule underline-offset-2 hover:decoration-ink">
                      {l.label}
                      <ExternalLink size={10} aria-hidden />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Shared page frame for the four pages (index, characters, map, history). */
export function Shell({ section, children }: { section: Section; children: (dark: boolean) => ReactNode }) {
  const [dark, toggleTheme] = useTheme();
  const intro = INTRO[section];
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
      <header className="border-b-[3px] border-double border-ink pb-4 pt-8 sm:pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-1.5">
              <ScrollText size={13} aria-hidden />
              {intro.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
              <a href="./" className="focus-ring rounded-sm">
                The Canon Ball
              </a>
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-snug text-ink-soft">{intro.text}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="focus-ring shrink-0 rounded-full border border-rule p-2.5 hover:bg-ink/5"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <nav
          aria-label="Sections"
          className="no-scrollbar mt-5 inline-flex max-w-full overflow-x-auto rounded-full border border-ink/70 p-0.5 font-sans text-[13px] sm:text-sm"
        >
          {NAV.map(({ id, label, short, href, icon: Icon }) => (
            <a
              key={id}
              href={href}
              aria-current={section === id ? 'page' : undefined}
              className={`focus-ring inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors sm:px-4 ${
                section === id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon size={15} aria-hidden className="hidden sm:block" />
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </a>
          ))}
        </nav>
      </header>

      {children(dark)}

      <References section={section} />
    </div>
  );
}
