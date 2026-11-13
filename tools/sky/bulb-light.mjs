// The lighting island's bulb, lit from inside in the two colours the store's LED bulbs come in: warm white and clear
// white (lib/kelvin LIGHTS; Bob, round 33: "needs to be true warm white and clear white"). No credits: everything comes
// from the photo itself.
//
// The picture's bulb is a clear globe whose four LED filaments are already lit, warm. For each light this keeps the
// photo's own light where it is (the filaments and the glow they throw into the glass) and gives it the light's colour
// by brightness: golden or white where it glows, near white where it burns, as filaments look to the eye. The glass
// stays clear: only a soft glow hugs the filaments (round 31's bake filled the globe with a haze and a lit block,
// which no real bulb does), and for clear white the photo's warm cast is taken out of the glass. Each result is an
// overlay the size of the published island (island-light-1200/700.webp), transparent wherever nothing changed; the page
// shows warm white and fades clear white in over it (LampSwitch). The light round the globe is one map for both,
// painted on the page in the light's colour (--glow).
//
// Run from the repo root after publish.mjs: node tools/sky/bulb-light.mjs  (add --debug for check images in source/)

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LIGHTS } from '../../lib/kelvin.ts';
import { ISLANDS } from '../../lib/islands.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = join(here, 'source', 'island-light-fixed.png');
const OUT = join(here, '..', '..', 'public', 'sky');
const DEBUG = process.argv.includes('--debug');

// The frame behind the picture where the bulb hangs (air.css .piece__frame, with its soft light near the top).
const FRAME = [36, 74, 54];

// The same trim publish.mjs makes, so the overlays line up with the served island pixel for pixel.
const trimmed = await sharp(SRC).trim({ threshold: 1 }).toBuffer();
const { data: px, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const lamp = ISLANDS.find((i) => i.lamp)?.lamp;
if (!lamp) throw new Error('no lamp in lib/islands');
const cx = (lamp.x / 100) * W;
const cy = (lamp.y / 100) * H;
const r = (lamp.r / 100) * W;

// Work only in a box round the bulb, big enough for its halo and the grass under it.
const x0 = Math.max(0, Math.floor(cx - 3.4 * r));
const x1 = Math.min(W, Math.ceil(cx + 3.4 * r));
const y0 = Math.max(0, Math.floor(cy - 2.8 * r));
const y1 = Math.min(H, Math.ceil(cy + 3.8 * r));
const bw = x1 - x0;
const bh = y1 - y0;
const N = bw * bh;

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const srgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
// Bright values roll off softly instead of clipping flat.
const shoulder = (v) => (v <= 0.85 ? v : 0.85 + 0.15 * (1 - Math.exp(-(v - 0.85) / 0.15)));

// The picture over the frame, in linear light (U), and where the photo's own light is (emit).
const U = new Float32Array(N * 3);
const Us = new Float32Array(N * 3);
const glass = new Float32Array(N);
const emit = new Float32Array(N);
const fil = new Float32Array(N);
const band = new Float32Array(N);
const Lmap = new Float32Array(N);
const dist = new Float32Array(N);
for (let y = 0; y < bh; y++) {
  for (let x = 0; x < bw; x++) {
    const i = y * bw + x;
    const p = ((y + y0) * W + (x + x0)) * 4;
    const a = px[p + 3] / 255;
    for (let c = 0; c < 3; c++) {
      const s = (px[p + c] / 255) * a + (FRAME[c] / 255) * (1 - a);
      Us[i * 3 + c] = s;
      U[i * 3 + c] = lin(s);
    }
    const d = Math.hypot(x + x0 - cx, y + y0 - cy) / r;
    dist[i] = d;
    glass[i] = 1 - smooth(0.82, 0.98, d);
    const warm = Us[i * 3] - Us[i * 3 + 2];
    const L = lum(Us[i * 3], Us[i * 3 + 1], Us[i * 3 + 2]);
    // The filaments: the bright lines in the middle of the globe (the reflections on the glass sit further out).
    const fx = Math.abs(x + x0 - cx) / r;
    const fy = (y + y0 - cy) / r;
    band[i] = (1 - smooth(0.26, 0.36, fx)) * smooth(-0.56, -0.46, fy) * (1 - smooth(0.56, 0.66, fy));
    Lmap[i] = L;
    // The warm glow the photo already has in the glass round them.
    emit[i] = (1 - smooth(0.78, 0.9, d)) * smooth(0.03, 0.16, warm) * smooth(0.18, 0.62, L) * 0.7;
  }
}
// The filaments are the thin lines brighter than the glass right round them; the pale glass between them is not.
{
  const Lb = blur(Lmap, bw, bh, Math.max(2, 0.035 * r));
  for (let i = 0; i < N; i++) {
    fil[i] = band[i] * smooth(0.02, 0.08, Lmap[i] - Lb[i]) * smooth(0.6, 0.85, Lmap[i]);
    emit[i] = Math.max(fil[i], emit[i]);
  }
}

/** A gaussian blur of a w x h float map, in two passes, edges held. */
function blur(src, w, h, sigma) {
  const rad = Math.ceil(sigma * 3);
  const kern = new Float32Array(rad * 2 + 1);
  let sum = 0;
  for (let k = -rad; k <= rad; k++) sum += kern[k + rad] = Math.exp(-(k * k) / (2 * sigma * sigma));
  for (let k = 0; k < kern.length; k++) kern[k] /= sum;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -rad; k <= rad; k++) v += src[y * w + Math.min(w - 1, Math.max(0, x + k))] * kern[k + rad];
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = -rad; k <= rad; k++) v += tmp[Math.min(h - 1, Math.max(0, y + k)) * w + x] * kern[k + rad];
      out[y * w + x] = v;
    }
  }
  return out;
}

