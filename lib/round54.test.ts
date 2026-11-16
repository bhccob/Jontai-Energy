import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ISLANDS, OTHERS, PRODUCTS, hasPicture, shownIn } from './islands.ts';
import { WHEEL_REST, heldPosition, nameParts, rangeHref, settleOn, rangeIndexFromHash, restProgress, wheelItems } from './wheel.ts';
import { CATALOG_FILTERS, DETAILED_RANGES, catalogProducts, filterFromParam, itemFromParam, neighbours, rangeActions, rangeNote, shortInfo } from './catalog.ts';
import { DETAILS } from './productPages.ts';
import { REWARDS_FACT, hoursFact } from './firstView.ts';
import { openState } from './store.ts';
import * as copy from './homeCopy.ts';
import { DEAL_MEDIA, STACK_MEDIA, cardCount, cardNumber, cardTone, slideShape, stackTilt } from './solutionDeck.ts';
import { makeTranslator } from './i18n/translate.ts';
import { menuLinks } from './menu.ts';
import { DIRECTIONS_URL } from './contact.ts';

const root = join(import.meta.dirname, '..');
const solar = ISLANDS.find((i) => i.id === 'solar')!;

test('round 54 wheel: it rests on each range, then turns to the next', () => {
  assert.equal(heldPosition(0, 6), 0);
  assert.equal(heldPosition(1, 6), 5);
  for (let k = 0; k < 6; k++) assert.equal(heldPosition(restProgress(k, 6), 6), k, `rests on ${k}`);
  // Bob: "better scrolling feel": a short rest on each name and a longer, gentler turn, instead of half and half.
  assert.ok(WHEEL_REST > 0 && WHEEL_REST <= 0.3, 'the rest is the shorter part of each stretch');
  assert.ok(Math.abs(heldPosition((WHEEL_REST + (1 - WHEEL_REST) / 2) / 6, 6) - 0.5) < 1e-9, 'halfway through the first turn');
  assert.equal(heldPosition(5.5 / 6, 6), 5, 'the last range holds');
  let last = -1;
  for (let i = 0; i <= 1000; i++) {
    const p = heldPosition(i / 1000, 6);
    assert.ok(p >= last, `never turns back at ${i / 1000}`);
    last = p;
  }
});

test('round 54 wheel: stopped between two names, it clicks on to the next one the way it was going; resting, it stays', () => {
  const n = 7;
  const at = (k: number, part: number) => (k + part) / n;
  // Resting on a name, or before the first and after the last: nothing to settle.
  for (let k = 0; k < n; k++) for (const dir of [-1, 0, 1]) assert.equal(settleOn(restProgress(k, n), n, dir), -1, `rests on ${k}`);
  assert.equal(settleOn(0, n, 1), -1);
  assert.equal(settleOn(-0.1, n, 1), -1, 'above the wheel');
  assert.equal(settleOn(1.2, n, -1), -1, 'below the wheel');
  assert.equal(settleOn(at(n - 1, 0.6), n, 1), -1, 'the last name only rests');
  // Mid-turn: one mouse-wheel notch down from a name goes on to the next one, up goes back; still, the nearer one.
  const turnAt = (k: number, t: number) => at(k, WHEEL_REST + (1 - WHEEL_REST) * t);
  assert.equal(settleOn(turnAt(2, 0.15), n, 1), 3, 'a nudge down turns to the next');
  assert.equal(settleOn(turnAt(2, 0.85), n, -1), 2, 'a nudge up turns back');
  assert.equal(settleOn(turnAt(2, 0.2), n, 0), 2);
  assert.equal(settleOn(turnAt(2, 0.8), n, 0), 3);
  assert.equal(settleOn(turnAt(5, 0.5), n, 1), 6);
  assert.equal(settleOn(turnAt(0, 0.5), n, -1), 0);
});

