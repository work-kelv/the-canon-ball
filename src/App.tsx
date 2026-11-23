import { useState, type ReactNode } from 'react';
import { ChevronDown, Church, ExternalLink, House, Languages, Map as MapIcon, Moon, ScrollText, Sun, Users } from 'lucide-react';
import { langColor } from './lib/books';
import { REFERENCES } from './lib/references';

export type Section = 'home' | 'languages' | 'characters' | 'map' | 'history';

const NAV: { id: Section; label: string; short: string; href: string; icon: typeof Languages; iconOnly?: boolean }[] = [
  { id: 'home', label: 'Home', short: 'Home', href: './', icon: House, iconOnly: true },
  { id: 'languages', label: 'Languages', short: 'Languages', href: 'languages.html', icon: Languages },
  { id: 'characters', label: 'Characters', short: 'Characters', href: 'characters.html', icon: Users },
  { id: 'map', label: 'Map', short: 'Map', href: 'map.html', icon: MapIcon },
  { id: 'history', label: 'Church History', short: 'History', href: 'history.html', icon: Church },
];

const INTRO: Record<Section, { eyebrow: string; title?: string; text: ReactNode }> = {
  home: {
    eyebrow: 'An interactive guide to the Bible',
    text: 'Explore the Bible’s languages, people and places, and how its message was confessed, divided and translated across two thousand years of church history.',
  },
  languages: {
    eyebrow: 'Sixty-six books · Three tongues',
    title: 'Languages',
    text: (
      <>
        The 66 books by the language they were first written in:{' '}
        <span style={{ color: langColor('Hebrew') }}>Hebrew</span>, <span style={{ color: langColor('Aramaic') }}>Aramaic</span> and{' '}
        <span style={{ color: langColor('Greek') }}>Greek</span>.
      </>
    ),
  },
  characters: {
    eyebrow: 'Lives · Lineage · Eras',
    title: 'Characters',
    text: '266 people of the Bible: when they lived, and how they were connected.',
  },
  map: {
    eyebrow: 'Places · Routes · Settings',
    title: 'Map',
    text: 'Where each book was written and set, and the journeys its people made.',
  },
  history: {
    eyebrow: 'Councils · Creeds · Translations',
    title: 'Church History',
    text: 'How the church branched, what it confesses, and how the Bible reached every language.',
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

const REFS_PREVIEW = 4;

function References({ section }: { section: Section }) {
  const all = REFERENCES[section];
  const [open, setOpen] = useState(all.length <= REFS_PREVIEW + 1);
  const shown = open ? all : all.slice(0, REFS_PREVIEW);
  return (
    <section aria-labelledby="refs" className="mt-12 border-t border-rule pt-6">
      <h2 id="refs" className="font-display text-xl font-semibold">
        References <span className="font-sans text-sm font-normal text-ink-soft">({all.length})</span>
      </h2>
      <ol className="mt-3 grid gap-x-8 gap-y-4 font-sans text-[13px] leading-snug md:grid-cols-2">
        {shown.map((r, i) => (
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
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-full border border-rule px-3.5 py-1.5 font-sans text-[13px] font-medium hover:border-ink/50"
        >
          Show all {all.length} references <ChevronDown size={14} aria-hidden />
        </button>
      )}
    </section>
  );
}

/** Shared page frame: a hero header on the home page, a slim bar and page title on the section pages. */
export function Shell({ section, children }: { section: Section; children: (dark: boolean) => ReactNode }) {
  const [dark, toggleTheme] = useTheme();
  const intro = INTRO[section];
  const themeButton = (
    <button
      onClick={toggleTheme}
      className="focus-ring shrink-0 rounded-full border border-rule p-2.5 hover:bg-ink/5"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
  const nav = (
    <nav
      aria-label="Sections"
      className="no-scrollbar inline-flex max-w-full overflow-x-auto rounded-full border border-ink/70 p-0.5 font-sans text-[13px] sm:text-sm"
    >
      {NAV.map(({ id, label, short, href, icon: Icon, iconOnly }) => (
        <a
          key={id}
          href={href}
          aria-current={section === id ? 'page' : undefined}
          aria-label={iconOnly ? label : undefined}
          title={iconOnly ? label : undefined}
          className={`focus-ring inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full py-1.5 font-medium transition-colors ${
            iconOnly ? 'px-2.5' : 'px-3 sm:px-4'
          } ${section === id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
        >
          {iconOnly ? (
            <Icon size={16} aria-hidden />
          ) : (
            <>
              <Icon size={15} aria-hidden className="hidden sm:block" />
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </>
          )}
        </a>
      ))}
    </nav>
  );
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
      {section === 'home' ? (
        <header className="border-b-[3px] border-double border-ink pb-4 pt-8 sm:pt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow flex items-center gap-1.5">
                <ScrollText size={13} aria-hidden />
                {intro.eyebrow}
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl">The Canon Ball</h1>
              <p className="mt-3 max-w-2xl text-lg leading-snug text-ink-soft">{intro.text}</p>
            </div>
            {themeButton}
          </div>
          <div className="mt-5">{nav}</div>
        </header>
      ) : (
        <header>
          {/* Slim site bar: name (home), sections, theme */}
          <div className="flex items-center justify-between gap-3 border-b border-rule pb-3 pt-4">
            <a href="./" className="focus-ring rounded-sm font-display text-xl font-bold tracking-tight sm:text-2xl">
              The Canon Ball
            </a>
            <div className="flex items-center gap-2">
              <div className="hidden lg:block">{nav}</div>
              {themeButton}
            </div>
          </div>
          <div className="mt-3 lg:hidden">{nav}</div>
          {/* The page's own title */}
          <div className="border-b-[3px] border-double border-ink pb-4 pt-5 sm:pt-7">
            <p className="eyebrow flex items-center gap-1.5">
              <ScrollText size={13} aria-hidden />
              {intro.eyebrow}
            </p>
            <h1 className="mt-1.5 font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl">{intro.title}</h1>
            <p className="mt-2 max-w-2xl text-[17px] leading-snug text-ink-soft">{intro.text}</p>
          </div>
        </header>
      )}

      {children(dark)}

      <References section={section} />
    </div>
  );
}
