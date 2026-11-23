import { LANGUAGES, books, langColor, languagePercent } from '../lib/books';
import { cssColor } from '../lib/characters';

// ── Small illustrations, drawn from (or in the spirit of) each page's own data ──

/** All 66 books as thin bars, each split by the languages it was written in. */
export function LanguagesArt() {
  const w = 300 / books.length;
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      {books.map((b, i) => {
        const h = 26 + (b.chapters / 150) * 80;
        let y = 120;
        return (
          <g key={b.order}>
            {LANGUAGES.map((l) => {
              const ph = (languagePercent(b, l) / 100) * h;
              if (!ph) return null;
              y -= ph;
              return <rect key={l} x={i * w + 0.6} y={y} width={w - 1.2} height={ph} fill={langColor(l)} rx={0.8} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

const NET_NODES: [number, number, string][] = [
  [60, 60, '--role-patriarch'], [110, 30, '--role-king'], [118, 82, '--role-prophet'], [170, 55, '--role-key'],
  [210, 25, '--role-apostle'], [225, 88, '--role-priest'], [265, 50, '--role-apostle'], [30, 95, '--role-patriarch'],
  [150, 100, '--role-judge'], [75, 18, '--role-patriarch'], [195, 105, '--role-prophet'], [280, 98, '--role-key'],
];
const NET_EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [0, 7], [2, 8], [1, 9], [9, 0], [5, 10], [8, 10], [6, 11], [10, 11]];

export function CharactersArt() {
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      {NET_EDGES.map(([a, b], i) => (
        <line key={i} x1={NET_NODES[a][0]} y1={NET_NODES[a][1]} x2={NET_NODES[b][0]} y2={NET_NODES[b][1]} stroke={cssColor('--ink', 0.22)} strokeWidth={1.2} />
      ))}
      {NET_NODES.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 9 : 6} fill={cssColor(c)} stroke={cssColor('--paper')} strokeWidth={2} />
      ))}
    </svg>
  );
}

export function MapArt() {
  const stops: [number, number][] = [[52, 92], [96, 60], [150, 74], [196, 40], [250, 58]];
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      <rect width="300" height="120" fill={cssColor('--sea', 0.55)} />
      <path d="M0,120 L0,78 C40,70 60,96 96,84 C130,72 140,98 180,92 C220,86 240,104 300,96 L300,120 Z" fill={cssColor('--land')} stroke={cssColor('--coast')} />
      <path d="M150,0 C160,20 140,30 170,48 C200,62 240,30 300,40 L300,0 Z" fill={cssColor('--land')} stroke={cssColor('--coast')} />
      <path d={`M${stops.map((p) => p.join(',')).join(' L')}`} fill="none" stroke={cssColor('--lineage')} strokeWidth={2.5} strokeDasharray="6 5" className="map-arc" />
      {stops.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={8} fill={cssColor('--lineage')} stroke={cssColor('--paper')} strokeWidth={2} />
          <text x={x} y={y + 3.5} textAnchor="middle" className="font-sans text-[9px] font-bold" fill={cssColor('--paper')}>
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function HistoryArt() {
  const lines: [number, number, number, string][] = [
    // [start x, y, parent y, colour]
    [20, 20, 20, '--ink'],
    [70, 40, 20, '--aramaic'],
    [130, 60, 20, '--role-priest'],
    [130, 80, 20, '--role-king'],
    [190, 96, 80, '--greek'],
    [205, 108, 80, '--lineage'],
  ];
  return (
    <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
      {lines.map(([x, y, py, c], i) => (
        <g key={i}>
          {i > 0 && <path d={`M${x},${py} C${x},${(py + y) / 2} ${x},${(py + y) / 2} ${x + 10},${y}`} fill="none" stroke={cssColor(c, 0.7)} strokeWidth={1.6} />}
          <line x1={x + (i > 0 ? 10 : 0)} y1={y} x2={i === 0 ? 130 : 290} y2={y} stroke={cssColor(c)} strokeWidth={4} strokeLinecap="round" />
          <circle cx={x} cy={y} r={4.5} fill={cssColor(c)} stroke={cssColor('--paper')} strokeWidth={1.5} />
        </g>
      ))}
    </svg>
  );
}
