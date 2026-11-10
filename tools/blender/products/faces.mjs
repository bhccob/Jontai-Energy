// Printed and lit faces for the Blender products (screens, labels), drawn as SVG and rasterised with sharp.
// Run from the repo root: node tools/blender/products/faces.mjs
// Each face writes two PNGs: `<name>-base.png` (what is printed on the glass, as it looks unlit) and
// `<name>-emit.png` (only what glows). The readouts on screens are decoration, not product figures.

import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'textures');

const GREEN = '#3fe08c';
const MONO = "Consolas, 'Cascadia Mono', 'DejaVu Sans Mono', monospace";

/** The hybrid inverter's glass: the LCD with its flow diagram, three status lights, four touch keys. */
function inverterFace(lit) {
  const W = 1030;
  const H = 970;
  const ink = lit ? GREEN : '#2f9a63';
  const lcd = lit ? '#0a1f19' : '#0d1b17';
  const ground = lit ? '#000000' : '#060707';
  const key = lit ? 'none' : '#5d6763';
  const line = `stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const text = (x, y, s, size = 70, anchor = 'start') =>
    `<text x="${x}" y="${y}" fill="${ink}" font-family="${MONO}" font-size="${size}" font-weight="700" text-anchor="${anchor}">${s}</text>`;
  const led = (y, c) => `<circle cx="912" cy="${y}" r="13" fill="${lit ? c : '#262b29'}"/>`;
  const keyRing = (x) => `<circle cx="${x}" cy="826" r="31" stroke="${key}" stroke-width="5" fill="none"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${ground}"/>
  <rect x="140" y="128" width="690" height="520" rx="16" fill="${lcd}"/>
  <!-- solar array, top left -->
  <g ${line}><rect x="186" y="168" width="70" height="48"/><path d="M209 168v48M233 168v48M186 192h70M221 216v26"/></g>
  ${text(278, 218, '2.46')}${text(458, 218, 'kW', 34)}
  <!-- grid, top right -->
  <g ${line}><path d="M760 164l-22 82M760 164l22 82M744 188h32M738 214h44"/></g>
  ${text(708, 218, '230', 70, 'end')}
  <!-- the inverter in the middle -->
  <circle cx="485" cy="392" r="58" ${line}/>
  <path d="M452 380q16-20 33 0t33 0" ${line}/><path d="M455 410h60" ${line}/>
  <path d="M256 242v92q0 22 22 22h148M760 250v84q0 22-22 22H544M256 520v-92q0-22 22-22h148M760 520v-92q0-22-22-22H544" ${line}/>
  <!-- battery, bottom left -->
  <g ${line}><rect x="190" y="534" width="64" height="40" rx="4"/><path d="M254 548h8v12h-8M206 554h14M213 547v14M232 554h10"/></g>
  ${text(278, 576, '52.4')}${text(458, 576, 'V', 34)}
  <!-- the house, bottom right -->
  <g ${line}><path d="M738 574v-34l24-20 24 20v34z"/></g>
  ${text(708, 576, '230', 70, 'end')}
  <path d="M170 610h660" stroke="${ink}" stroke-width="3" opacity="0.5"/>
  ${text(800, 640, '1740.2 kWh', 30, 'end')}
  ${led(232, '#ff4b3e')}${led(312, GREEN)}${led(392, '#ffb21f')}
  ${keyRing(310)}${keyRing(436)}${keyRing(562)}${keyRing(688)}
  <g stroke="${key}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M310 806v20M298 812a16 16 0 1 0 24 0"/>
    <path d="M424 832l12-12 12 12"/><path d="M550 820l12 12 12-12"/>
    <path d="M674 826l10 10 18-20"/>
  </g>
</svg>`;
}

const FACES = { inverter: inverterFace };

await mkdir(out, { recursive: true });
for (const [name, draw] of Object.entries(FACES)) {
  for (const lit of [false, true]) {
    const file = join(out, `${name}-${lit ? 'emit' : 'base'}.png`);
    await sharp(Buffer.from(draw(lit)), { density: 144 }).resize(1024, 964).png().toFile(file);
    console.log('wrote', file);
  }
}