/** A soft copy of a map, in full float precision: wide blurs run at a quarter size. Scaled so its peak is 1. */
function soft(map, sigma) {
  const s = sigma > 24 ? 4 : 1;
  const sw = Math.ceil(bw / s);
  const sh = Math.ceil(bh / s);
  const small = new Float32Array(sw * sh);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) small[Math.floor(y / s) * sw + Math.floor(x / s)] += map[y * bw + x] / (s * s);
  const b = blur(small, sw, sh, sigma / s);
  const res = new Float32Array(N);
  let max = 0;
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      // Back to full size, bilinear.
      const fx = Math.min(sw - 1, Math.max(0, (x + 0.5) / s - 0.5));
      const fy = Math.min(sh - 1, Math.max(0, (y + 0.5) / s - 0.5));
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = fx - ix;
      const ty = fy - iy;
      const jx = Math.min(sw - 1, ix + 1);
      const jy = Math.min(sh - 1, iy + 1);
      const v = (b[iy * sw + ix] * (1 - tx) + b[iy * sw + jx] * tx) * (1 - ty) + (b[jy * sw + ix] * (1 - tx) + b[jy * sw + jx] * tx) * ty;
      res[y * bw + x] = v;
      if (v > max) max = v;
    }
  }
  for (let i = 0; i < N; i++) res[i] /= max || 1;
  return res;
}
const tight = soft(fil, 0.022 * r); // the filaments burning
const mid = soft(fil, 0.13 * r); // a glow hugging them
const halo = soft(fil, 0.95 * r); // the light in the air and on what is near

/** A colour in linear light, scaled to a luminance of 1, so it tints without brightening. */
const tint = (rgb) => {
  const l = rgb.map((v) => lin(v / 255));
  const y = lum(l[0], l[1], l[2]);
  return l.map((v) => v / y);
};