test('round 54 wheel: the six ranges then Others, by name, each saying plainly where it leads', () => {
  // Bob: "maybe six ranges products should not include the image? and include others".
  const items = wheelItems();
  assert.deepEqual(
    items.map((i) => i.id),
    [...ISLANDS.map((r) => r.id), 'others'],
  );
  const solarItem = items[0];
  assert.equal(solarItem.count, shownIn(solar).length);
  // Bob: "the bottom bar just have to say see .... products".
  assert.equal(solarItem.label, 'See all Solar products');
  // Bob: "the order should also matter so solar first then led lighting".
  assert.deepEqual(items.slice(0, 2).map((i) => i.id), ['solar', 'light']);
  assert.equal(solarItem.href, '/products?range=solar');
  const others = items.at(-1)!;
  assert.equal(others.name, 'Others');
  assert.equal(others.count, OTHERS.length);
  assert.equal(others.href, '/products?range=others');
  assert.equal(others.label, 'See all other products');
  assert.equal(rangeHref('light'), '/products?range=light');
  assert.equal(rangeIndexFromHash('#others', items.map((i) => i.id)), items.length - 1);
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
  assert.equal(rangeIndexFromHash('#light', ids), 1);
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
    ['all', 'solar', 'light', 'cooling', 'backup', 'security', 'upstairs', 'others'],
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
  // How delivery works opens from Furniture's products (it left the wheel's foot).
  assert.deepEqual(rangeActions('upstairs'), [{ label: 'How delivery works', panel: 'furniture' }]);
  assert.deepEqual(rangeActions('all'), []);
  assert.deepEqual(rangeActions('others'), []);
  assert.equal(rangeNote('all'), null);
  assert.equal(rangeNote('others'), null);
});

// Bob: "i want them to not be like a site that you can shop but only to view ... where they can click and see short info
// of the products". A product opens its short info over the page; the address keeps which one (?item=), so Back closes it.
test('round 54 catalogue: a product opens its short info from the address, and only a real one', () => {
  const ids = PRODUCTS.map((p) => p.id);
  assert.equal(itemFromParam('solar-panels', ids), 'solar-panels');
  assert.equal(itemFromParam(['sofas', 'bulbs'], ids), 'sofas');
  assert.equal(itemFromParam('nope', ids), null);
  assert.equal(itemFromParam('', ids), null);
  assert.equal(itemFromParam(null, ids), null);
  assert.equal(itemFromParam(undefined, ids), null);
});

test('round 54 catalogue: the short info steps to the product before and after, in the order the page shows them', () => {
  const ids = ['a', 'b', 'c'];
  assert.deepEqual(neighbours(ids, 'a'), { prev: null, next: 'b', at: 1, of: 3 });
  assert.deepEqual(neighbours(ids, 'b'), { prev: 'a', next: 'c', at: 2, of: 3 });
  assert.deepEqual(neighbours(ids, 'c'), { prev: 'b', next: null, at: 3, of: 3 });
  assert.deepEqual(neighbours(ids, 'z'), { prev: null, next: null, at: 0, of: 3 });
  assert.deepEqual(neighbours(['a'], 'a'), { prev: null, next: null, at: 1, of: 1 });
});

test('round 54 catalogue: in Cooling and Backup power the short info keeps its detail, at most three points and four figures', () => {
  // Bob: "cooling and backup power is fine".
  const points = Array.from({ length: 5 }, (_, i) => ({ title: `Point ${i}`, line: `Line ${i}.` }));
  const figures = Array.from({ length: 6 }, (_, i) => ({ label: `Figure ${i}`, value: `${i} kW` }));
  const product = { id: 'x', name: 'X coolers', range: { id: 'cooling', name: 'Cooling' } };
  assert.deepEqual(shortInfo({ product, title: 'X coolers for porches', model: 'XC-1', intro: 'What it is.', summary: 'X coolers, in short.', figures, points }), {
    id: 'x',
    range: 'Cooling',
    title: 'X coolers for porches',
    model: 'XC-1',
    intro: 'What it is.',
    figures: figures.slice(0, 4),
    points: points.slice(0, 3),
  });
  assert.deepEqual(shortInfo({ product: { ...product, range: { id: 'backup', name: 'Backup power' } }, title: 'X', intro: 'What it is.', points: [] }), {
    id: 'x',
    range: 'Backup power',
    title: 'X',
    model: null,
    intro: 'What it is.',
    figures: [],
    points: [],
  });
});

// Bob: "inside the dedicated product page the descriptions should be like not go too much detailed into some products
// since its like a subcategory/subgenre". Elsewhere a product is a kind of product: one short line on what it is and
// what it is for, with no model, no figures and no feature points.
test('round 54 catalogue: in the other ranges the short info is one general line', () => {
  const product = { id: 'x', name: 'X lamps', range: { id: 'light', name: 'LED lighting' } };
  const page = { product, title: 'X lamps', model: 'XL-1', intro: 'A very particular lamp with a 12 W chip.', summary: 'Lamps of the X kind, for yards.', figures: [{ label: 'power', value: '12 W' }], points: [{ title: 'A', line: 'B.' }] };
  assert.deepEqual(shortInfo(page), { id: 'x', range: 'LED lighting', title: 'X lamps', model: null, intro: 'Lamps of the X kind, for yards.', figures: [], points: [] });
});

