// Turns the Higgsfield images in tools/sky/source (GPT Image 2.6, prompts in tools/sky/prompts.md) into what the site
// serves in public/sky: the sky at a few widths plus a portrait crop for phones, and each island as a transparent WebP.
// Run from the repo root: node tools/sky/publish.mjs (or name one picture, e.g. `node tools/sky/publish.mjs island-home`)

import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'source');
const out = join(here, '..', '..', 'public', 'sky');
const exists = async (p) => !!(await stat(p).catch(() => null));
const only = process.argv[2];
const wanted = (name) => !only || only === name;

await mkdir(out, { recursive: true });

// The backdrops: wide for desktop, and a portrait slice for phones (`phoneAt` is where the slice starts, as a share of
// the width). The green valley is the page's (Bob, 2026-11-10: "i do want the main color to be green"); the blue sky
// is kept for later sections.
const BACKDROPS = [
  { name: 'valley-green', phoneAt: 0.12 },
  { name: 'sky-day', phoneAt: 0.55 },
];
for (const { name, phoneAt } of BACKDROPS) {
  const file = join(src, `${name}.png`);
  if (!wanted(name) || !(await exists(file))) continue;
  for (const w of [3200, 1920]) {
    await sharp(file).resize(w).webp({ quality: w > 2000 ? 70 : 78 }).toFile(join(out, `${name}-${w}.webp`));
  }
  const { width, height } = await sharp(file).metadata();
  await sharp(file)
    .extract({ left: Math.round(width * phoneAt), top: 0, width: Math.round(height * 0.62), height })
    .resize(900)
    .webp({ quality: 80 })
    .toFile(join(out, `${name}-phone.webp`));
  console.log(name, 'done');
}

// Islands: trimmed to their own edges, then two widths with their transparency kept.
// The first view's island is `boulders` (Aruba's Casibari rocks, a kadushi, three panels and a lamp; round 26), with
// `main` (rounder and mossy) kept beside it; the small islands that float round it come from one picture, cut apart
// by tools/sky/hero-islands.mjs.
for (const name of ['boulders', 'main', 'array', 'solar', 'power', 'cooling', 'light', 'security', 'furniture']) {
  if (!wanted(`island-${name}`)) continue;
  // A fixed version wins where one exists (fix-bulb.mjs turns the lighting island's bulb the right way up).
  const fixed = join(src, `island-${name}-fixed.png`);
  const file = (await exists(fixed)) ? fixed : join(src, `island-${name}.png`);
  if (!(await exists(file))) continue;
  const trimmed = await sharp(file).trim({ threshold: 1 }).toBuffer();
  for (const w of [1200, 700]) {
    await sharp(trimmed).resize(w).webp({ quality: 78, alphaQuality: 80 }).toFile(join(out, `island-${name}-${w}.webp`));
  }
  const m = await sharp(trimmed).metadata();
  console.log(`island-${name}`, m.width, 'x', m.height);
}

// The foreground grass along the bottom of the first view: the blades only, transparent above.
const grass = join(src, 'grass-front.png');
if (wanted('grass-front') && (await exists(grass))) {
  const trimmed = await sharp(grass).trim({ threshold: 1 }).toBuffer();
  for (const w of [2560, 1280]) {
    await sharp(trimmed).resize(w).webp({ quality: 80, alphaQuality: 85 }).toFile(join(out, `grass-front-${w}.webp`));
  }
  const m = await sharp(trimmed).metadata();
  console.log('grass-front', m.width, 'x', m.height);
}