const results = [];
for (const light of LIGHTS) {
  const glow = tint(light.glow);
  const core = tint(light.core);
  // Clear white takes the photo's warm cast out of the glass; warm white keeps it.
  const neutral = light.id === 'clear' ? 0.75 : 0;
  // Clear glass is not grey: a hair of warmth keeps it from reading blue against the green.
  const glassTint = [1, 0.995, 0.975];
  const out = Buffer.alloc(W * H * 4); // transparent everywhere outside the box
  const T = [0, 0, 0];
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const i = y * bw + x;
      const e = Math.min(1, fil[i] + tight[i] * 0.5);
      const u = [U[i * 3], U[i * 3 + 1], U[i * 3 + 2]];
      const Y = lum(u[0], u[1], u[2]);
      const Ls = lum(Us[i * 3], Us[i * 3 + 1], Us[i * 3 + 2]);
      // How white the light is here: the brighter, the closer to the core's colour, as a light source looks.
      const w = smooth(0.62, 0.97, Ls);
      const burn = fil[i] * smooth(0.5, 0.88, Ls);
      for (let c = 0; c < 3; c++) {
        const t = glow[c] * (1 - w) + core[c] * w;
        // The photo's own light, a little brighter, in the new colour.
        let v = u[c] + (Y * (1 + 0.12 * fil[i]) * t - u[c]) * e;
        // The clear glass round it, without the photo's warm cast (clear white only).
        v += (Y * glassTint[c] - v) * neutral * glass[i] * (1 - e);
        // The globe lit evenly from the middle, softly, as light fills clear glass (no edges, so no block).
        v += glow[c] * glass[i] * halo[i] * 0.07;
        // The cores burn nearly white.
        v += (core[c] * Math.max(Y, 0.95) - v) * burn * 0.85;
        // A soft glow hugging the filaments, inside the glass; the rest of the globe stays clear.
        v += glow[c] * glass[i] * (tight[i] * 0.42 + mid[i] * 0.12);
        T[c] = srgb(shoulder(Math.max(0, v)));
      }
      // Inside the globe: the least alpha that turns the picture under it into T, keeping the photo's detail.
      const s = [Us[i * 3], Us[i * 3 + 1], Us[i * 3 + 2]];
      let ag = 0;
      for (let c = 0; c < 3; c++) {
        const need = T[c] > s[c] ? (T[c] - s[c]) / Math.max(1e-4, 1 - s[c]) : (s[c] - T[c]) / Math.max(1e-4, s[c]);
        ag = Math.max(ag, need);
      }
      ag = Math.min(1, ag);
      const a = ag * (1 - smooth(0.97, 1.04, dist[i]));
      if (a < 4 / 255) continue; // too faint to see: leave the picture as it is
      const o = ((y + y0) * W + (x + x0)) * 4;
      for (let c = 0; c < 3; c++) out[o + c] = Math.round(Math.min(1, Math.max(0, (T[c] - (1 - ag) * s[c]) / ag)) * 255);
      out[o + 3] = Math.round(a * 255);
    }
  }
  const img = sharp(out, { raw: { width: W, height: H, channels: 4 } });
  for (const w of [1200, 700]) {
    await img.clone().resize(w).webp({ quality: 82, alphaQuality: 85, smartSubsample: true }).toFile(join(OUT, `island-light-${light.id}-${w}.webp`));
  }
  results.push(light.id);
  if (DEBUG) {
    // The overlay and its halo on the frame colour, round the globe, to check by eye.
    const base = await sharp(trimmed).extract({ left: x0, top: y0, width: bw, height: bh }).flatten({ background: { r: FRAME[0], g: FRAME[1], b: FRAME[2] } }).png().toBuffer();
    const haloTint = Buffer.alloc(bw * bh * 4);
    for (let i = 0; i < N; i++) {
      const h = (halo[i] * 0.32 + mid[i] * 0.12) * (1 - smooth(2.4, 3.3, dist[i]));
      for (let c = 0; c < 3; c++) haloTint[i * 4 + c] = light.glow[c];
      haloTint[i * 4 + 3] = Math.round((1 - Math.exp(-2.2 * h)) * 255);
    }
    const lit = await sharp(base)
      .composite([
        { input: await sharp(haloTint, { raw: { width: bw, height: bh, channels: 4 } }).png().toBuffer() },
        { input: await img.clone().extract({ left: x0, top: y0, width: bw, height: bh }).png().toBuffer() },
      ])
      .png()
      .toBuffer();
    const z = Math.round(1.3 * r);
    await sharp(lit)
      .extract({ left: Math.round(cx - x0 - z), top: Math.round(cy - y0 - z * 1.25), width: 2 * z, height: Math.round(2.4 * z) })
      .resize(360)
      .jpeg({ quality: 92 })
      .toFile(join(here, 'source', `debug-glass-${light.id}.jpg`));
  }
}
// The halo: one map of how strong the light is in the air and on the cap, the post and the grass round the bulb, white
// with that strength as its alpha. The page paints it in the light's colour (LampSwitch sets --glow), under the globe.
const haloOut = Buffer.alloc(W * H * 4);
for (let y = 0; y < bh; y++) {
  for (let x = 0; x < bw; x++) {
    const i = y * bw + x;
    const h = (halo[i] * 0.32 + mid[i] * 0.12) * (1 - smooth(2.4, 3.3, dist[i]));
    const o = ((y + y0) * W + (x + x0)) * 4;
    haloOut[o] = haloOut[o + 1] = haloOut[o + 2] = 255;
    haloOut[o + 3] = Math.round((1 - Math.exp(-2.2 * h)) * 255);
  }
}
for (const w of [1200, 700]) {
  await sharp(haloOut, { raw: { width: W, height: H, channels: 4 } })
    .resize(w)
    .webp({ quality: 80, alphaQuality: 90 })
    .toFile(join(OUT, `island-light-halo-${w}.webp`));
}
console.log('bulb overlays', results.join(', '), '+ halo, box', { x0, y0, bw, bh });
