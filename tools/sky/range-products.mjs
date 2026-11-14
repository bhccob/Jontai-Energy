// The pictures of the six ranges without islands (round 36, Bob: "i wanna see the products in six ranges without the
// islands"; round 38: "make the image higher quality for the products"). Each range's own products, made sharp on a
// transparent background with GPT Image 2.6 at 2K from the catalogue pictures (tools/sky/prompts.md, round 38), so
// they stand by themselves on the range's dark green frame. Lighting is not here: its bulb is the hanging bulb of the
// old lighting island, without its post and island (bulb-light.mjs writes range-light-*).
//
// Reads tools/sky/source/range-<image>.png, trims it to the product, and writes public/sky/range-<image>-{1200,640}.webp;
// prints each picture's size for lib/islands.ts.
//   node tools/sky/range-products.mjs            (add --debug for a check sheet in tools/sky/source)

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, 'source');
const OUT = join(here, '..', '..', 'public', 'sky');
const DEBUG = process.argv.includes('--debug');
/** The frame's green (air.css .piece__frame), for the check sheet. */
const FRAME = '#1e3a2c';
/** Every product shown in the ranges (round 39: two to four a range), as tools/sky/source/range-<name>.png. Names on the
 *  command line publish only those. */
const ALL = [
  'solar-panel',
  'inverter',
  'cooling',
  'solar-fan',
  'power',
  'generator',
  'street-lamp',
  'floodlight',
  'led-strip',
  'ceiling-lights',
  'tubes',
  'security',
  'camera-site',
  'furniture',
  'sofa',
];
const picked = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const RANGES = picked.length ? ALL.filter((n) => picked.includes(n)) : ALL;
/** The widths served: the large one for wide screens at 2x and phones at 3x, the small one for the rest. */
const WIDTHS = [1200, 640];
/** Alpha at or under this is air round the product, not the product (soft specks the model leaves at the edges). */
const AIR = 8;

/** The box round everything more solid than AIR, plus a few pixels so the soft outline is never cut. */
async function bounds(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let x0 = W;
  let y0 = H;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > AIR) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const pad = 6;
  const left = Math.max(0, x0 - pad);
  const top = Math.max(0, y0 - pad);
  return { left, top, width: Math.min(W, x1 + pad + 1) - left, height: Math.min(H, y1 + pad + 1) - top };
}

const sheet = [];
for (const image of RANGES) {
  const src = join(SRC, `range-${image}.png`);
  const box = await bounds(src);
  const whole = await sharp(src).extract(box).png().toBuffer();
  for (const w of WIDTHS) {
    await sharp(whole)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 92, smartSubsample: true, effort: 6 })
      .toFile(join(OUT, `range-${image}-${w}.webp`));
  }
  const served = await sharp(join(OUT, `range-${image}-${WIDTHS[0]}.webp`)).metadata();
  console.log(`${image}: size [${served.width}, ${served.height}] from ${box.width} x ${box.height}`);
  if (DEBUG) sheet.push(await sharp(whole).resize(360, 440, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer());
}
if (DEBUG) {
  const all = await sharp({ create: { width: 360 * sheet.length, height: 440, channels: 3, background: FRAME } })
    .composite(sheet.map((input, i) => ({ input, left: i * 360, top: 0 })))
    .jpeg({ quality: 90 })
    .toFile(join(here, 'source', 'debug-ranges.jpg'));
  console.log('check sheet', `${all.width}x${all.height}`);
}
