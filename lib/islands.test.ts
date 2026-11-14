import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FILES, ISLANDS, PRODUCTS } from './islands.ts';
import { DETAILS } from './productPages.ts';
import { QUOTE_TOPICS } from './quote.ts';

const root = join(import.meta.dirname, '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'products.json'), 'utf8'));

test('six ranges, in the order the page walks them, with the anchors the footer and menu link to', () => {
  assert.deepEqual(
    ISLANDS.map((i) => i.id),
    ['solar', 'cooling', 'backup', 'light', 'security', 'upstairs'],
  );
});

test('every range has both pictures, a real panel to open and a real quote topic', () => {
  const panels = new Set([...Object.keys(data.panels), ...data.categories.map((c: { id: string }) => c.id)]);
  for (const it of ISLANDS) {
    for (const p of it.products) {
      for (const w of p.files ?? FILES) assert.ok(existsSync(join(root, 'public', 'sky', `range-${p.image}-${w}.webp`)), `${p.image} ${w}`);
      assert.ok(QUOTE_TOPICS.some((t) => t.id === p.quote), `${p.name} → ${p.quote}`);
    }
    for (const a of it.actions) assert.ok(panels.has(a.panel), `${it.id} → ${a.panel}`);
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
  assert.ok(cooling.actions.some((a) => a.panel === 'cooling' && /solar fans/.test(a.label)));
  const range = data.categories.find((c: { id: string }) => c.id === 'cooling');
  assert.ok(range.range.some((r: { name: string }) => r.name === 'Solar fans'));
  for (const id of ['solar-fan', 'street-lamp']) {
    assert.ok(QUOTE_TOPICS.some((t) => t.id === id), id);
    assert.ok(existsSync(join(root, 'public', 'sky', `thumb-${id}-160.webp`)), `${id} chip picture`);
  }
});

test('round 36: the ranges show their products without islands, and the bulb keeps both light colours', () => {
  for (const p of ISLANDS.flatMap((i) => i.products)) {
    const [small, large] = p.files ?? FILES;
    assert.ok(small < large, p.image);
    assert.ok(p.size[0] <= large, `${p.image}: the large picture is never upscaled`);
  }
  const bulb = ISLANDS.find((i) => i.id === 'light')!.products.find((p) => p.bulb)!;
  for (const name of ['warm', 'clear', 'halo']) {
    for (const w of bulb.files ?? FILES) assert.ok(existsSync(join(root, 'public', 'sky', `range-light-${name}-${w}.webp`)), `${name} ${w}`);
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
  for (const it of ISLANDS) assert.ok(it.products.length >= 2 && it.products.length <= 6, `${it.id}: ${it.products.length}`);
  const names = (id: string) => ISLANDS.find((i) => i.id === id)!.products.map((p) => p.name);
  assert.ok(names('light').includes('Solar street lamps'));
  assert.ok(names('cooling').includes('Solar fans'));
  assert.equal(ISLANDS.flatMap((i) => i.products).filter((p) => p.bulb).length, 1, 'one bulb that lights up');
  // The names and lines the catalogue panels already use (so the translations already have them), except the furniture.
  const catalogue = new Set(data.categories.flatMap((c: { range?: { name: string; line: string }[] }) => (c.range ?? []).flatMap((r) => [r.name, r.line])));
  for (const p of ISLANDS.filter((i) => i.id !== 'upstairs').flatMap((i) => i.products).filter((p) => p.id !== 'ceiling-lights')) {
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