test('round 54 catalogue: every product outside Cooling and Backup power has its general line, short, with no figures, in all three languages', () => {
  const es = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'es.json'), 'utf8')).strings;
  const zh = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'zh.json'), 'utf8')).strings;
  for (const p of PRODUCTS) {
    if (DETAILED_RANGES.includes(p.range.id)) continue;
    const line = DETAILS[p.id]?.summary;
    assert.ok(line, `${p.id} has a general line`);
    assert.ok(line.length <= 130, `${p.id} is short (${line.length})`);
    assert.doesNotMatch(line, /\d/, `${p.id} has no figures`);
    assert.ok(line in es, `es: ${line}`);
    assert.ok(line in zh, `zh: ${line}`);
  }
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

// Bob picked C from three card directions for Our solution ("C is looking best but iwant more simple cards"): one line
// on top and six cards, each a promise and one plain line.
test('round 54 Our solution: one line, then six simple cards', () => {
  assert.equal(copy.solutionText(), 'Your home makes its own power. We stand behind it.');
  assert.equal(copy.SOLUTION.filter((f) => f.key).length, 1);
  // Set on two lines, the second starting at "We stand behind it." (the full stop ends the green phrase).
  assert.deepEqual(copy.SOLUTION.filter((f) => f.newLine).map((f) => f.text), ['We stand behind it.']);
  assert.deepEqual(
    copy.SOLUTION_CARDS.map((c) => c.title),
    ['Your own power', 'We fix what we sell', 'Prices hard to beat', 'More than solar', 'Every customer matters', 'Always learning'],
  );
  for (const c of copy.SOLUTION_CARDS) assert.ok(c.line.length <= 90 && c.line.endsWith('.'), `one short line: ${c.line}`);
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

// Each fragment's words are their own boxes, so a line can break between two fragments: a Chinese fragment that starts
// with its full stop ("。我们…") put that full stop alone at the start of a line. The full stop ends the fragment before.
test('round 54 Our solution: no Chinese fragment starts with punctuation, so none starts a line with it', () => {
  const zh = JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'zh.json'), 'utf8')).strings;
  for (const f of copy.SOLUTION) assert.doesNotMatch(zh[f.text.trim()], /^[，。、：；！？]/, `${f.text} -> ${zh[f.text.trim()]}`);
});

test('round 54 sentence: the spaces between fragments sit inside the fragments, so Chinese can drop them', () => {
  // A space in a node of its own is never translated, so in Chinese it would show between the characters.
  const pieces = copy.solutionPieces();
  assert.equal(pieces.map((p) => p.text).join(''), copy.solutionText());
  for (const p of pieces) assert.match(p.text, /\S/, 'no piece is only a space');
  pieces.slice(1).forEach((p, i) => {
    if (copy.spaceBefore(copy.SOLUTION[i + 1].text)) assert.ok(p.text.startsWith(' '), `"${p.text}" carries its space`);
  });
});

test('round 54: the whole pole lamp is published for the All products page', () => {
  const lamp = PRODUCTS.find((p) => p.id === 'solar-street-lamps')!;
  assert.equal(lamp.whole?.image, 'pole-lamp-full');
  assert.deepEqual(lamp.whole?.files, [200, 400]);
  assert.deepEqual(lamp.whole?.size, [400, 1408]);
  for (const w of lamp.whole!.files) assert.ok(existsSync(join(root, 'public', 'sky', `range-pole-lamp-full-${w}.webp`)), `${w}`);
});

// Bob: "the header to change language doesnt appear good". The header marks how it fits with data-fit (useHeaderFit), as
// the footer's fitted name does (FitText); the name's rule clipped the header too, cutting the language list off and
// scrolling the capsule's contents up when it opened. The rule is the fitted text's alone.
test('round 54 header: the fitted-text rule that clips its box never reaches the header', () => {
  const ui = readFileSync(join(root, 'app', 'styles', 'ui.css'), 'utf8');
  assert.doesNotMatch(ui, /(^|[\s,}])\[data-fit\]\s*[{,]/m, 'a bare [data-fit] rule also matches the header');
  assert.match(ui, /p\[data-fit\]\s*\{[^}]*overflow: hidden/);
});

