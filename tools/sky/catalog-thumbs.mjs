// Small cut-out thumbnails of catalogue pictures for the quote form's chips (round 31), for the products that have no
// island of their own (solar fans, solar street lamps). The catalogue pictures stand on a warm cream studio background:
// everything warm and light that reaches the picture's edges is that background (or its soft shadow) and goes; the
// products are neutral white, grey, black or blue, so they stay. Writes public/sky/thumb-<name>-160.webp.
//   node tools/sky/catalog-thumbs.mjs street-lamp solar-fan

import sharp from 'sharp';

const names = process.argv.slice(2);
for (const name of names) {
  const { data, info } = await sharp(`tools/sky/source/catalog/${name}.png`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const bg = new Uint8Array(W * H);
  // Background: warm (red well over blue) and not dark; shadows on the cream stay warm too.
  const isBg = (i) => {
    const r = data[i * 3];
    const b = data[i * 3 + 2];
    const L = (r + data[i * 3 + 1] + b) / 3;
    return r - b >= 11 && L >= 150;
  };
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (bg[i] || !isBg(i)) continue;
    bg[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }
  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = bg[i] ? 0 : 255;
  }
  // Trim to the product, square it with a little air, and shrink (the shrink softens the outline).
  const cut = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(cut).trim({ threshold: 0 }).toBuffer({ resolveWithObject: true });
  const side = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 1.06);
  await sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: trimmed.data, gravity: 'centre' }])
    .png()
    .toBuffer()
    .then((sq) => sharp(sq).resize(160, 160).webp({ quality: 82, alphaQuality: 90 }).toFile(`public/sky/thumb-${name}-160.webp`));
  console.log(name, 'trimmed', trimmed.info.width, trimmed.info.height);
}
