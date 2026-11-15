// The trail of dots that follows the pointer over the page's grounds (round 54, components/ui/CursorTrail).

/** What can be pressed: over these the trail fades away, so it never sits on a button or a link. */
export const CLICKABLE =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="tab"], [tabindex]:not([tabindex="-1"]), .wn';

/** Where the trail never shows: the header's glass has its own highlight (GlassLight), and an open sheet or the menu
 *  covers the page. */
export const NO_LIGHT = '.nav, .psheet, .menu, .pinfo, [data-cursor-light="off"]';

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

// ---------- The trail (round 54, after squared-media.nl's logic, in Jontai's greens) ----------

/** The grid the trail is drawn on, in px: one dot per cell at most. */
export const TRAIL_CELL = 9;

/** How wide the trail is, in px, along its length: i is 0 at the tail and 1 at the head. */
export const trailRadius = (i: number) => 4 + 32 * Math.pow(Math.min(1, Math.max(0, i)), 1.6);

/** How bright a cell's dot is, from how much of the trail lies on it: -1 (no dot), then 0 (faintest) to 3. */
export function dotLevel(heat: number): number {
  const d = 1 - Math.exp(-1.1 * Math.max(0, heat));
  if (d < 0.05) return -1;
  return Math.min(3, Math.floor(d * 4));
}

const COLORS: Record<'light' | 'dark', string[]> = {
  // Faint ink, then leaf, then the brand's forest green at the head.
  light: ['rgba(23, 61, 44, 0.22)', 'rgba(23, 61, 44, 0.42)', 'rgba(63, 154, 107, 0.78)', 'rgba(47, 143, 85, 0.96)'],
  // Faint cream, then mint, then pale mint at the head.
  dark: ['rgba(244, 246, 239, 0.24)', 'rgba(244, 246, 239, 0.46)', 'rgba(124, 196, 154, 0.82)', 'rgba(190, 232, 200, 0.96)'],
};

/** A dot's colour on a ground, by its level. */
export const dotColor = (ground: 'light' | 'dark', level: number) => COLORS[ground][Math.min(3, Math.max(0, level))];

/** A dot's size, in px radius, by its level; `jitter` (0 to 1) varies it a little so the trail shimmers. */
export const dotSize = (level: number, jitter: number) => [0.8, 1.15, 1.6, 2.15][Math.min(3, Math.max(0, level))] * (0.85 + 0.3 * jitter);

/** A steady pseudo-random number (0 to 1) for a cell at a moment, so each dot shimmers on its own. */
export function cellNoise(x: number, y: number, t: number): number {
  let n = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(t, 83492791)) >>> 0;
  n = (n ^ (n >>> 13)) >>> 0;
  n = Math.imul(n, 1274126177) >>> 0;
  return (n % 1000) / 1000;
}