// Spanish showed "Ver Solar products" and "Ver los LED productos de lighting" under the wheel: older, looser patterns
// ("See all {0}", "See all {0} {1} products") came first in the dictionary and won. The most fitting pattern wins now:
// the one with the fewest holes, then the most fixed words, wherever it sits in the dictionary.
test('round 54 translation: the most fitting pattern wins, not the first one listed', () => {
  const t = makeTranslator('es', {
    strings: { 'LED lighting': 'Iluminación LED' },
    patterns: { 'See all {0}': 'Ver {0}', 'See all {0} {1} products': 'Ver los {0} productos de {1}', 'See all {0} products': 'Ver todos los productos de {0}' },
  });
  assert.equal(t.text('See all Solar products'), 'Ver todos los productos de Solar');
  assert.equal(t.text('See all LED lighting products'), 'Ver todos los productos de Iluminación LED');
  assert.equal(t.text('See all reviews'), 'Ver reviews');
});

test('round 54 translation: every wheel link reads whole in Spanish and Chinese', () => {
  for (const lang of ['es', 'zh'] as const) {
    const dict = JSON.parse(readFileSync(join(root, 'lib', 'i18n', `${lang}.json`), 'utf8'));
    const t = makeTranslator(lang, dict);
    for (const item of wheelItems()) {
      const out = t.text(item.label) ?? '';
      assert.doesNotMatch(out, /products|See all/, `${lang}: ${item.label} -> ${out}`);
    }
  }
  const es = makeTranslator('es', JSON.parse(readFileSync(join(root, 'lib', 'i18n', 'es.json'), 'utf8')));
  assert.equal(es.text('See all LED lighting products'), 'Ver todos los productos de Iluminación LED');
});

// Bob, of the menu's eleven big capitals: "this is so cluttered". Four big links to the home page's places; the ranges
// and the ways to get help small beside them, in the wheel's order, each range straight to its products.
test('round 54 menu: four big places, then the ranges and help, small', () => {
  const home = menuLinks('');
  assert.deepEqual(home.main.map((l) => l.label), ['What we sell', 'Our solution', 'Rewards', 'Visit the store']);
  assert.deepEqual(home.main.map((l) => l.href), ['#products', '#solution', '#rewards', '#visit']);
  assert.deepEqual(menuLinks('/').main[0].href, '/#products', 'from another page, back to the home page');
  assert.deepEqual(home.ranges.map((l) => l.href), ['/products', ...ISLANDS.map((r) => `/products?range=${r.id}`)]);
  assert.deepEqual(home.ranges.slice(1, 3).map((l) => l.label), ['Solar', 'LED lighting']);
  assert.deepEqual(home.help.map((l) => l.href), ['/support', '/contact', '/quote', DIRECTIONS_URL]);
  assert.equal(home.help.at(-1)!.external, true);
});


// Bob: "also maybe 6+ ranges isntead of just 6 ranges": there are six ranges and Others, so the page says 6+.
test('round 54 copy: the ranges are 6+, wherever the page counts them', () => {
  assert.deepEqual(copy.WHEEL_COPY.title, ['6+ ranges.', 'One store.']);
  assert.equal(copy.FACT_RANGES.strong, '6+ ranges');
  const said = JSON.stringify(Object.values(copy));
  assert.doesNotMatch(said, /Six ranges/i, 'nowhere still says six');
});

