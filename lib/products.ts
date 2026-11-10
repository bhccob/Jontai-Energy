// Product data layer. The data lives in data/products.json; this file types it.
// Every number comes from the manufacturer documents Jontai supplied:
//   - Namkoo SPI series datasheet + "All-in-one solar charge inverter SPI-8K-UP / SPI-10K-UP" user manual (V1.7)
//   - Namkoo "3000W Portable Power Station" spec sheet
//   - Namkoo "Solar On Grid ACDC air conditioner" brochure (TKFR-xxGW/OG) and its installation guide
// Categories without a datasheet describe what is carried, with no invented specs.
// Note: the ACDC brochure prints 90000BTU for the TKFR-26GW; a 2.6 kW unit is 9,000 BTU, which is what the JSON says.

import data from '@/data/products.json';
import type { QuoteTopic } from './quote';

export type CategoryId = 'solar' | 'power' | 'led' | 'cameras' | 'furniture';

export interface Spec {
  label: string;
  value: string;
}

/** One datasheet row: a single value, or one value per column when the series differs by model. */
export interface DatasheetRow {
  label: string;
  value?: string;
  values?: string[];
}

/** The full manufacturer table, grouped the way the datasheet groups it. */
export interface Datasheet {
  source: string;
  columns?: string[];
  groups: { title: string; rows: DatasheetRow[] }[];
}

export interface Product {
  id: string;
  name: string;
  model?: string;
  image?: { src: string; alt: string; w: number; h: number };
  summary: string;
  /** Kept short on purpose: wattage, output and one or two essentials. */
  specs: Spec[];
  features: string[];
  /** Optional per-model table, shown collapsed. */
  models?: { caption: string; columns: [string, string, string]; rows: [string, string, string][] };
  datasheet?: Datasheet;
  note?: string;
}

/** One kind of thing the store carries, as the product panel shows it: a picture, a name and one short line. */
export interface RangeItem {
  name: string;
  line: string;
  /** A catalogue illustration (public/catalog), not a photo of specific stock. */
  image: string;
  alt: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  blurb: string;
  floor?: string;
  range: RangeItem[];
  products: Product[];
  /** For categories without datasheets yet: what the store carries. */
  carries?: string[];
  ask?: string;
  /** What the panel's quote button asks about, if one topic fits the whole category. */
  quote?: QuoteTopic;
}

export interface Fact {
  value: string;
  label: string;
}

/** What the product panel can open: a category's range, or one product told in full. */
export type PanelId = CategoryId | 'inverter' | 'solar-ac' | 'power-station' | 'generator';

export type ChapterId = 'solar' | 'cooling' | 'backup' | 'light' | 'upstairs';

/** One product chapter of the home page. Every figure comes from a supplied document; `note` says which. */
export interface HomeChapter {
  id: ChapterId;
  number: string;
  /** After the number in the chapter label ("01 · Solar and inverters"). */
  label: string;
  /** The name in the hero's "In the store" list. */
  index: string;
  floor: 'Ground floor' | 'Second floor';
  title: string;
  lead: string;
  facts?: Fact[];
  /** Chapter 05: the delivery line, set apart. */
  pull?: string;
  note?: string;
  /** Text links that open product panels; the first is the main one. */
  actions: { label: string; panel: PanelId }[];
  quote: QuoteTopic;
  /** A catalogue illustration in public/catalog. */
  image: string;
  alt: string;
  tone?: 'oak';
}

/** Copy for the type-led home page. */
export interface HomeCopy {
  /** The first view (round 9): the owner's line, what the store sells, who runs it and where, two ways in, the caveat. */
  hero: { title: string; aside: string; lead: string; primary: string; secondary: string; note: string };
  /** `team`: the point carries "Meet the team", marked coming soon until the team feature exists. */
  statement: { label: string; strong: string; soft: string; points: { id?: string; label: string; text: string; team?: boolean }[] };
  chapters: HomeChapter[];
  numbers: { label: string; stats: { value: number; label: string }[] };
}

/** One product told in full: a picture, what it does, a few figures and the points that matter. */
export interface ProductPanel {
  name: string;
  /** The model, or a short line on who it is for. */
  model?: string;
  image: string;
  alt: string;
  intro: string;
  /** A line set apart under the intro (the furniture panel's delivery line, verbatim). */
  highlight?: string;
  figures?: Fact[];
  points: { title: string; line: string }[];
  /** Points that happen in order, numbered. */
  steps?: boolean;
  /** The product in `products` whose datasheet or model table opens under Full specifications. */
  specs?: string;
  note?: string;
  source?: string;
  quote: QuoteTopic;
}

export const CATEGORIES = data.categories as Category[];
export const PANELS = data.panels as Partial<Record<PanelId, ProductPanel>>;
export const HOME_COPY = data.home as HomeCopy;

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;
export const panelById = (id: PanelId) => PANELS[id] ?? null;
export const productById = (id: string) => CATEGORIES.flatMap((c) => c.products).find((p) => p.id === id) ?? null;
