// The All products page (round 54, /products): every product one by one, filtered by range or found by name.
import { ISLANDS, OTHERS, PRODUCTS, shownIn, type Island, type Product } from './islands.ts';

export type CatalogFilter = 'all' | 'solar' | 'cooling' | 'backup' | 'light' | 'security' | 'upstairs' | 'others';

type Listed = Product & { range: Island };

const RANGE_IDS = ISLANDS.map((i) => i.id);

/** The products a filter shows, before any search: Solar shows every solar product, as the home page does. */
function inFilter(filter: CatalogFilter): Listed[] {
  if (filter === 'all') return PRODUCTS;
  if (filter === 'others') return [];
  const range = ISLANDS.find((i) => i.id === filter);
  if (!range) return PRODUCTS;
  const ids = shownIn(range).map((p) => p.id);
  return ids.map((id) => PRODUCTS.find((p) => p.id === id)!).filter(Boolean);
}

/** All, the six ranges in the home page's order and with its names, then Others; each with how many it holds. */
export const CATALOG_FILTERS: { id: CatalogFilter; label: string; count: number }[] = [
  { id: 'all', label: 'All', count: PRODUCTS.length },
  ...ISLANDS.map((i) => ({ id: i.id as CatalogFilter, label: i.name, count: shownIn(i).length })),
  { id: 'others', label: 'Others', count: OTHERS.length },
];

/** The filter an address asks for (?range=), or All for anything it does not know. */
export function filterFromParam(v: string | string[] | null | undefined): CatalogFilter {
  const first = Array.isArray(v) ? v[0] : v;
  if (first === 'others' || (first && RANGE_IDS.includes(first))) return first as CatalogFilter;
  return 'all';
}

/** The products to show for a filter and a search, matched on the name, ignoring case and spaces round it. */
export function catalogProducts(filter: CatalogFilter, query: string): Listed[] {
  const q = query.trim().toLowerCase();
  const list = inFilter(filter);
  return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
}

/** A range's note (installation, stock, delivery), shown when that range is picked. */
export function rangeNote(filter: CatalogFilter): string | null {
  return ISLANDS.find((i) => i.id === filter)?.note ?? null;
}

/** The panels a range opens beside its note (Furniture: how delivery works). */
export function rangeActions(filter: CatalogFilter): NonNullable<Island['actions']> {
  return ISLANDS.find((i) => i.id === filter)?.actions ?? [];
}

/** The product whose short info the address asks for (?item=), or none for anything that is not one of them. */
export function itemFromParam(v: string | string[] | null | undefined, ids: string[]): string | null {
  const first = Array.isArray(v) ? v[0] : v;
  return first && ids.includes(first) ? first : null;
}

/** The products either side of one in the order the page shows them, and where it stands (1 based; 0 when absent). */
export function neighbours(ids: string[], id: string): { prev: string | null; next: string | null; at: number; of: number } {
  const i = ids.indexOf(id);
  if (i < 0) return { prev: null, next: null, at: 0, of: ids.length };
  return { prev: ids[i - 1] ?? null, next: ids[i + 1] ?? null, at: i + 1, of: ids.length };
}

export interface Point {
  title: string;
  line: string;
}
export interface Figure {
  label: string;
  value: string;
}

/** The ranges whose short info keeps its detail (model, figures, points): their products are one product each (Bob:
 *  "cooling and backup power is fine"). Elsewhere a product is a kind of product, told in one general line. */
export const DETAILED_RANGES = ['cooling', 'backup'];

/** A product told briefly, for the short info on the All products page (round 54, Bob: "see short info of the
 *  products"): its range, its heading, the model when there is one, what it is, up to four figures and three points. */
export interface ShortInfo {
  id: string;
  range: string;
  title: string;
  model: string | null;
  intro: string;
  figures: Figure[];
  points: Point[];
}

/**
 * The short info from a product's full page (components/products/ProductDetail pageOf). In Cooling and Backup power it
 * keeps the model, what it is, up to four figures and three points. In the other ranges, where a product is a kind of
 * product (Bulbs, Ceiling lights, Outdoor cameras), it is the one general line alone (Bob: "not go too much detailed
 * into some products since its like a subcategory/subgenre").
 */
export function shortInfo(page: {
  product: { id: string; range: { id: string; name: string } };
  title: string;
  model?: string | null;
  intro: string;
  summary?: string;
  figures?: Figure[] | null;
  points: Point[];
}): ShortInfo {
  const base = { id: page.product.id, range: page.product.range.name, title: page.title };
  if (!DETAILED_RANGES.includes(page.product.range.id)) {
    return { ...base, model: null, intro: page.summary ?? page.intro, figures: [], points: [] };
  }
  return {
    ...base,
    model: page.model ?? null,
    intro: page.intro,
    figures: (page.figures ?? []).slice(0, 4),
    points: page.points.slice(0, 3),
  };
}
