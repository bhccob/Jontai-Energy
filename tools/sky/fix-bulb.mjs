// The lighting island's bulb hung upside down: its socket held the top of the glass and the screw base pointed at the
// ground (Bob, 2026-11-11: "the bulb gotta make sense since its not connected to the socket"). This keeps the cord and
// the socket where they are and turns the glass and base over, so the base goes up into the socket and the globe hangs
// under it, as a pendant bulb does. Writes tools/sky/source/island-light-fixed.png (publish.mjs prefers it) and prints
// where the glass ends up, for the colour-temperature light on the page (lib/islands, light.bulb).
//
//   node tools/sky/fix-bulb.mjs
import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'source', 'island-light.png');
const out = join(here, 'source', 'island-light-fixed.png');

// Measured on the 2048 px source (see the gridded crop in the round 11 notes).
const BULB = { left: 940, top: 446, width: 390, height: 489 }; // glass and base, with clear air around them
const SOCKET = { left: 1078, top: 330, width: 114, height: 124 }; // the black socket under the cord
const SOCKET_BOTTOM = 450;
const CENTER_X = 1135; // the cord's line
const SCALE = 0.9; // the base a touch narrower than the socket that holds it
const TUCK = 26; // how far the top of the base goes up inside the socket

const base = sharp(src);
const { width, height } = await base.metadata();

// 1. The bulb, turned over and a little smaller.
const turned = await sharp(src).extract(BULB).flip().resize(Math.round(BULB.width * SCALE)).png().toBuffer();
const tm = await sharp(turned).metadata();
const left = Math.round(CENTER_X - tm.width / 2);
const top = SOCKET_BOTTOM - TUCK - Math.round(4 * SCALE);

// 2. The socket, laid back on top so it covers the top of the base.
const socket = await sharp(src).extract(SOCKET).png().toBuffer();

// 3. Clear the old bulb, then lay the turned bulb and the socket.
const clear = await sharp({ create: { width: BULB.width, height: BULB.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
const cleared = await base.composite([{ input: clear, left: BULB.left, top: BULB.top, blend: 'dest-out' }]).png().toBuffer();
await sharp(cleared)
  .composite([
    { input: turned, left, top },
    { input: socket, left: SOCKET.left, top: SOCKET.top },
  ])
  .png()
  .toFile(out);

// Where the glass sits now, as a share of the trimmed picture publish.mjs makes (it trims clear edges).
const { info } = await sharp(out).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
const tw = info.width;
const th = info.height;
const ox = -(info.trimOffsetLeft ?? 0);
const oy = -(info.trimOffsetTop ?? 0);
// In the source the globe filled 450..824 of the crop's 446..935; turned over and scaled it sits below the base.
const globeTop = top + (BULB.top + BULB.height - 824) * SCALE;
const globeBottom = top + (BULB.top + BULB.height - 450) * SCALE;
const cy = (globeTop + globeBottom) / 2;
const r = (globeBottom - globeTop) / 2;
const pct = (v, total) => +((100 * v) / total).toFixed(2);
console.log({ size: [width, height], trimmed: [tw, th], offset: [ox, oy] });
console.log('bulb', { x: pct(CENTER_X - ox, tw), y: pct(cy - oy, th), r: pct(r, tw) });
