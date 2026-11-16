import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { wheelItems } from './wheel.ts';
import { ISLANDS } from './islands.ts';
import { CATALOG_COPY } from './homeCopy.ts';

const root = join(import.meta.dirname, '..');
const read = (...path: string[]) => readFileSync(join(root, ...path), 'utf8').replace(/\r\n/g, '\n');

// Bob (round 55): "Our solution section need better design it looks like a game". The C panels read as game cards
// (framed tiles, icons in circles, outlined numbers, a 02 / 06 progress bar). Of three mock-ups without cards he
// picked "B. One promise at a time". Round 56 (Design 1) puts the promises on the wheel of What we sell's stage
// (lib/round56.test.ts); the round 55 scenes (SolutionScenes, sceneAt) went with it, and what round 55 ruled out stays
// out.
test('round 55 Our solution: nothing that looks like a game, no frames, icons, outlined numbers or counters', () => {
  const solution = read('components', 'home', 'Solution.tsx');
  const air = read('app', 'styles', 'air.css');
  assert.doesNotMatch(solution, /@phosphor-icons|solution__icon|solution__card|solution__meter|cardCount/);
  const rules = (air.match(/\n[^\n{]*\.solution[^{]*\{[^}]*\}/g) ?? []).join('\n');
  assert.ok(rules.length > 200, 'found the section rules');
  assert.doesNotMatch(rules, /text-stroke|border-radius|box-shadow|backdrop-filter/, 'no panel and no outlined number');
  assert.ok(!existsSync(join(root, 'components', 'home', 'SolutionDeck.tsx')), 'the strip of cards is gone');
  assert.ok(!existsSync(join(root, 'lib', 'solutionDeck.ts')));
});

// Bob: "above six ranges products area gotta be better designed too". The 6+ heading had a screen of its own, half of
// it empty. Of three mock-ups he picked "C. One screen with the wheel": the heading holds on the left while the wheel
// turns on the right, and under the heading the range in front says what it is and links to its products.
test('round 55 What we sell: every place on the wheel says what it is', () => {
  const items = wheelItems();
  assert.deepEqual(
    items.slice(0, ISLANDS.length).map((i) => i.line),
    ISLANDS.map((r) => r.line),
  );
  assert.equal(items.at(-1)?.id, 'others');
  assert.equal(items.at(-1)?.line, CATALOG_COPY.othersLine);
});

test('round 55 What we sell: the heading holds beside the wheel, on one screen (7 since round 56)', () => {
  const wheel = read('components', 'home', 'Wheel.tsx');
  const css = read('app', 'styles', 'story.css');
  const at = (s: string) => wheel.indexOf(s);
  assert.ok(at('<section className="wheel"') < at('className="sell__head"'), "the heading is in the wheel's own section");
  assert.ok(at('className="sell__head"') < at('className="wheel__feet"'), 'the range in front is told under the heading');
  assert.ok(at('className="wheel__feet"') < at('className="wheel__names"'), 'then the names');
  assert.match(wheel, /\{it\.line\}/, "each range's own line");
  assert.match(wheel, /className="sell__num"/, 'still the big number');
  assert.match(css, /\.story\[data-held='true'\] \.story__pin \{[^}]*display: grid;[^}]*grid-template-columns:/, 'two columns while held');
  assert.match(css, /\.story\[data-held='true'\] \.sell__head \{[^}]*grid-area: head;/, 'the heading on the left');
  assert.match(css, /\.story\[data-held='true'\] \.wheel__names,[^{]*\{[^}]*grid-area: wheel;/, 'the names on the right');
  assert.doesNotMatch(read('app', 'styles', 'wheel.css'), /min-height: max\(100svh, 640px\)/, 'no screen of its own for the heading');
});
