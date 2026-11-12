// The small round pictures in the header's "Bundle offers" pill (round 32): one product from each sample bundle, cut
// from its catalogue picture. The catalogue pictures stand on a warm cream studio, which stays as the circle's ground.
// The product is found as everything clearly unlike the cream (its soft shadow is close to the cream, so it does not
// count), then framed square around it: `fit` is the frame's side against the product's longer side (under 1 crops
// in, for the tall solar panel, so its blue cells fill the little circle; `blue` frames the panel by its blue cells only,
// as its dark shadow would pull the frame aside). Writes public/sky/bundle-<id>-96.webp.
//   node tools/sky/bundle-thumbs.mjs

import sharp from 'sharp';

/** Each sample bundle (lib/bundles.ts), the catalogue picture that stands for it, and how close to frame it. */
const PICKS = [
  { id: 'starter-solar', name: 'solar-panels', fit: 0.88, blue: true },
  { id: 'home-security', name: 'camera-home', fit: 1.06 },
  { id: 'outdoor-lighting', name: 'street-lamp', fit: 1.08 },
];
const STUDIO = [237, 229, 215];
const SIZE = 96;

for (const { id, name, fit, blue } of PICKS) {
  const src = `public/catalog/${name}.webp`;
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const d = Math.abs(data[i] - STUDIO[0]) + Math.abs(data[i + 1] - STUDIO[1]) + Math.abs(data[i + 2] - STUDIO[2]);
      // Clearly unlike the cream, or cooler than it (the white and grey products are neutral, the cream is warm).
      const cool = data[i + 2] >= data[i] - 2;
      const hit = blue ? data[i + 2] - data[i] > 40 : d > 70 || (cool && d > 24);
      if (hit) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const side = Math.round(Math.max(x1 - x0, y1 - y0) * fit);
  // Frame the square on a cream canvas big enough that no crop falls off the picture.
  const padded = await sharp(src)
    .removeAlpha()
    .extend({ top: side, bottom: side, left: side, right: side, background: { r: STUDIO[0], g: STUDIO[1], b: STUDIO[2] } })
    .toBuffer();
  await sharp(padded)
    .extract({ left: Math.round(cx - side / 2) + side, top: Math.round(cy - side / 2) + side, width: side, height: side })
    .resize(SIZE, SIZE)
    .webp({ quality: 84 })
    .toFile(`public/sky/bundle-${id}-${SIZE}.webp`);
  console.log(id, `product ${x1 - x0}x${y1 - y0} at ${Math.round(cx)},${Math.round(cy)}, frame ${side}`);
}
