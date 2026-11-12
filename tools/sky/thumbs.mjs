// Small square-ish thumbnails of the islands, from the published 700 px pictures: public/sky/island-<name>-160.webp for
// the quote page's product chips (round 18). (The -320 ones for Why's two floors went with them in round 21.)
// Run from the repo root after publish.mjs: node tools/sky/thumbs.mjs

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const sky = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'sky');
for (const name of ['solar', 'array', 'cooling', 'power', 'light', 'security', 'furniture']) {
  for (const size of [160]) {
    await sharp(join(sky, `island-${name}-700.webp`))
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80, alphaQuality: 80 })
      .toFile(join(sky, `island-${name}-${size}.webp`));
  }
}
console.log('thumbs done');
