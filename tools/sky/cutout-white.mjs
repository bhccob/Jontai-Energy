// Cuts a subject out of a plain white background (for models with no transparent output, such as FLUX 3; round 26).
// Only the white that reaches the picture's edges is removed, so white flowers and pale stones inside the subject stay;
// along the outline the alpha is soft, and the white is taken back out of the colour there, so no light halo is left.
//   node tools/sky/cutout-white.mjs <in.png> <out.png> [--clear N] [--solid N]

import sharp from 'sharp';

const [input, output, ...opts] = process.argv.slice(2);
if (!input || !output) {
  console.error('usage: node tools/sky/cutout-white.mjs <in.png> <out.png> [--clear N] [--solid N]');
  process.exit(2);
}
const opt = (name, fallback) => {
  const i = opts.indexOf(name);
  return i >= 0 ? Number(opts[i + 1]) : fallback;
};

/**
 * How far from white a pixel may be and still count as background (0 to 255, on its least white channel): fully clear
 * up to CLEAR, part clear up to SOLID. A subject with near-white parts at its outline (pale stones) needs a tighter
 * SOLID, e.g. --clear 5 --solid 12 when the background is pure white (CLEAR just above its noise).
 */
const CLEAR = opt('--clear', 10);
const SOLID = opt('--solid', 44);

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const n = W * H;
const far = new Uint8Array(n);
for (let p = 0; p < n; p++) {
  const i = p * 3;
  far[p] = 255 - Math.min(data[i], data[i + 1], data[i + 2]);
}

// The background: every near-white pixel reachable from the edges.
const bg = new Uint8Array(n);
const queue = new Int32Array(n);
let head = 0;
let tail = 0;
const push = (p) => {
  if (!bg[p] && far[p] < SOLID) {
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

// Background trapped inside the subject (the gap between a lamp's arm and its brace): an enclosed near-white pocket
// counts as background when it holds a good patch of pure white, which flowers and pale stones never do.
const PURE = 3;
const POCKET = 150;
const seen = new Uint8Array(n);
for (let s = 0; s < n; s++) {
  if (bg[s] || seen[s] || far[s] >= SOLID) continue;
  head = 0;
  tail = 0;
  queue[tail++] = s;
  seen[s] = 1;
  let pure = 0;
  while (head < tail) {
    const p = queue[head++];
    if (far[p] < PURE) pure++;
    const x = p % W;
    for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p >= W ? p - W : -1, p < n - W ? p + W : -1]) {
      if (q >= 0 && !seen[q] && !bg[q] && far[q] < SOLID) {
        seen[q] = 1;
        queue[tail++] = q;
      }
    }
  }
  if (pure >= POCKET) for (let k = 0; k < tail; k++) bg[queue[k]] = 1;
}

const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const out = Buffer.alloc(n * 4);
for (let p = 0; p < n; p++) {
  const i = p * 3;
  const o = p * 4;
  const a = bg[p] ? smooth(CLEAR, SOLID, far[p]) : 1;
  for (let c = 0; c < 3; c++) {
    // Take the white back out of a part-clear pixel: colour = (seen - (1 - a) * white) / a.
    const v = a > 0 && a < 1 ? (data[i + c] - (1 - a) * 255) / a : data[i + c];
    out[o + c] = Math.max(0, Math.min(255, Math.round(v)));
  }
  out[o + 3] = Math.round(a * 255);
}
await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toFile(output);
console.log('cut out', W, 'x', H, '->', output);
