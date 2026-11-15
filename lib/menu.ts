// The full-screen menu's links (round 54, Bob of the eleven big capitals before: "this is so cluttered").
import { DIRECTIONS_URL } from './contact.ts';
import { MENU_COPY } from './homeCopy.ts';
import { ISLANDS } from './islands.ts';
import { QUOTE_ACTION } from './quote.ts';
import { rangeHref } from './wheel.ts';

export interface MenuLink {
  href: string;
  label: string;
  /** Opens another site (the map), in a new tab. */
  external?: boolean;
}

/**
 * Four big links to the home page's places, then, small: All products and the six ranges in the wheel's order (each
 * straight to its products), and the ways to get help. `base` is '' on the home page and '/' on the others.
 */
export function menuLinks(base: string): { main: MenuLink[]; ranges: MenuLink[]; help: MenuLink[] } {
  return {
    main: [
      { href: `${base}#products`, label: MENU_COPY.sell },
      { href: `${base}#solution`, label: MENU_COPY.solution },
      { href: `${base}#rewards`, label: MENU_COPY.rewards },
      { href: `${base}#visit`, label: MENU_COPY.visit },
    ],
    ranges: [{ href: '/products', label: MENU_COPY.products }, ...ISLANDS.map((r) => ({ href: rangeHref(r.id), label: r.name }))],
    help: [
      { href: '/support', label: MENU_COPY.support },
      { href: '/contact', label: MENU_COPY.message },
      { href: '/quote', label: QUOTE_ACTION },
      { href: DIRECTIONS_URL, label: MENU_COPY.directions, external: true },
    ],
  };
}
