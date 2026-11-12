import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ISLANDS } from './islands.ts';
import { QUOTE_TOPICS } from './quote.ts';

const root = join(import.meta.dirname, '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'products.json'), 'utf8'));

test('six ranges, in the order the page walks them, with the anchors the footer and menu link to', () => {
  assert.deepEqual(
    ISLANDS.map((i) => i.id),
    ['solar', 'cooling', 'backup', 'light', 'security', 'upstairs'],
  );
});

test('every island has both pictures, a real panel to open and a real quote topic', () => {
  const panels = new Set([...Object.keys(data.panels), ...data.categories.map((c: { id: string }) => c.id)]);
  for (const it of ISLANDS) {
    for (const w of [700, 1200]) assert.ok(existsSync(join(root, 'public', 'sky', `island-${it.image}-${w}.webp`)), `${it.id} ${w}`);
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
