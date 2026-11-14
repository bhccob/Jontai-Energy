// Small thumbnails of the products for the quote page's product chips (round 18). Since round 38 (Bob: "less game like
// look feel") they come from the products' own pictures, not the islands: public/sky/range-<name>-1200.webp
// (range-products.mjs) and the bulb (bulb-light.mjs). Writes public/sky/chip-<name>-160.webp; add --debug for a check sheet in tools/sky/source.
// Run from the repo root after range-products.mjs and bulb-light.mjs: node tools/sky/thumbs.mjs

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const sky = join(here, '..', '..', 'public', 'sky');
const DEBUG = process.argv.includes('--debug');
const SIZE = 160;

/** `crop` is a part of the picture (left, top, width, height), where only part of it should show. */
const CHIPS = [
  { name: 'solar-panels', from: 'range-solar-panel-1200.webp' },
  { name: 'inverter', from: 'range-inverter-1200.webp' },
  { name: 'cooling', from: 'range-cooling-1200.webp' },
  { name: 'power', from: 'range-power-1200.webp' },
  // The bulb and its socket, without most of the cord, so the glass is not lost in a small chip.
  { name: 'light', from: 'range-light-600.webp', crop: { left: 0, top: 110, width: 600, height: 600 } },
  { name: 'security', from: 'range-security-1200.webp' },
  { name: 'furniture', from: 'range-furniture-1200.webp' },
];

const sheet = [];
for (const { name, from, crop } of CHIPS) {
  let img = sharp(join(sky, from));
  if (crop) img = img.extract(crop);
  // Trimmed to what is there, so every product fills its chip the same way.
  const part = await sharp(await img.png().toBuffer()).trim({ threshold: 1 }).png().toBuffer();
  const out = await sharp(part)
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 86, alphaQuality: 90 })
    .toBuffer();
  await sharp(out).toFile(join(sky, `chip-${name}-${SIZE}.webp`));
  if (DEBUG) sheet.push(out);
}
if (DEBUG) {
  await sharp({ create: { width: SIZE * sheet.length, height: SIZE, channels: 3, background: '#eef3e7' } })
    .composite(sheet.map((input, i) => ({ input, left: i * SIZE, top: 0 })))
    .jpeg({ quality: 90 })
    .toFile(join(here, 'source', 'debug-chips.jpg'));
}
console.log('chips done');
