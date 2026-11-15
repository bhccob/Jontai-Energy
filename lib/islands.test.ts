import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FILES, ISLANDS, OTHERS, PRODUCTS, hasPicture, shownIn } from './islands.ts';
import { DETAILS } from './productPages.ts';
import { QUOTE_TOPICS } from './quote.ts';

const root = join(import.meta.dirname, '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'products.json'), 'utf8'));

test('six ranges, in the order the page walks them, with the anchors the footer and menu link to', () => {
  assert.deepEqual(
    ISLANDS.map((i) => i.id),
    ['solar', 'light', 'cooling', 'backup', 'security', 'upstairs'],
  );
});

test('every range has both pictures, a real panel to open and a real quote topic', () => {
  const panels = new Set([...Object.keys(data.panels), ...data.categories.map((c: { id: string }) => c.id)]);
  for (const it of ISLANDS) {
    for (const p of it.products) {
      if (hasPicture(p)) for (const w of p.files ?? FILES) assert.ok(existsSync(join(root, 'public', 'sky', `range-${p.image}-${w}.webp`)), `${p.image} ${w}`);
      assert.ok(QUOTE_TOPICS.some((t) => t.id === p.quote), `${p.name} → ${p.quote}`);
    }
    for (const a of it.actions ?? []) assert.ok(panels.has(a.panel), `${it.id} → ${a.panel}`);
    assert.ok(QUOTE_TOPICS.some((t) => t.id === it.quote), it.quote);
  }
});

test('the island copy keeps the store rules', () => {
  const text = JSON.stringify(ISLANDS);
  assert.doesNotMatch(text, /we install|installation services|our installers|\$|price/i);
  assert.match(ISLANDS.find((i) => i.id === 'cooling')!.note!, /does not install/);
  assert.equal(ISLANDS.find((i) => i.id === 'upstairs')!.note, 'Large-item delivery available. Ask us about furniture delivery.');
});


test('round 31: LED lighting by name, solar street lamps in it, solar fans under Cooling, both on the quote form', () => {
  const light = ISLANDS.find((i) => i.id === 'light')!;
  assert.equal(light.name, 'LED lighting');
  assert.match(light.line, /solar street lamps/);
  const led = data.categories.find((c: { id: string }) => c.id === 'led');
  assert.ok(led.range.some((r: { name: string }) => r.name === 'Solar street lamps'));
  const cooling = ISLANDS.find((i) => i.id === 'cooling')!;
  assert.ok(cooling.products.some((p) => p.name === 'Solar standing fans'));
  const range = data.categories.find((c: { id: string }) => c.id === 'cooling');
  assert.ok(range.range.some((r: { name: string }) => r.name === 'Solar fans'));
  for (const id of ['solar-fan', 'street-lamp']) {
    assert.ok(QUOTE_TOPICS.some((t) => t.id === id), id);
    assert.ok(existsSync(join(root, 'public', 'sky', `thumb-${id}-160.webp`)), `${id} chip picture`);
  }
});

test('round 36: the ranges show their products without islands, each picture published at two widths', () => {
  for (const p of ISLANDS.flatMap((i) => i.products).filter(hasPicture)) {
    const [small, large] = p.files ?? FILES;
    assert.ok(small < large, p.image);
    assert.ok(p.size[0] <= large, `${p.image}: the large picture is never upscaled`);
  }
});

test('round 38: no islands are left anywhere ("less game like"), and every quote chip picture is there', () => {
  assert.deepEqual(
    readdirSync(join(root, 'public', 'sky')).filter((f) => f.startsWith('island-')),
    [],
  );
  const chips = readFileSync(join(root, 'components', 'forms', 'ProductChips.tsx'), 'utf8');
  const pics = [...chips.matchAll(/'(\/sky\/[a-z-]+-160\.webp)'/g)].map((m) => m[1]);
  assert.ok(pics.length >= 9, `${pics.length} chip pictures`);
  for (const p of pics) assert.ok(existsSync(join(root, 'public', p)), p);
});

test('round 39: every range shows two to six products, solar street lamps and solar fans among them, worded as the catalogue words them', () => {
  for (const it of ISLANDS) assert.ok(it.products.length >= 2 && it.products.length <= 8, `${it.id}: ${it.products.length}`);
  const names = (id: string) => ISLANDS.find((i) => i.id === id)!.products.map((p) => p.name);
  assert.ok(names('light').includes('Solar street lamps'));
  assert.ok(names('cooling').includes('Solar standing fans'));
  assert.equal(ISLANDS.flatMap((i) => i.products).filter((p) => p.bulb).length, 1, 'one hanging bulb');
  // The names and lines the catalogue panels already use (so the translations already have them), except the furniture.
  const catalogue = new Set(data.categories.flatMap((c: { range?: { name: string; line: string }[] }) => (c.range ?? []).flatMap((r) => [r.name, r.line])));
  for (const p of ISLANDS.filter((i) => i.id !== 'upstairs').flatMap((i) => i.products).filter((p) => !['ceiling-lights', 'outdoor-cameras', 'indoor-cameras', 'solar-fans', 'solar-floor-fans', 'solar-fan-lights', 'solar-street-lamps', 'solar-wall-lamps'].includes(p.id))) {
    assert.ok(catalogue.has(p.name), p.name);
    assert.ok(catalogue.has(p.line), p.line);
  }
});

test('round 41: every product has its own page, with words of its own or its product panel, and LED lighting has ceiling lights and tubes', () => {
  const ids = PRODUCTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'one page per product');
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/, id);
  for (const p of PRODUCTS) {
    const d = DETAILS[p.id];
    assert.ok(d, `${p.id} has page words`);
    assert.ok(d.panel ? data.panels[d.panel] : d.intro && d.points && d.points.length >= 3, p.id);
    if (d.panel) assert.ok(data.panels[d.panel], `${p.id} → ${d.panel}`);
  }
  // No invented figures: the words of their own carry no prices, and no lumens or kelvin of their own.
  const own = JSON.stringify(Object.values(DETAILS).filter((d) => !d.panel));
  assert.doesNotMatch(own, /\$|Afl|price|lumen|\d+\s?K\b/i);
  const led = ISLANDS.find((i) => i.id === 'light')!.products.map((p) => p.id);
  assert.ok(led.includes('ceiling-lights') && led.includes('led-tubes'));
});

