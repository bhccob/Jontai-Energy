// The home's lights for the first view's sunset (round 26, Bob: "Sunset, lights on"). As the scroll turns the day to
// dusk the house darkens (CSS tints, sky.css), and this layer stays bright on top: only the lit panes of the front
// window and the porch bulb, cut from the photo itself, the same size as the island so the two lie exactly over each
// other. Everything else is clear, so the file stays small.
// Run from the repo root after publish.mjs: node tools/sky/home-lights.mjs (--debug writes a check image to source/)

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'source', 'island-home.png');
const out = join(here, '..', '..', 'public', 'sky');
const debug = process.argv.includes('--debug');

/** Where the light is, in px of the 1200-wide island (public/sky/island-home-1200.webp). */
export const WINDOW = { x0: 567, y0: 277, x1: 780, y1: 407 };
export const BULB = { cx: 475, cy: 320, rx: 16.5, ry: 20 };

// The same trim publish.mjs makes, so this layer lines up with the island to the pixel.
const { data, info } = await sharp(src).trim({ threshold: 1 }).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const k = W / 1200;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// A rectangle with soft edges (`f` px), in full-size pixels.
const rect = (x, y, r, f) =>
  smooth(r.x0 * k - f, r.x0 * k + f, x) * smooth(-r.x1 * k - f, -r.x1 * k + f, -x) * smooth(r.y0 * k - f, r.y0 * k + f, y) * smooth(-r.y1 * k - f, -r.y1 * k + f, -y);

const outBuf = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const o = (y * W + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = C === 4 ? data[i + 3] : 255;
    // The window: the warm, lit room shows; the sage-green frame and bars stay out (they are cool, R barely above B).
    const inWindow = rect(x, y, WINDOW, 3 * k) * smooth(14, 52, r - b);
    // The bulb: its glass and filament, as a soft oval.
    const dx = (x - BULB.cx * k) / (BULB.rx * k);
    const dy = (y - BULB.cy * k) / (BULB.ry * k);
    const inBulb = 1 - smooth(0.74, 1, Math.hypot(dx, dy));
    const m = Math.max(inWindow, inBulb);
    if (m <= 0) continue;
    // A touch brighter and warmer than by day: the only light left in the scene.
    const lift = inBulb > inWindow ? 1.18 : 1.1;
    outBuf[o] = Math.min(255, Math.round(r * lift));
    outBuf[o + 1] = Math.min(255, Math.round(g * lift * 0.98));
    outBuf[o + 2] = Math.min(255, Math.round(b * lift * 0.88));
    outBuf[o + 3] = Math.round(m * a);
  }
}

const layer = sharp(outBuf, { raw: { width: W, height: H, channels: 4 } });
const png = await layer.png().toBuffer();
for (const w of [1200, 700]) {
  await sharp(png).resize(w).webp({ quality: 82, alphaQuality: 90 }).toFile(join(out, `island-home-lights-${w}.webp`));
}
if (debug) {
  await sharp(png).flatten({ background: '#0f281d' }).resize(1200).jpeg({ quality: 85 }).toFile(join(here, 'source', 'debug-home-lights.jpg'));
}
console.log('island-home-lights', W, 'x', H);
