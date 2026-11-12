// Cuts a subject out of a plain white background (for models with no transparent output, such as FLUX 3; round 26).
// Only the white that reaches the picture's edges is removed, so white flowers and pale stones inside the subject stay;
// along the outline the alpha is soft, and the white is taken back out of the colour there, so no light halo is left.
//   node tools/sky/cutout-white.mjs <in.png> <out.png> [--clear N] [--solid N] [--tight-solid N]
//     [--tight "x0,y0,x1,y1;..."] [--keep "x0,y0,x1,y1;..."] [--pocket N]
// Areas are in % of the input picture.

import sharp from 'sharp';

const [input, output, ...opts] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node tools/sky/cutout-white.mjs <in.png> <out.png> [--clear N] [--solid N] [--tight-solid N] [--tight areas] [--keep areas] [--pocket N]');
  process.exit(2);
}
const raw = (name) => {
  const i = opts.indexOf(name);
  return i >= 0 ? opts[i + 1] : undefined;
};
const opt = (name, fallback) => (raw(name) === undefined ? fallback : Number(raw(name)));
const areas = (name) =>
  (raw(name) ?? '')
    .split(';')
    .filter(Boolean)
    .map((a) => a.split(',').map(Number));

/**
 * How far from white a pixel may be and still count as background (0 to 255, on its least white channel): fully clear
 * up to CLEAR, part clear up to SOLID. Near-white parts at the outline (pale stones, glass bulbs) need a tighter limit:
 * --tight-solid applies inside the --tight areas, e.g. 12 when the background is pure white (CLEAR just above its
 * noise), while the looser SOLID elsewhere clears the soft white haze round wispy grass.
 */
const CLEAR = opt('--clear', 10);
const SOLID = opt('--solid', 44);
const TIGHT = opt('--tight-solid', SOLID);
/** No pocket inside these areas is ever background (white lettering on a card). */
const KEEP = areas('--keep');
const TIGHT_AREAS = areas('--tight');

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const n = W * H;
const inside = (list, p) => {
  const x = ((p % W) / W) * 100;
  const y = (Math.floor(p / W) / H) * 100;
  return list.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
};
const far = new Uint8Array(n);
const solid = new Uint8Array(n);
for (let p = 0; p < n; p++) {
  const i = p * 3;
  far[p] = 255 - Math.min(data[i], data[i + 1], data[i + 2]);
  solid[p] = TIGHT_AREAS.length && inside(TIGHT_AREAS, p) ? TIGHT : SOLID;
}

// The background: every near-white pixel reachable from the edges.
const bg = new Uint8Array(n);
const queue = new Int32Array(n);
let head = 0;
let tail = 0;
const push = (p) => {
  if (!bg[p] && far[p] < solid[p]) {
    bg[p] = 1;
    queue[tail++] = p;
  }
};
for (let x = 0; x < W; x++) {
  push(x);
  push((H - 1) * W + x);
}
for (let y = 0; y < H; y++) {
  push(y * W);
  push(y * W + W - 1);
}
while (head < tail) {
  const p = queue[head++];
  const x = p % W;
  if (x > 0) push(p - 1);
  if (x < W - 1) push(p + 1);
  if (p >= W) push(p - W);
  if (p < n - W) push(p + W);
}

// Background trapped inside the subject (the gap between a lamp's arm and its brace, the gaps between blades of grass):
// an enclosed near-white pocket counts as background when it holds a good patch of pure white, or when it is small but
// almost all pure white, which shaded flowers and pale stones never are (--pocket sets the size of a good patch). A pocket
// lying wholly inside a --keep area stays (the white letters on a card); one that reaches out of it does not.
const PURE = 3;
const POCKET = opt('--pocket', 150);
const MOSTLY = 0.7;
const seen = new Uint8Array(n);
for (let s = 0; s < n; s++) {
  if (bg[s] || seen[s] || far[s] >= solid[s]) continue;
  head = 0;
  tail = 0;
  queue[tail++] = s;
  seen[s] = 1;
  let pure = 0;
  let kept = KEEP.length > 0;
  while (head < tail) {
    const p = queue[head++];
    if (far[p] < PURE) pure++;
    if (kept && !inside(KEEP, p)) kept = false;
    const x = p % W;
    for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p >= W ? p - W : -1, p < n - W ? p + W : -1]) {
      if (q >= 0 && !seen[q] && !bg[q] && far[q] < solid[q]) {
        seen[q] = 1;
        queue[tail++] = q;
      }
    }
  }
  if (!kept && (pure >= POCKET || (pure >= 6 && pure / tail >= MOSTLY))) for (let k = 0; k < tail; k++) bg[queue[k]] = 1;
}

const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const out = Buffer.alloc(n * 4);
for (let p = 0; p < n; p++) {
  const i = p * 3;
  const o = p * 4;
  const a = bg[p] ? smooth(CLEAR, solid[p], far[p]) : 1;
  for (let c = 0; c < 3; c++) {
    // Take the white back out of a part-clear pixel: colour = (seen - (1 - a) * white) / a.
    const v = a > 0 && a < 1 ? (data[i + c] - (1 - a) * 255) / a : data[i + c];
    out[o + c] = Math.max(0, Math.min(255, Math.round(v)));
  }
  out[o + 3] = Math.round(a * 255);
}
await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toFile(output);
console.log('cut out', W, 'x', H, '->', output);