test('round 44: the range rows stay broad: no figures, no model names, no links to one product', () => {
  for (const it of ISLANDS) {
    assert.equal(it.facts, undefined, it.id);
    assert.doesNotMatch(`${it.line} ${it.note ?? ''}`, /Namkoo|ACDC|SPI-|\d[\d,]* ?(W|Wh|BTU|ms)\b/, it.id);
    for (const a of it.actions ?? []) assert.ok(!['inverter', 'solar-ac', 'power-station', 'generator'].includes(a.panel), `${it.id} → ${a.panel}`);
  }
});

test('round 46: the Solar range shows every solar product too, each still with one home range and one page', () => {
  const solar = ISLANDS.find((i) => i.id === 'solar')!;
  const shown = shownIn(solar).map((p) => p.id);
  const solarElsewhere = ISLANDS.filter((i) => i.id !== 'solar')
    .flatMap((i) => i.products)
    .filter((p) => /solar/i.test(p.name));
  assert.ok(solarElsewhere.length >= 4, `${solarElsewhere.length} solar products elsewhere`);
  for (const p of solarElsewhere) assert.ok(shown.includes(p.id), p.id);
  assert.equal(new Set(shown).size, shown.length, 'nothing shown twice in Solar');
  assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length, 'one page per product');
  assert.equal(PRODUCTS.find((p) => p.id === 'solar-fans')!.range.id, 'cooling', 'a solar fan still belongs to Cooling');
});

