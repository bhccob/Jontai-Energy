// The range wheel on the home page (round 54): the six ranges and Others by name (Bob: "maybe six ranges products should
// not include the image? and include others"), turning on a drum as the page scrolls, resting on each before the next.
import { WHEEL_COPY } from './homeCopy.ts';
import { ISLANDS, OTHERS, shownIn } from './islands.ts';

/** A faint wash of colour for each range, as r, g, b: sun, sea glass, leaf, lamp, slate mist, sand. */
export const WHEEL_TINT: Record<string, [number, number, number]> = {
  solar: [255, 226, 160],
  cooling: [180, 232, 226],
  backup: [220, 244, 208],
  light: [255, 208, 140],
  security: [196, 216, 236],
  upstairs: [236, 210, 176],
  others: [214, 226, 206],
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Where the wheel stands, from 0 (the first range) to count - 1 (the last), for how far the held screen has scrolled
 * (0 to 1). The scroll is cut into one stretch per range: the first half of each stretch rests on its range, the
 * second half turns to the next; the last stretch only rests.
 */
export function heldPosition(progress: number, count: number): number {
  const f = clamp01(progress) * count;
  const i = Math.floor(f);
  if (i >= count - 1) return count - 1;
  return i + easeInOutCubic(clamp01((f - i - 0.5) / 0.5));
}

/** The scroll progress (0 to 1) at which the wheel rests on a range: where its anchor lands. */
export const restProgress = (index: number, count: number) => (index + 0.2) / count;

/** A range's products on the All products page. */
export const rangeHref = (id: string) => `/products?range=${id}`;

/**
 * A range's name as the wheel sets it: the first words light, the last word bold ("Backup" + "power"), or a one-word
 * name bold alone. Each part is translated in the wheel's own place (data-i18n-ctx="wheel", "wheel|Backup").
 */
export function nameParts(name: string): [string, string] {
  const at = name.lastIndexOf(' ');
  return at < 0 ? ['', name] : [name.slice(0, at), name.slice(at + 1)];
}

/** Which range a link's hash asks the wheel to rest on (#light, or #delivery for Furniture), or -1 for none. */
export function rangeIndexFromHash(hash: string, ids: string[]): number {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id) return -1;
  return ids.indexOf(id === 'delivery' ? 'upstairs' : id);
}

/** One place on the wheel: a range, or Others at the end. `label` is its button, "See all 9 Solar products". */
export interface WheelItem {
  id: string;
  name: string;
  count: number;
  href: string;
  label: string;
}

const fill = (pattern: string, ...values: (string | number)[]) => values.reduce<string>((s, v, i) => s.replace(`{${i}}`, String(v)), pattern);

/** The six ranges in the home page's order, then Others. */
export function wheelItems(): WheelItem[] {
  return [
    ...ISLANDS.map((r) => {
      const count = shownIn(r).length;
      return { id: r.id, name: r.name, count, href: rangeHref(r.id), label: fill(WHEEL_COPY.seeAll, count, r.name) };
    }),
    { id: 'others', name: 'Others', count: OTHERS.length, href: rangeHref('others'), label: fill(WHEEL_COPY.seeOthers, OTHERS.length) },
  ];
}
