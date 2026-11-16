import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SCENE_MEDIA, promiseNumber, sceneAt } from './solutionScenes.ts';
import { wheelItems } from './wheel.ts';
import { ISLANDS } from './islands.ts';
import { CATALOG_COPY, SOLUTION_CARDS } from './homeCopy.ts';

const root = join(import.meta.dirname, '..');
const read = (...path: string[]) => readFileSync(join(root, ...path), 'utf8').replace(/\r\n/g, '\n');

// Bob (round 55): "Our solution section need better design it looks like a game". The C panels read as game cards
// (framed tiles, icons in circles, outlined numbers, a 02 / 06 progress bar). Of three mock-ups without cards he
// picked "B. One promise at a time": the screen holds, the sentence first, then each promise fills it in turn.
test('round 55 Our solution: the sentence first, then one promise at a time, each holding its share of the scroll', () => {
  const n = SOLUTION_CARDS.length + 1;
  assert.equal(sceneAt(0, n), 0, 'the sentence first');
  assert.equal(sceneAt(0.1, n), 0);
  assert.equal(sceneAt(1 / n + 0.001, n), 1, 'then the first promise');
  assert.equal(sceneAt(0.5, n), 3);
  assert.equal(sceneAt(0.999, n), n - 1, 'the last promise holds to the end');
  assert.equal(sceneAt(1, n), n - 1);
  assert.equal(sceneAt(-0.2, n), 0, 'before the hold: the sentence');
  assert.equal(sceneAt(1.4, n), n - 1, 'after it: the last promise');
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(promiseNumber), ['01', '02', '03', '04', '05', '06']);
  assert.match(SCENE_MEDIA, /prefers-reduced-motion: no-preference/, 'reduced motion is never held');
  assert.match(SCENE_MEDIA, /min-height: 34rem/, 'nor is a short screen');
});

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

test('round 55 Our solution: one held screen with the sentence, six promises, their names beside them and the store at the foot', () => {
  const solution = read('components', 'home', 'Solution.tsx');
  const at = (s: string) => solution.indexOf(s);
  for (const part of [
    'className="solution__stage"',
    'className="solution__scenes"',
    'className="solution__open"',
    '<ol className="solution__promises"',
    '<ol className="solution__index" aria-hidden="true"',
    'className="solution__foot"',
  ]) {
    assert.ok(at(part) > 0, part);
  }
  assert.ok(at('className="solution__open"') < at('<ol className="solution__promises"'), 'the sentence comes first');
  assert.match(solution, /className="solution__open" data-on="true"/, 'the sentence shows before the script runs');
  assert.match(solution, /promiseNumber\(i\)/);
  assert.match(solution, /SOLUTION_SUB/, 'the store line at the foot');
  assert.match(solution, /'--scenes': /, 'the section knows how many scenes it holds');
  assert.match(solution, /<SolutionScenes \/>/);
  const scenes = read('components', 'home', 'SolutionScenes.tsx');
  assert.match(scenes, /SCENE_MEDIA/);
  assert.match(scenes, /sceneAt\(/);
  assert.match(scenes, /dataset\.held = 'true'/, 'held only where the script runs');
  const air = read('app', 'styles', 'air.css');
  assert.match(air, /\.solution\[data-held='true'\] \.solution__track \{[^}]*height: calc\(100vh \+ var\(--scenes\) \* /, 'a share of the scroll for each scene');
  assert.match(air, /\.solution\[data-held='true'\] \.solution__stage \{[^}]*position: sticky;/, 'the stage holds');
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

test('round 55 What we sell: the 6+ heading holds beside the wheel, on one screen', () => {
  const wheel = read('components', 'home', 'Wheel.tsx');
  const css = read('app', 'styles', 'wheel.css');
  const at = (s: string) => wheel.indexOf(s);
  assert.ok(at('<section className="wheel"') < at('className="sell__head"'), "the heading is in the wheel's own section");
  assert.ok(at('className="wheel__pin"') < at('className="sell__head"'), 'inside the held screen');
  assert.ok(at('className="sell__head"') < at('className="wheel__names"'), 'left of the names');
  assert.ok(at('className="wheel__feet"') > at('className="sell__head"') && at('className="wheel__feet"') < at('className="wheel__names"'), 'the range in front is told under the heading');
  assert.match(wheel, /\{it\.line\}/, "each range's own line");
  assert.match(wheel, /className="sell__num"/, 'still the big number');
  assert.match(css, /\.wheel\[data-held='true'\] \.wheel__pin \{[^}]*display: grid;[^}]*grid-template-columns:/, 'two columns while held');
  assert.doesNotMatch(css, /min-height: max\(100svh, 640px\)/, 'no screen of its own for the heading');
});
