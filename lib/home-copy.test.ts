import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { QUOTE_TOPICS } from './quote.ts';

// Read the data file directly: Node cannot resolve the '@/' alias lib/products.ts imports it through.
const data = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'data', 'products.json'), 'utf8'));
const home = data.home;

test('the home page has the five chapters in order', () => {
  assert.deepEqual(home.chapters.map((c: { id: string }) => c.id), ['solar', 'cooling', 'backup', 'light', 'upstairs']);
  assert.deepEqual(home.chapters.map((c: { number: string }) => c.number), ['01', '02', '03', '04', '05']);
});

test('every chapter action opens a panel that exists', () => {
  const panels = new Set([...Object.keys(data.panels), ...data.categories.map((c: { id: string }) => c.id)]);
  for (const c of home.chapters) for (const a of c.actions) assert.ok(panels.has(a.panel), `${c.id} → ${a.panel}`);
});

test('every chapter asks for a real quote topic and shows a real render', () => {
  for (const c of home.chapters) {
    assert.ok(QUOTE_TOPICS.some((t) => t.id === c.quote), c.quote);
    assert.ok(existsSync(join(import.meta.dirname, '..', 'public', c.image)), c.image);
  }
});

test('the lighting copy names LED strips', () => {
  const led = data.categories.find((c: { id: string }) => c.id === 'led');
  assert.match(home.chapters[3].lead, /LED strips/);
  assert.match(led.blurb, /LED strips/);
  assert.ok(led.range.some((r: { name: string }) => r.name === 'LED strips'));
  assert.ok(led.carries.some((c: string) => /LED strips/.test(c)));
});

test('every picture in a product range exists', () => {
  for (const c of data.categories) for (const r of c.range) assert.ok(existsSync(join(import.meta.dirname, '..', 'public', r.image)), r.image);
});

test('the statement never says the same sentence twice', () => {
  const { soft, points } = home.statement;
  for (const p of points) assert.ok(!soft.toLowerCase().includes(p.text.toLowerCase().replace(/\.$/, '')), p.label);
});
test('the family-owned point leads the statement, and no team page is promised yet', () => {
  assert.equal(home.statement.points[0].label, 'Family-owned');
  assert.equal(home.statement.points[0].team, undefined);
  assert.ok(!home.statement.points.some((p: { label: string }) => p.label === 'Rewards'));
});

test('the first view says what the store sells, that it is family-owned and where it is', () => {
  const { hero } = home;
  assert.equal(hero.title, 'Aruba sunlight, made useful.');
  for (const range of ['Solar', 'backup power', 'lighting', 'cooling', 'security', 'furniture']) assert.match(hero.lead, new RegExp(range, 'i'));
  assert.match(hero.lead, /family-owned/);
  assert.match(hero.lead, /Cumana 73, Oranjestad/);
  assert.equal(hero.aside, undefined);
  assert.match(hero.note, /not specific stock/);
});

test('the film copy is gone', () => {
  assert.equal(data.film, undefined);
});

test('the copy keeps the store rules', () => {
  const text = JSON.stringify(home);
  assert.doesNotMatch(text, /we install|installation services|our installers/i);
  assert.doesNotMatch(text, /\$|AWG/);
  assert.equal(home.chapters[4].pull, 'Large-item delivery available. Ask us about furniture delivery.');
});
