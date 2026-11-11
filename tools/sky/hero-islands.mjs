// The first view's small islands (round 26, Bob: "continue with the floating island but i want more sub floating
// islands"). They come from one picture (source/islands-small.png, a 2 by 2 sheet); each quarter is cut out, trimmed
// to its own edges and written at two widths: public/sky/island-small-<name>-{640,360}.webp.
// Run from the repo root: node tools/sky/hero-islands.mjs

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'source');
const out = join(here, '..', '..', 'public', 'sky');

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
