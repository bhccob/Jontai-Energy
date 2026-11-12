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

/**
 * Monocrystalline cells under glass: pseudo-square cells with clipped corners (the backsheet shows through as small
 * diamonds), thin silver busbars, a white backsheet margin. Sizes in metres; `ppm` is pixels per metre.
 */
function cellsFace({ cols, rows, w, h, ppm, margin = 0.012, gap = 0.003, bars = 10 }) {
  const W = Math.round(w * ppm);
  const H = Math.round(h * ppm);
  const mx = margin * ppm;
  const my = margin * 1.6 * ppm;
  const pw = (W - 2 * mx) / cols;
  const ph = (H - 2 * my) / rows;
  const g = gap * ppm;
  const cw = pw - g;
  const ch = ph - g;
  const cut = Math.min(cw, ch) * 0.075;
  let cells = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = mx + c * pw + g / 2;
      const y = my + r * ph + g / 2;
      cells += `<path d="M${x + cut} ${y}h${cw - 2 * cut}l${cut} ${cut}v${ch - 2 * cut}l${-cut} ${cut}h${-(cw - 2 * cut)}l${-cut} ${-cut}v${-(ch - 2 * cut)}z" fill="url(#cell)"/>`;
      for (let b = 1; b <= bars; b++) {
        const bx = x + (cw * b) / (bars + 1);
        cells += `<rect x="${bx - 0.5}" y="${y + 1}" width="1.1" height="${ch - 2}" fill="#7d8794" opacity="0.55"/>`;
      }
    }
  }
  return {
    size: [W, H],
    svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><radialGradient id="cell" cx="0.42" cy="0.38" r="0.8"><stop offset="0" stop-color="#1a2944"/><stop offset="1" stop-color="#0c1424"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="#d9dde0"/>
  ${cells}
</svg>`,
  };
}

/** The 3000 W power station's colour LCD: input on the left, charge in the middle, output on the right. */
function stationScreen(lit) {
  const W = 1040;
  const H = 496;
  const t = (x, y, s, size, fill, anchor = 'start', weight = 700) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${s}</text>`;
  const dim = lit ? 1 : 0.55;
  const ink = lit ? '#f4f7f6' : '#9aa19e';
  let ticks = '';
  for (let i = 0; i < 28; i++) {
    const c = i < 9 ? '#ffb21f' : i < 19 ? '#3fe08c' : '#49c6ff';
    ticks += `<rect x="${60 + i * 33}" y="34" width="20" height="14" rx="3" fill="${c}" opacity="${dim}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${lit ? '#000' : '#050606'}"/>
  ${ticks}
  <g opacity="${dim}">
    <rect x="70" y="120" width="70" height="40" rx="6" stroke="#49c6ff" stroke-width="6" fill="none"/><rect x="140" y="132" width="8" height="16" fill="#49c6ff"/>
    ${t(170, 160, '312', 64, ink)}${t(300, 160, 'W', 34, ink)}
    ${t(70, 240, 'INPUT', 28, '#8fa19a', 'start', 600)}
    <circle cx="520" cy="250" r="128" stroke="#1b2a26" stroke-width="22" fill="none"/>
    <path d="M520 122a128 128 0 1 1 -108.8 195.5" stroke="url(#arc)" stroke-width="22" fill="none" stroke-linecap="round"/>
    <defs><linearGradient id="arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fe08c"/><stop offset="1" stop-color="#49c6ff"/></linearGradient></defs>
    ${t(520, 275, '86%', 76, ink, 'middle')}
    <path d="M884 112v34m22-34v34M872 146h46v18a23 23 0 0 1-46 0z" stroke="#3fe08c" stroke-width="6" fill="none"/>
    ${t(800, 240, '180', 64, ink, 'end')}${t(812, 240, 'W', 34, ink)}
    ${t(970, 300, 'OUTPUT', 28, '#8fa19a', 'end', 600)}
    ${t(70, 440, 'AC ON', 30, '#3fe08c', 'start', 700)}${t(970, 440, '4.2 h', 30, ink, 'end', 600)}
  </g>
</svg>`;
}

/** The power station's front plate: brushed light grey, its small ports printed (the outlets and screen are parts). */
function stationPlate() {
  const W = 1024;
  const H = 540;
  const usb = (x, c) => (c ? `<rect x="${x}" y="300" width="40" height="18" rx="8" fill="#1a1d1f"/>` : `<rect x="${x}" y="296" width="44" height="24" rx="3" fill="#1a1d1f"/><rect x="${x + 6}" y="302" width="32" height="8" fill="#2e7de0"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="brush" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd3d6"/><stop offset="1" stop-color="#b9bec2"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#brush)"/>
  <rect x="150" y="70" width="70" height="40" rx="6" fill="#e9a23b"/><circle cx="173" cy="90" r="9" fill="#5a3a0e"/><circle cx="198" cy="90" r="9" fill="#5a3a0e"/>
  <circle cx="185" cy="170" r="22" fill="#1a1d1f"/><circle cx="185" cy="170" r="7" fill="#6a6f72"/>
  <circle cx="165" cy="232" r="11" fill="#1a1d1f"/><circle cx="205" cy="232" r="11" fill="#1a1d1f"/>
  ${usb(330, true)}${usb(390, true)}${usb(470, false)}${usb(530, false)}${usb(590, false)}${usb(650, false)}
</svg>`;
}

/** One US (type B) outlet face: two slots and a round earth, in a dark square. */
function outletFace() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#24282a"/>
  <rect x="36" y="36" width="184" height="184" rx="26" fill="#2f3436"/>
  <rect x="82" y="78" width="16" height="56" rx="4" fill="#060707"/><rect x="158" y="78" width="16" height="46" rx="4" fill="#060707"/>
  <path d="M112 176a16 16 0 0 1 32 0v14h-32z" fill="#060707"/>
</svg>`;
}

/** The indoor unit's small display: the set temperature and a snowflake, white on dark glass. */
function acDisplay(lit) {
  const ink = lit ? '#eaf6ff' : '#4c5458';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128" viewBox="0 0 256 128">
  <rect width="256" height="128" fill="${lit ? '#000' : '#0b0d0e'}"/>
  <text x="128" y="94" fill="${ink}" font-family="Segoe UI, Arial, sans-serif" font-size="78" font-weight="300" text-anchor="middle">24</text>
  <g stroke="${ink}" stroke-width="4" stroke-linecap="round"><path d="M214 38v32M200 46l28 16M200 62l28-16"/></g>
</svg>`;
}

const panel = cellsFace({ cols: 6, rows: 10, w: 0.968, h: 1.618, ppm: 1266 });
const mini = cellsFace({ cols: 6, rows: 4, w: 0.43, h: 0.28, ppm: 2400, margin: 0.008, bars: 5 });

const FACES = [
  { name: 'inverter', draw: inverterFace, size: [1024, 964], lit: true },
  { name: 'panel-cells', draw: panel.svg, size: panel.size },
  { name: 'mini-cells', draw: mini.svg, size: mini.size },
  { name: 'station-screen', draw: stationScreen, size: [1040, 496], lit: true },
  { name: 'station-plate', draw: stationPlate, size: [1024, 540] },
  { name: 'outlet', draw: outletFace, size: [256, 256] },
  { name: 'ac-display', draw: acDisplay, size: [256, 128], lit: true },
];

await mkdir(out, { recursive: true });
for (const { name, draw, size, lit } of FACES) {
  for (const glow of lit ? [false, true] : [false]) {
    const file = join(out, `${name}-${glow ? 'emit' : 'base'}.png`);
    await sharp(Buffer.from(draw(glow)), { density: 96 }).resize(size[0], size[1]).png().toFile(file);
    console.log('wrote', file);
  }
}
