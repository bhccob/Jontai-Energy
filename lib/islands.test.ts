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

// WCAG relative luminance of a #rrggbb colour.
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

test('every moment of the day keeps its words readable (4.5:1 for the ink the walk uses on it)', () => {
  for (const { id, day } of ISLANDS) {
    const ink = day.ink === 'dark' ? '#173d2c' : '#f7f5ec';
    assert.ok(contrast(ink, day.bg) >= 4.5, `${id}: ${contrast(ink, day.bg).toFixed(2)}`);
  }
});

test('the day runs from morning to the weekend, labelled once each', () => {
  assert.deepEqual(ISLANDS.map((i) => i.day.label), ['Morning', 'Midday', 'Evening', 'After dark', 'Night', 'Weekend']);
});