// Bob: "i feel like loyalty program area gotta be bigger same with our solutions they gotta be more verticaly long(er)".
// Rewards: the two plans one under the other, each a tall row with its card large. Our solution: no longer held on one
// screen, so the sentence can run large down the page, its words filling in as they pass with the page's own fill
// (PageMotion data-fill); a second fill of its own on the same words made them fill out of order.
test('round 54 Rewards and Our solution: both run taller', () => {
  const air = readFileSync(join(root, 'app', 'styles', 'air.css'), 'utf8');
  const solution = readFileSync(join(root, 'components', 'home', 'Solution.tsx'), 'utf8');
  assert.match(air, /\.plans \{[^}]*grid-template-columns: 1fr;/, 'the plans sit one under the other');
  assert.match(air, /\.plan \{[^}]*min-height: /, 'each plan is a tall row');
  assert.doesNotMatch(air, /\.solution\[data-(held|fill)/, 'no attribute set by a script decides the layout');
  assert.doesNotMatch(air, /\.solution__side/, 'no column held beside the cards');
  assert.match(solution, /className="solution__head"/, 'the line stays on top');
});

// Bob, after the 3 x 2 grid: "no i want more simple card design view, something like https://www.squared-media.nl/
// where its more cinematic and have animation and seem more like business, do not copy exact". That became design 1
// (the fan deal, 8b36495). Bob asked for similar options and, of designs 2 to 4, said "maybe design 3": the slide. The
// line stays on top; on wide screens the section holds while the six tall numbered cards run across the screen on a
// strip, each leaning away from the middle and standing straight as it passes it, with a count and a rule under them.
// Tablets and phones keep the deck.
test('round 54 Our solution, design 3: six numbered cards, three tones, leaning as they pass', () => {
  const six = [0, 1, 2, 3, 4, 5];
  assert.deepEqual(six.map(cardNumber), ['01', '02', '03', '04', '05', '06']);
  assert.deepEqual(six.map(cardTone), ['deep', 'green', 'mint', 'deep', 'green', 'mint']);
  assert.equal(cardCount(1, 6), '02 / 06');
  assert.equal(cardCount(5, 6), '06 / 06');
  assert.deepEqual(slideShape(0), { tilt: 0, drop: 0, scale: 1 }, 'straight and level in the middle of the screen');
  for (const d of [0.1, 0.3, 0.6, 1]) {
    const right = slideShape(d), left = slideShape(-d);
    assert.equal(left.tilt, -right.tilt, `the lean mirrors at ${d}`);
    assert.equal(left.drop, right.drop);
    assert.equal(left.scale, right.scale);
    assert.ok(right.tilt > 0 && right.tilt <= 7, `a card right of the middle leans right, a little: ${right.tilt}`);
    assert.ok(right.drop > 0 && right.drop <= 46 && right.scale < 1 && right.scale >= 0.92, 'and sits back');
  }
  assert.deepEqual(slideShape(3), slideShape(1), 'no further than a screen away');
  const stack = six.map(stackTilt);
  stack.forEach((t, i) => {
    assert.ok(Math.abs(t) > 0 && Math.abs(t) <= 2, `a slight lean in the deck: ${t}`);
    if (i) assert.notEqual(Math.sign(t), Math.sign(stack[i - 1]), 'each card leans the other way from the one under it');
  });
});

test('round 54 Our solution deck: the deal, its CSS and its script share one screen rule', () => {
  const air = readFileSync(join(root, 'app', 'styles', 'air.css'), 'utf8').replace(/\r\n/g, '\n');
  const solution = readFileSync(join(root, 'components', 'home', 'Solution.tsx'), 'utf8');
  const deckPath = join(root, 'components', 'home', 'SolutionDeck.tsx');
  assert.ok(existsSync(deckPath), 'the cards have their own motion');
  const deck = readFileSync(deckPath, 'utf8');
  assert.match(DEAL_MEDIA, /prefers-reduced-motion: no-preference/, 'reduced motion is never dealt');
  assert.match(STACK_MEDIA, /prefers-reduced-motion: no-preference/);
  assert.ok(air.includes(`@media ${DEAL_MEDIA} {`), 'the held stage is laid out in CSS for the screens the script deals on');
  assert.match(air, /\.solution__stage \{[^}]*position: sticky;/, 'the stage holds while the cards are dealt');
  // The deck's held cards are laid out for exactly the screens the script sinks them on, and never reach the strip.
  const deckScreens = STACK_MEDIA.replaceAll('(prefers-reduced-motion: no-preference) and ', '');
  assert.ok(air.includes(`@media ${deckScreens} {`), `the deck is laid out for ${deckScreens}`);
  assert.match(deck, /DEAL_MEDIA/);
  assert.match(deck, /STACK_MEDIA/);
  assert.match(deck, /scrub/, 'the slide follows the scroll both ways');
  assert.match(deck, /slideShape/);
  assert.match(deck, /cardCount/);
  assert.match(solution, /<ol className="solution__cards"/, 'the six promises in order');
  assert.match(solution, /cardNumber\(i\)/);
  assert.match(solution, /SOLUTION_CARDS\.map/);
  assert.match(solution, /<SolutionDeck \/>/);
  assert.match(solution, /className="solution__meter" aria-hidden="true"/, 'the count and the rule under the strip');
  assert.match(air, /\.solution__meter \{[^}]*display: none;/, 'shown only while the strip runs');
  assert.doesNotMatch(solution, /data-reveal style/, 'no fade of their own on top of the slide');
});

// Bob: "make the first view page background color to be darker green like above the footer color". Above the footer is
// Visit, on the forest green #173d2c; the first view's veil is that green now (it was a pale morning green since round
// 47), the valley only a faint texture in it, with pale words. It counts as a dark ground, so the header turns deep
// green over it and its buttons take the pale-on-dark look Visit's have, and the browser's own bars match it.
test('round 54 first view: the forest green of Visit, with pale words', () => {
  const sky = readFileSync(join(root, 'app', 'styles', 'sky.css'), 'utf8').replace(/\r\n/g, '\n');
  const scope = readFileSync(join(root, 'components', 'sky', 'SkyScope.tsx'), 'utf8');
  const header = readFileSync(join(root, 'components', 'ui', 'Header.tsx'), 'utf8');
  const page = readFileSync(join(root, 'app', 'page.tsx'), 'utf8');
  const block = /\n\.sky-scope \{([^}]*)\}/.exec(sky)?.[1] ?? '';
  assert.match(block, /--veil: 23 61 44;/, 'the veil is #173d2c, the green above the footer');
  assert.match(block, /--sky-ink: #f2f6ef;/, 'the words are pale on it');
  assert.match(scope, /className="sky-scope" data-tone="dark"/, 'a dark ground: dark-ground buttons and header');
  assert.match(header, /\[data-tone="dark"\]/, 'the header reads it as a dark ground');
  assert.match(page, /themeColor: '#173d2c'/, "the browser's bars match the first view");
  assert.doesNotMatch(sky, /\.sky-scope \.hero__actions \.btn--primary \{/, 'no light-ground button over the dark-ground one');
  // Then Bob: "make background image lighter", and after a thinner veil showed the valley more: "no im neat the
  // background image should be less visible". The veil is thicker than at first (0.9 to 0.95), so the valley is only
  // the faintest texture in the green.
  const veil = [...(/\.sky__ink \{[^}]*?background: linear-gradient\(([^;]*)\);/.exec(sky)?.[1] ?? '').matchAll(/--veil\) \/ ([\d.]+)/g)].map((m) => Number(m[1]));
  assert.equal(veil.length, 4, 'four stops in the veil');
  for (const a of veil) assert.ok(a >= 0.94 && a < 1, `the valley barely shows: ${a}`);
});

// Bob: "make everything better ordered: 1. First view 2. What we sell 3. Reviews 4. Our solution 5. Rewards 6. Team
// 7. Visit the store and the footer". What we sell now slides up over the held first view (as Rewards did, round 37);
// Our solution and Rewards share one white sheet.
test('round 54 home page: the sections in the order Bob gave', () => {
  const page = readFileSync(join(root, 'app', 'page.tsx'), 'utf8');
  const body = page.slice(page.indexOf('export default function Home'));
  const order = [...body.matchAll(/<(Hero|Wheel|Reviews|Solution|Rewards|Team|Visit|Footer) \/>/g)].map((m) => m[1]);
  assert.deepEqual(order, ['Hero', 'Wheel', 'Reviews', 'Solution', 'Rewards', 'Team', 'Visit', 'Footer']);
  const cover = /<div className="cover">([\s\S]*?)\n        <\/div>/.exec(body)?.[1] ?? '';
  assert.match(cover, /<Hero \/>[\s\S]*<Wheel \/>/, 'What we sell slides up over the held first view');
  assert.doesNotMatch(cover, /<Rewards \/>/);
  const sky = readFileSync(join(root, 'components', 'home', 'HeroSkyMotion.tsx'), 'utf8');
  assert.doesNotMatch(sky, /getElementById\('rewards'\)/, 'whatever follows the first view in .cover covers it');
  const air = readFileSync(join(root, 'app', 'styles', 'air.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.doesNotMatch(/\n\.loyal \{([^}]*)\}/.exec(air)?.[1] ?? '', /border-radius|box-shadow/, 'Rewards is no longer a sheet over the first view');
  const wheel = readFileSync(join(root, 'app', 'styles', 'wheel.css'), 'utf8').replace(/\r\n/g, '\n');
  assert.match(/\n\.sell \{([^}]*)\}/.exec(wheel)?.[1] ?? '', /z-index: 2;/, 'What we sell paints over the held first view');
});