test('round 51: street lamps on a pole or a wall, more fans, a camera that turns, and an Others list with no pictures', () => {
  const words = (id: string) => JSON.stringify(DETAILS[id]);
  // Round 53: each kind of lamp and fan is now its own product, with its own picture and page.
  assert.equal(PRODUCTS.find((p) => p.id === 'solar-street-lamps')!.image, 'pole-lamp');
  assert.equal(PRODUCTS.find((p) => p.id === 'solar-wall-lamps')!.range.id, 'light');
  assert.deepEqual(
    ISLANDS.find((i) => i.id === 'cooling')!.products.filter((p) => p.quote === 'solar-fan').map((p) => p.name),
    ['Solar standing fans', 'Solar floor fans', 'Solar fan lights'],
  );
  assert.match(words('outdoor-cameras'), /turns/);
  assert.match(words('outdoor-cameras'), /SD card/);
  const security = ISLANDS.find((i) => i.id === 'security')!;
  assert.match(security.line, /plug-in ones for inside/);
  assert.match(security.line, /SD cards/);
  assert.ok(!PRODUCTS.some((p) => p.id === 'site-cameras' || p.id === 'home-cameras'), 'the old camera pages are gone');
  // The bulb is one still picture: no colour switch and none of its light layers.
  assert.ok(!existsSync(join(root, 'components', 'home', 'LampSwitch.tsx')));
  assert.equal(readdirSync(join(root, 'public', 'sky')).filter((f) => /^range-light-(warm|clear|halo)/.test(f)).length, 0);
  assert.doesNotMatch(ISLANDS.find((i) => i.id === 'light')!.line, /colour/);
  // Others: words only.
  assert.deepEqual(
    OTHERS.map((o) => o.name),
    ['SD cards', 'Small solar lights', 'Solar doorbells', 'WiFi mesh'],
  );
  assert.match(OTHERS[0].line, /16 GB to 256 GB/);
  for (const o of OTHERS) assert.deepEqual(Object.keys(o).sort(), ['line', 'name'], o.name);
});

test('round 51: every product word on the home page and the product pages is in both dictionaries', () => {
  const es = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'es.json'), 'utf8')).strings;
  const zh = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'zh.json'), 'utf8')).strings;
  const all = [
    ...ISLANDS.flatMap((i) => [i.name, i.line, i.note ?? '']),
    ...PRODUCTS.flatMap((p) => [p.name, p.line]),
    ...OTHERS.flatMap((o) => [o.name, o.line]),
    ...Object.values(DETAILS).flatMap((d) => [d.title ?? '', d.model ?? '', d.intro ?? '', ...(d.points ?? []).flatMap((p) => [p.title, p.line])]),
  ].filter(Boolean);
  for (const w of all) {
    assert.ok(w in es, `es: ${w}`);
    assert.ok(w in zh, `zh: ${w}`);
  }
});

test('round 52: an indoor camera that plugs into a socket, under Security only, with its own page', () => {
  const indoor = PRODUCTS.find((p) => p.id === 'indoor-cameras')!;
  assert.equal(indoor.range.id, 'security');
  assert.equal(indoor.image, 'camera-indoor', 'its picture (round 53)');
  assert.match(indoor.line, /socket/);
  assert.match(JSON.stringify(DETAILS['indoor-cameras']), /Runs on electricity/);
  assert.match(JSON.stringify(DETAILS['indoor-cameras']), /SD card/);
  assert.ok(!shownIn(ISLANDS.find((i) => i.id === 'solar')!).some((p) => p.id === 'indoor-cameras'), 'not solar');
  assert.equal(QUOTE_TOPICS.find((q) => q.id === 'cameras')!.label, 'Security camera');
  // Round 53: every product has its picture now.
  assert.deepEqual(PRODUCTS.filter((p) => !hasPicture(p)).map((p) => p.id), []);
});

test('round 53: the five new pictures are published, the pole lamp rises from its frame, and the old camera picture is gone', () => {
  for (const name of ['pole-lamp', 'floor-fan', 'fan-light', 'camera-outdoor', 'camera-indoor']) {
    for (const w of FILES) assert.ok(existsSync(join(root, 'public', 'sky', `range-${name}-${w}.webp`)), `${name} ${w}`);
    assert.ok(PRODUCTS.some((p) => p.image === name), `${name} is shown`);
  }
  assert.deepEqual(PRODUCTS.filter((p) => p.rise).map((p) => p.id), ['solar-street-lamps']);
  assert.ok(!existsSync(join(root, 'public', 'sky', 'range-security-1200.webp')));
  assert.equal(PRODUCTS.find((p) => p.id === 'outdoor-cameras')!.image, 'camera-outdoor');
});
