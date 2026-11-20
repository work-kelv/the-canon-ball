import data from '../data/bibleGeography.json';

export interface GeoPin {
  placeName: string;
  placeId: string | null;
  modernCountry: string;
  lat: number;
  lng: number;
}

export interface KeyLocation {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  mentionCount: number;
  significance: string;
}

export interface JourneyStop {
  name: string;
  lat: number;
  lng: number;
  ref?: string;
  placeId: string | null;
}

/** A journey narrated in (or, for letters, implied by) a book. */
export interface BookJourney {
  id: string;
  title: string;
  who: string;
  ref: string;
  summary: string;
  kind: 'travel' | 'letter' | 'plan' | 'vision';
  majorId?: string;
  legId?: string | null;
  stops: JourneyStop[];
  /** Straight-line km between consecutive stops. */
  legKm: number[];
  distanceKm: number;
}

export interface BookGeo {
  book: string;
  order: number;
  testament: 'Old' | 'New';
  division: string;
  origin: GeoPin & { confidenceNote: string };
  destinationOrSetting: GeoPin & { regionName: string };
  keyLocations: KeyLocation[];
  journeyId?: string;
  journeys: BookJourney[];
}

export interface Waypoint {
  n: number;
  name: string;
  lat: number;
  lng: number;
  ref: string;
  note: string;
  placeId: string | null;
}

export interface JourneyLeg {
  id: string;
  label: string;
  waypoints: Waypoint[];
  /** One-line description of this leg. */
  about: string;
  legKm: number[];
  distanceKm: number;
}

export interface Journey {
  id: string;
  name: string;
  books: string[];
  summary: string;
  /** Paragraphs describing the journey (may contain Scripture references). */
  writeup: string[];
  legs: JourneyLeg[];
}

export interface PlaceInfo {
  id: string;
  name: string;
  lat: number;
  lng: number;
  featureType: string | null;
  modern: string | null;
  modernCountry: string | null;
  description: string | null;
  verseCount: number;
  books: { book: string; order: number; verses: number }[];
  people: { id: string; name: string; verses: number }[];
  openBible: string | null;
  pleiades: string | null;
}

export const geoBooks = data.books as BookGeo[];
export const journeys = data.journeys as Journey[];
export const places = data.places as Record<string, PlaceInfo>;
export const geoMeta = data.meta as { sources: string[]; method: string; generated: string };

/** Colour (CSS variable) and line style for each journey leg. */
export const LEG_STYLE: Record<string, { css: string; dash?: string }> = {
  abraham: { css: '--role-patriarch' },
  exodus: { css: '--role-judge' },
  exile: { css: '--role-priest' },
  return: { css: '--role-priest', dash: '6 4' },
  jesus: { css: '--lineage' },
  'paul-1': { css: '--greek' },
  'paul-2': { css: '--aramaic' },
  'paul-3': { css: '--role-king' },
  'paul-rome': { css: '--rel-rival', dash: '6 4' },
};

export type Bounds = [[number, number], [number, number]]; // [[west, south], [east, north]]

export const REGIONS: { id: string; label: string; short: string; bounds: Bounds }[] = [
  { id: 'full', label: 'Full Mediterranean & Near East', short: 'Whole map', bounds: [[10, 22.5], [52, 44]] },
  { id: 'levant', label: 'The Levant / Holy Land', short: 'Holy Land', bounds: [[33.9, 29.4], [36.9, 33.5]] },
  { id: 'aegean', label: 'Asia Minor & Greece', short: 'Asia Minor & Greece', bounds: [[19.5, 34.6], [37.2, 42.4]] },
  { id: 'mesopotamia', label: 'Mesopotamia', short: 'Mesopotamia', bounds: [[36.5, 29.2], [49.5, 38.4]] },
];

/** Something the map can animate: a named route through ordered stops. */
export interface AnimRoute {
  key: string;
  title: string;
  css: string;
  dash?: string;
  stops: { name: string; lat: number; lng: number }[];
  legKm: number[];
  distanceKm: number;
}

export const fmtDistance = (km: number) =>
  km < 1 ? '—' : `≈ ${km.toLocaleString('en-US')} km (${Math.round(km * 0.621371).toLocaleString('en-US')} mi)`;

export const KIND_LABEL: Record<BookJourney['kind'], string> = {
  travel: 'Journey',
  letter: 'Letter delivered',
  plan: 'Planned journey',
  vision: 'Journey in a vision',
};
