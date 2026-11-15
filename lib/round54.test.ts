import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ISLANDS, OTHERS, PRODUCTS, hasPicture, shownIn } from './islands.ts';
import { WHEEL_PICKS, WHEEL_TINT, heldPosition, nameParts, rangeHref, rangeIndexFromHash, restProgress } from './wheel.ts';
import { CATALOG_FILTERS, catalogProducts, filterFromParam, rangeNote } from './catalog.ts';
import { REWARDS_FACT, hoursFact } from './firstView.ts';
import { openState } from './store.ts';
import * as copy from './homeCopy.ts';

const root = join(import.meta.dirname, '..');
const solar = ISLANDS.find((i) => i.id === 'solar')!;

test('round 54 wheel: it rests on each range, then turns to the next', () => {
  assert.equal(heldPosition(0, 6), 0);
  assert.equal(heldPosition(1, 6), 5);
  for (let k = 0; k < 6; k++) assert.equal(heldPosition(restProgress(k, 6), 6), k, `rests on ${k}`);
  assert.equal(heldPosition(0.75 / 6, 6), 0.5, 'halfway through the first turn');
  assert.equal(heldPosition(5.5 / 6, 6), 5, 'the last range holds');
  let last = -1;
  for (let i = 0; i <= 1000; i++) {
    const p = heldPosition(i / 1000, 6);
    assert.ok(p >= last, `never turns back at ${i / 1000}`);
    last = p;
  }
});

test('round 54 wheel: one pictured product of its own for every range, a tint for each, and a link to its products', () => {
  for (const r of ISLANDS) {
    const pick = PRODUCTS.find((p) => p.id === WHEEL_PICKS[r.id]);
    assert.ok(pick, `${r.id} has a pick`);
    assert.equal(pick!.range.id, r.id, `${r.id}: the pick is its own product`);
    assert.ok(hasPicture(pick!), `${r.id}: the pick has a picture`);
    assert.equal(WHEEL_TINT[r.id]?.length, 3, `${r.id} has a tint`);
  }
  assert.equal(rangeHref('light'), '/products?range=light');
});

test('round 54 wheel: a name is a light word and a bold word, and both are translated where the wheel shows them', () => {
  assert.deepEqual(nameParts('Backup power'), ['Backup', 'power']);
  assert.deepEqual(nameParts('LED lighting'), ['LED', 'lighting']);
  assert.deepEqual(nameParts('Solar'), ['', 'Solar']);
  const es = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'es.json'), 'utf8')).strings;
  const zh = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'zh.json'), 'utf8')).strings;
  for (const r of ISLANDS) {
    const [light, bold] = nameParts(r.name);
    if (!light) continue;
    for (const w of [light, bold]) {
      assert.ok(`wheel|${w}` in es, `es wheel|${w}`);
      assert.ok(`wheel|${w}` in zh, `zh wheel|${w}`);
    }
  }
});

test('round 54 wheel: a link to a range, from this page or another, names which range to rest on', () => {
  const ids = ISLANDS.map((i) => i.id);
  assert.equal(rangeIndexFromHash('#light', ids), 3);
  assert.equal(rangeIndexFromHash('#solar', ids), 0);
  assert.equal(rangeIndexFromHash('#delivery', ids), ids.indexOf('upstairs'));
  assert.equal(rangeIndexFromHash('#products', ids), -1);
  assert.equal(rangeIndexFromHash('', ids), -1);
  assert.equal(rangeIndexFromHash('#', ids), -1);
});

test('round 54 catalogue: a range from the address, or All for anything else', () => {
  assert.equal(filterFromParam('light'), 'light');
  assert.equal(filterFromParam('others'), 'others');
  assert.equal(filterFromParam('nope'), 'all');
  assert.equal(filterFromParam(''), 'all');
  assert.equal(filterFromParam(undefined), 'all');
  assert.equal(filterFromParam(null), 'all');
  assert.equal(filterFromParam(['cooling', 'solar']), 'cooling');
});

test('round 54 catalogue: filters in order with their counts', () => {
  assert.deepEqual(
    CATALOG_FILTERS.map((f) => f.id),
    ['all', 'solar', 'cooling', 'backup', 'light', 'security', 'upstairs', 'others'],
  );
  const count = (id: string) => CATALOG_FILTERS.find((f) => f.id === id)!.count;
  assert.equal(count('all'), PRODUCTS.length);
  assert.equal(count('solar'), shownIn(solar).length);
  assert.equal(count('others'), OTHERS.length);
  assert.equal(CATALOG_FILTERS[1].label, solar.name);
});

