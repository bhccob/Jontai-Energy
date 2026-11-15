// The light that follows the pointer over the page's grounds (round 54, components/ui/CursorLight).

/** What can be pressed: over these the light steps aside, so it never sits on a button or a link. */
export const CLICKABLE =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="tab"], [tabindex]:not([tabindex="-1"]), .wn';

/** Where the light never shows: the first view has its own sun (HeroLight), the header's glass has its own highlight
 *  (GlassLight), and an open sheet or the menu covers the page. */
export const NO_LIGHT = '#hero, .nav, .psheet, .menu, [data-cursor-light="off"]';

/**
 * Whether a computed background colour is a dark ground or a light one; null when it is see-through (or nearly), so
 * the caller looks at the element behind it.
 */
export function groundOf(color: string): 'dark' | 'light' | null {
  const m = color.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : Number(m[4]);
  if (alpha < 0.5) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.3 ? 'dark' : 'light';
}
