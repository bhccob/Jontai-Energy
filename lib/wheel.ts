// The range wheel on the home page (round 54): the six ranges and Others by name (Bob: "maybe six ranges products should
// not include the image? and include others"), turning on a drum as the page scrolls, resting on each before the next.
import { WHEEL_COPY } from './homeCopy.ts';
import { ISLANDS, OTHERS, shownIn } from './islands.ts';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** How much of each range's stretch of scroll rests on it; the rest turns to the next (Bob: "better scrolling feel":
 *  a short rest and a long, gentle turn, instead of half and half). */
export const WHEEL_REST = 0.22;

/**
 * Where the wheel stands, from 0 (the first range) to count - 1 (the last), for how far the held screen has scrolled
 * (0 to 1). The scroll is cut into one stretch per range: the start of each stretch rests on its range, the rest of it
 * turns to the next, easing in and out; the last stretch only rests.
 */
export function heldPosition(progress: number, count: number): number {
  const f = clamp01(progress) * count;
  const i = Math.floor(f);
  if (i >= count - 1) return count - 1;
  return i + easeInOutSine(clamp01((f - i - WHEEL_REST) / (1 - WHEEL_REST)));
}

/** The scroll progress (0 to 1) at which the wheel rests on a range: the middle of its rest, where its anchor lands. */
export const restProgress = (index: number, count: number) => (index + WHEEL_REST / 2) / count;

/**
 * The range to settle on when the scroll stops part way through a turn, as a phone's date picker clicks into place: on
 * to the next one the way the scroll was going (so one mouse-wheel notch turns one name), or the nearer one when the
 * way is not known (direction 0). -1 when there is nothing to settle: resting on a range, or outside the wheel's turns.
 */
export function settleOn(progress: number, count: number, direction: number): number {
  if (!(progress > 0 && progress < 1)) return -1;
  const f = progress * count;
  const i = Math.floor(f);
  if (i >= count - 1 || f - i < WHEEL_REST) return -1;
  const pos = heldPosition(progress, count);
  if (pos - i < 0.002 || i + 1 - pos < 0.002) return -1;
  if (direction > 0) return i + 1;
  if (direction < 0) return i;
  return Math.round(pos);
}

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

/** One place on the wheel: a range, or Others at the end. `label` is its link, "See Solar products". */
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
      return { id: r.id, name: r.name, count, href: rangeHref(r.id), label: fill(WHEEL_COPY.see, r.name) };
    }),
    { id: 'others', name: 'Others', count: OTHERS.length, href: rangeHref('others'), label: WHEEL_COPY.seeOthers },
  ];
}
