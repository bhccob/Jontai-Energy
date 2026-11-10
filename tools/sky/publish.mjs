// Turns the Higgsfield images in tools/sky/source (GPT Image 2.6, prompts in tools/sky/prompts.md) into what the site
// serves in public/sky: the sky at a few widths plus a portrait crop for phones, and each island as a transparent WebP.
// Run from the repo root: node tools/sky/publish.mjs

import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'source');
const out = join(here, '..', '..', 'public', 'sky');
const exists = async (p) => !!(await stat(p).catch(() => null));

await mkdir(out, { recursive: true });

// The sky: wide for desktop, and a portrait slice (clouds and blue) for phones.
const sky = join(src, 'sky-day.png');
if (await exists(sky)) {
  for (const w of [3200, 1920]) {
    await sharp(sky).resize(w).webp({ quality: 80 }).toFile(join(out, `sky-day-${w}.webp`));
  }
  const { width, height } = await sharp(sky).metadata();
  const cropW = Math.round(height * 0.62);
  await sharp(sky)
    .extract({ left: Math.round(width * 0.55), top: 0, width: cropW, height })
    .resize(900)
    .webp({ quality: 80 })
    .toFile(join(out, 'sky-day-phone.webp'));
  console.log('sky done');
}

// Islands: trimmed to their own edges, then two widths with their transparency kept.
for (const name of ['solar', 'power', 'cooling', 'light', 'security', 'furniture']) {
  const file = join(src, `island-${name}.png`);
  if (!(await exists(file))) continue;
  const trimmed = await sharp(file).trim({ threshold: 1 }).toBuffer();
  for (const w of [1400, 800]) {
    await sharp(trimmed).resize(w).webp({ quality: 86, alphaQuality: 90 }).toFile(join(out, `island-${name}-${w}.webp`));
  }
  const m = await sharp(trimmed).metadata();
  console.log(`island-${name}`, m.width, 'x', m.height);
}
