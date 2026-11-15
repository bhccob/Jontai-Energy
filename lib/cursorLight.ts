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

// ---------- The trail (round 54): squared-media.nl's logic, Jontai's own look ----------

/**
 * What the trail never lies on: anything that can be pressed, and the page's words and pictures. It shows only on the
 * plain ground between them (Bob: "it only need to appear in certain places like in background that doesnt matter
 * much"). The wheel's names count by their words alone: their buttons span the screen to centre them.
 */
export const CONTENT = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  '[role="button"]',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'li',
  'dt',
  'dd',
  'blockquote',
  'figure',
  // Pictures, but not the first view's valley: it lies behind everything, as ground.
  'img:not(.sky *)',
  'picture:not(.sky *)',
  'video:not(.sky *)',
  'svg',
  'table',
  '.wn > *',
].join(', ');

export interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}

/** Whether a point lies on any of the boxes, with `pad` px of room kept round each. */
export function insideAny(x: number, y: number, boxes: Box[], pad: number): boolean {
  for (const b of boxes) if (x >= b.l - pad && x <= b.r + pad && y >= b.t - pad && y <= b.b + pad) return true;
  return false;
}

/** A speck of light left behind by the pointer: where it is, how it drifts (px a second), how long it has left of its
 *  span (s), its size (px radius when new) and its tone (0 faint, 1 middle, 2 bright). */
export interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  span: number;
  size: number;
  tone: number;
}

/** A speck one step later: drifting on, slowing a little, and older; `hurry` ages it faster (the pointer has reached
 *  something). Null once its life is over. */
export function stepMote(m: Mote, dt: number, hurry: number): Mote | null {
  const life = m.life - dt * hurry;
  if (life <= 0) return null;
  const drag = Math.pow(0.4, dt);
  return { ...m, x: m.x + m.vx * dt, y: m.y + m.vy * dt, vx: m.vx * drag, vy: m.vy * drag, life };
}

/** How a speck looks for its age: it shrinks to two fifths and fades out as its life runs down. */
export function moteLook(m: Mote): { radius: number; alpha: number } {
  const k = Math.max(0, Math.min(1, m.life / m.span));
  return { radius: m.size * (0.4 + 0.6 * k), alpha: Math.pow(k, 1.3) };
}

/** How far the pointer travels, in px, for each speck it leaves. */
export const MOTE_STEP = 5;

/** How many specks the pointer leaves for how far it has travelled since the last one (px): none when still, a few
 *  at most however fast it goes. The caller keeps the distance over frames, so a slow pointer or a fast screen (a
 *  little movement each frame) still leaves its trail. */
export const emitCount = (distance: number) => Math.min(4, Math.floor(distance / MOTE_STEP));

const TONES: Record<'light' | 'dark', string[]> = {
  // Ink, leaf and the brand's forest green on the light grounds.
  light: ['23, 61, 44', '63, 154, 107', '47, 143, 85'],
  // Cream, mint and pale sunlit mint on the deep green.
  dark: ['244, 246, 239', '124, 196, 154', '214, 240, 214'],
};

/** A speck's colour (r, g, b) on a ground, by its tone. */
export const moteColor = (ground: 'light' | 'dark', tone: number) => TONES[ground][Math.min(2, Math.max(0, tone))];