test('round 54 catalogue: products by range and by name, Solar showing every solar product', () => {
  assert.deepEqual(catalogProducts('others', ''), []);
  assert.deepEqual(
    catalogProducts('solar', '').map((p) => p.id),
    shownIn(solar).map((p) => p.id),
  );
  const fans = catalogProducts('all', '  FAN ');
  assert.equal(fans.length, 3);
  for (const p of fans) assert.match(p.name, /fan/i);
  assert.equal(catalogProducts('all', '').length, PRODUCTS.length);
  assert.match(rangeNote('cooling') ?? '', /does not install/);
  assert.equal(rangeNote('all'), null);
  assert.equal(rangeNote('others'), null);
});

test('round 54 first view: the hours fact puts what matters first', () => {
  assert.deepEqual(hoursFact('Open now, until 7:00 PM'), { strong: 'Open now', rest: ', until 7:00 PM' });
  assert.deepEqual(hoursFact('Closed now, opens tomorrow at 9:00 AM'), { strong: 'Closed now', rest: ', opens tomorrow at 9:00 AM' });
  assert.deepEqual(hoursFact('Open every day'), { strong: 'Open every day', rest: '' });
  assert.deepEqual(REWARDS_FACT, { strong: 'Afl. 25 back', rest: 'for every Afl. 500' });
});

test('round 54 first view: every hours line splits into parts the dictionaries know', () => {
  const lines = [openState(2, 10).line, openState(2, 7).line, openState(2, 20).line, openState(0, 15).line];
  const asPattern = (rest: string) => rest.replace(/\d{1,2}:\d{2} [AP]M/, '{0}');
  for (const line of lines) {
    const { strong, rest } = hoursFact(line);
    assert.ok([copy.HOURS_COPY.open, copy.HOURS_COPY.closed].includes(strong), `${line}: ${strong}`);
    assert.ok([copy.HOURS_COPY.until, copy.HOURS_COPY.opensAt, copy.HOURS_COPY.opensTomorrow].includes(asPattern(rest)), `${line}: ${rest}`);
  }
});

test('round 54 sentence:the fragments read as the agreed sentence, with six promises in bold', () => {
  assert.equal(
    copy.solutionText(),
    "At Jontai, your home makes its own power, so the island's blackouts do not stop your day. We fix what we sell, even years later. Our prices are hard to beat, for the same quality or better. We sell far more than solar. Every customer matters, long after the sale. And our family keeps learning, to bring tomorrow's ideas home.",
  );
  assert.equal(copy.SOLUTION.filter((f) => f.key).length, 6);
  assert.equal(copy.SOLUTION_POINTS.length, 6);
});

test('round 54: every new word is in both dictionaries', () => {
  const es = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'es.json'), 'utf8'));
  const zh = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'zh.json'), 'utf8'));
  const words: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') words.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  for (const [name, v] of Object.entries(copy)) if (typeof v !== 'function') walk(v);
  walk(REWARDS_FACT);
  assert.ok(words.length > 40, `found ${words.length} strings in ${Object.keys(copy).join(', ')}`);
  const pattern = (d: { patterns: Record<string, string> }, w: string) => Object.hasOwn(d.patterns, w);
  for (const w of new Set(words)) {
    if (w.includes('{0}')) {
      assert.ok(pattern(es, w), `es pattern: ${w}`);
      assert.ok(pattern(zh, w), `zh pattern: ${w}`);
    } else {
      assert.ok(w.trim() in es.strings, `es: ${w}`);
      assert.ok(w.trim() in zh.strings, `zh: ${w}`);
    }
  }
});

test('round 54 sentence: each Spanish fragment fills every English word slot, so no gap is left between words', () => {
  // The translator shares a translated fragment out over the English fragment's word slots (components/ui/Split): a
  // translation with fewer words than slots leaves empty slots, which show as double spaces.
  const es = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'es.json'), 'utf8')).strings;
  const words = (t: string) => t.trim().split(/\s+/).length;
  for (const f of copy.SOLUTION) assert.ok(words(es[f.text.trim()]) >= words(f.text), `${f.text} -> ${es[f.text.trim()]}`);
});

test('round 54: the whole pole lamp is published for the All products page', () => {
  const lamp = PRODUCTS.find((p) => p.id === 'solar-street-lamps')!;
  assert.equal(lamp.whole?.image, 'pole-lamp-full');
  assert.deepEqual(lamp.whole?.files, [200, 400]);
  assert.deepEqual(lamp.whole?.size, [400, 1408]);
  for (const w of lamp.whole!.files) assert.ok(existsSync(join(root, 'public', 'sky', `range-pole-lamp-full-${w}.webp`)), `${w}`);
});
