// The first view's islands (round 26, Bob: "continue with the floating island but i want more sub floating islands").
//  1. The four small islands come from one picture (source/islands-small.png, a 2 by 2 sheet); each quarter is cut
//     out, trimmed to its own edges and written at two widths: public/sky/island-small-<name>-{640,360}.webp.
//  2. The main island's light for the sunset: its lamp's bulb, cut from the picture, brighter and warmer, the island's
//     size and clear elsewhere (public/sky/island-main-lights-{1200,700}.webp). As the scroll turns the day to dusk
//     the islands darken (CSS tints, sky.css) and this layer stays bright on top.
// Run from the repo root after `node tools/sky/publish.mjs island-main`:
//   node tools/sky/hero-islands.mjs   (--debug writes check images to source/)

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'source');
const out = join(here, '..', '..', 'public', 'sky');
const debug = process.argv.includes('--debug');

// ---------- 1. The small islands ----------
const SHEET = join(src, 'islands-small.png');
/** The sheet's quarters, left to right, top to bottom. */
const SMALL = ['lantern', 'tree', 'panel', 'meadow'];
const { width: SW, height: SH } = await sharp(SHEET).metadata();
for (const [i, name] of SMALL.entries()) {
  const left = (i % 2) * Math.floor(SW / 2);
  const top = Math.floor(i / 2) * Math.floor(SH / 2);
  const quarter = await sharp(SHEET).extract({ left, top, width: Math.floor(SW / 2), height: Math.floor(SH / 2) }).toBuffer();
  const trimmed = await sharp(quarter).trim({ threshold: 1 }).toBuffer();
  for (const w of [640, 360]) {
    await sharp(trimmed).resize(w).webp({ quality: 80, alphaQuality: 85 }).toFile(join(out, `island-small-${name}-${w}.webp`));
  }
  const m = await sharp(trimmed).metadata();
  console.log(`island-small-${name}`, m.width, 'x', m.height);
}

// ---------- 2. The main island's bulb ----------
/** The bulb's glass, in px of the 1200-wide island (public/sky/island-main-1200.webp, 1200 by 1172). */
const BULB = { cx: 995.5, cy: 134, rx: 31, ry: 39 };

// The same trim publish.mjs makes, so this layer lines up with the island to the pixel.
const { data, info } = await sharp(join(src, 'island-main.png')).trim({ threshold: 1 }).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const k = W / 1200;
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const buf = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const dx = (x - BULB.cx * k) / (BULB.rx * k);
    const dy = (y - BULB.cy * k) / (BULB.ry * k);
    const m = 1 - smooth(0.8, 1, Math.hypot(dx, dy));
    if (m <= 0) continue;
    const i = (y * W + x) * C;
    const o = (y * W + x) * 4;
    const a = C === 4 ? data[i + 3] : 255;
    // The glass and filament, a touch brighter and warmer than by day: the light that is left once the sun has set.
    buf[o] = Math.min(255, Math.round(data[i] * 1.22));
    buf[o + 1] = Math.min(255, Math.round(data[i + 1] * 1.14));
    buf[o + 2] = Math.min(255, Math.round(data[i + 2] * 0.94));
    buf[o + 3] = Math.round(m * a);
  }
}
const png = await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
for (const w of [1200, 700]) {
  await sharp(png).resize(w).webp({ quality: 84, alphaQuality: 90 }).toFile(join(out, `island-main-lights-${w}.webp`));
}
if (debug) {
  const small = await sharp(png).flatten({ background: '#26324a' }).resize(1200).toBuffer();
  await sharp(small).extract({ left: 900, top: 40, width: 200, height: 200 }).resize(600).jpeg({ quality: 88 }).toFile(join(src, 'debug-main-lights.jpg'));
}
console.log('island-main-lights', W, 'x', H);
