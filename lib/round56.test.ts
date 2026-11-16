import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as copy from './homeCopy.ts';
import { WHEEL_REST, wheelItems } from './wheel.ts';
import {
  SCENE_MEDIA,
  SHARE,
  STORY_BEATS,
  beatAt,
  easeInOut,
  leaving,
  pad2,
  panelLight,
  promiseRest,
  rangeRest,
  sentenceRest,
  storyAt,
  storyLayout,
  storySettle,
  storyText,
  wordLight,
} from './story.ts';

const root = join(import.meta.dirname, '..');
const read = (...path: string[]) => readFileSync(join(root, ...path), 'utf8').replace(/\r\n/g, '\n');
const dict = (lang: 'es' | 'zh') => JSON.parse(read('lib', 'i18n', `${lang}.json`)) as { strings: Record<string, string> };
const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;
/** Equal to within a hair: a progress that has been through the layout's sums can land a float's width off a beat's edge. */
const eq = (a: number, b: number, msg = '') => assert.ok(close(a, b), `${msg} ${a} is not ${b}`);

// Round 56 (Design 1, Bob approved 2026-11-16). 1: the store has 7 ranges; Others counts as the seventh. This replaces
// his round 54 call ("6+ ranges instead of just 6 ranges").
test('round 56 copy: 7 ranges wherever the page counts them, and no 6+ left', () => {
  assert.equal(copy.FACT_RANGES.strong, '7 ranges');
  assert.deepEqual(copy.WHEEL_COPY.title, ['7 ranges.', 'One store.']);
  assert.equal(copy.WHEEL_COPY.count, 7);
  assert.equal(copy.WHEEL_COPY.count, wheelItems().length, 'the figure is the number of places on the wheel');
  assert.equal(copy.WHEEL_COPY.title[0], `${copy.WHEEL_COPY.count} ${copy.WHEEL_COPY.ranges}`);
  assert.equal(copy.WHEEL_COPY.promises, 'promises.');
  assert.equal(copy.SOLUTION_CARDS[3].line, 'Seven ranges in one store, from solar and LED lighting to cameras and furniture.');
  assert.equal(
    copy.FIRST_VIEW.lead,
    'Solar, backup power, lighting, cooling, security cameras, furniture and more, from one family-owned store in Oranjestad.',
  );
  // There are six promises, so this line stays.
  assert.equal(copy.SOLUTION_SUB, 'Six promises from one family-owned store at Cumana 73, Oranjestad.');
  assert.doesNotMatch(JSON.stringify(Object.values(copy)), /6\+/, 'no 6+ in the copy');
  const wheel = read('components', 'home', 'Wheel.tsx');
  assert.doesNotMatch(wheel, /sell__plus|\}\+/, 'the figure has no plus');
  assert.doesNotMatch(read('app', 'styles', 'wheel.css'), /\.sell__plus/);
});

test('round 56 copy: the new words in Spanish and Chinese, and no 6+ ranges in either', () => {
  const es = dict('es').strings;
  const zh = dict('zh').strings;
  assert.equal(es['7 ranges'], '7 líneas');
  assert.equal(es['7 ranges.'], '7 líneas.');
  assert.equal(zh['7 ranges'], '7 个品类');
  assert.equal(zh['7 ranges.'], '7 个品类。');
  assert.equal(es['promises.'], 'promesas.');
  assert.equal(zh['promises.'], '个承诺。');
  assert.equal(es[copy.SOLUTION_CARDS[3].line], 'Siete líneas en una sola tienda, de solar e iluminación LED a cámaras y muebles.');
  assert.equal(zh[copy.SOLUTION_CARDS[3].line], '七个品类，一店购齐，从太阳能和 LED 照明到摄像头和家具。');
  assert.ok(es[copy.FIRST_VIEW.lead] && zh[copy.FIRST_VIEW.lead], 'the new lead in both');
  for (const [lang, d] of [['es', es], ['zh', zh]] as const) {
    for (const [en, out] of Object.entries(d)) {
      assert.ok(!/^6\+ ranges/.test(en), `${lang}: ${en}`);
      assert.ok(!/^6\+ /.test(out), `${lang}: ${out}`);
    }
  }
});

// 2: What we sell and Our solution are one held stage, with no cut between them. The left side stays (the kicker, the
// figure, the sentence and under it the line for what is in front); only the right side changes. The beats, in order.
test('round 56 stage: the beats in order, with the shares Bob tuned', () => {
  assert.deepEqual([...STORY_BEATS], ['ranges', 'list', 'handoff', 'sentence', 'promises', 'last']);
  assert.equal(SHARE.range, 0.75, '75vh per range');
  assert.equal(WHEEL_REST, 0.22, 'the rest on each range stays');
  assert.equal(SHARE.promise, 0.72, 'about 72vh per promise');
  assert.equal(SHARE.list, 0.75);
  assert.equal(SHARE.handoff, 0.6);
  assert.equal(SHARE.last, 0.9);
  const l = storyLayout(7, 6);
  assert.ok(close(l.starts.ranges, 0));
  assert.ok(close(l.ends.ranges, 7 * 0.75));
  assert.ok(close(l.starts.list, l.ends.ranges));
  assert.ok(close(l.starts.handoff, l.ends.list));
  assert.ok(close(l.starts.sentence, l.ends.handoff));
  assert.ok(close(l.starts.promises, l.ends.sentence));
  assert.ok(close(l.ends.promises - l.starts.promises, 6 * 0.72));
  assert.ok(close(l.starts.last, l.ends.promises));
  assert.ok(close(l.total, l.ends.last));
  assert.ok(close(l.total, 7 * 0.75 + 0.75 + 0.6 + SHARE.sentence + 6 * 0.72 + 0.9));
  // Which beat, how far through it.
  assert.deepEqual(beatAt(0, l), { beat: 'ranges', t: 0 });
  assert.equal(beatAt(1, l).beat, 'last');
  assert.ok(close(beatAt(1, l).t, 1));
  const mid = (b: (typeof STORY_BEATS)[number]) => (l.starts[b] + l.ends[b]) / 2 / l.total;
  for (const b of STORY_BEATS) {
    assert.equal(beatAt(mid(b), l).beat, b, b);
    assert.ok(close(beatAt(mid(b), l).t, 0.5, 1e-6), `${b} half way`);
  }
  assert.deepEqual(beatAt(-1, l), { beat: 'ranges', t: 0 }, 'before the stage');
});

test('round 56 stage: the ranges rest and turn as before, then open into a still list', () => {
  const l = storyLayout(7, 6);
  for (let k = 0; k < 7; k++) assert.ok(close(storyAt(rangeRest(k, l), l).pos, k), `rests on range ${k}`);
  const start = storyAt(0, l);
  assert.equal(start.pos, 0);
  assert.equal(start.open, 0);
  assert.equal(start.roll, 0);
  assert.equal(start.deep, 0);
  assert.equal(start.handoff, 0);
  let last = -1;
  for (let i = 0; i <= 2000; i++) {
    const s = storyAt(i / 2000, l);
    assert.ok(s.pos >= last - 1e-12, `the wheel never turns back (${i})`);
    last = s.pos;
  }
  // The list: after Others, the wheel opens, then holds open.
  const list = (t: number) => storyAt((l.starts.list + t * SHARE.list) / l.total, l);
  eq(list(0).open, 0);
  assert.equal(list(0).pos, 6, 'Others in front');
  assert.ok(list(0.3).open > 0 && list(0.3).open < 1);
  assert.equal(list(0.6).open, 1, 'open by a little past half');
  assert.equal(list(1).open, 1, 'then holds');
  assert.equal(list(1).roll, 0, 'nothing has rolled yet');
});

test('round 56 stage: the handoff rolls 7 to 6, ranges. to promises. and the kicker in one move, and deepens the ground once', () => {
  const l = storyLayout(7, 6);
  const at = (t: number) => storyAt((l.starts.handoff + t * SHARE.handoff) / l.total, l);
  eq(at(0).roll, 0);
  eq(at(0.2).roll, 0);
  assert.ok(at(0.475).roll > 0.4 && at(0.475).roll < 0.6, 'half way through the roll');
  eq(at(0.75).roll, 1);
  eq(at(1).roll, 1);
  eq(at(0).deep, 0);
  eq(at(1).deep, 1);
  assert.equal(storyAt(1, l).deep, 1, 'the ground stays deep');
  assert.equal(storyAt(1, l).roll, 1, 'the words stay rolled');
  let r = -1;
  let d = -1;
  for (let i = 0; i <= 200; i++) {
    const s = at(i / 200);
    assert.ok(s.roll >= r && s.deep >= d, 'the roll and the ground only go one way');
    r = s.roll;
    d = s.deep;
  }
  // The seven names leave one after another.
  assert.equal(leaving(0, 0), 1);
  assert.equal(leaving(0, 6), 1);
  assert.equal(leaving(1, 6), 0);
  assert.ok(leaving(0.3, 0) < leaving(0.3, 6), 'the first goes first');
  // The roll follows the site's --ease-in-out, cubic-bezier(0.65, 0, 0.35, 1) (easeInOutCubic).
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.ok(close(easeInOut(0.5), 0.5));
  assert.ok(easeInOut(0.25) < 0.25 && easeInOut(0.75) > 0.75);
  // The sentence comes in at the end of the handoff.
  eq(at(0.5).sentence, 0);
  eq(at(1).sentence, 1);
});

test('round 56 stage: the sentence lights word by word, holds, then gives way to the promises', () => {
  const l = storyLayout(7, 6);
  const at = (t: number) => storyAt((l.starts.sentence + t * SHARE.sentence) / l.total, l);
  eq(at(0).lit, 0);
  eq(at(0).arrive, 0);
  const rest = storyAt(sentenceRest(l), l);
  assert.equal(rest.beat, 'sentence');
  assert.equal(rest.lit, 1, 'Our solution lands on the sentence fully lit');
  assert.equal(rest.arrive, 0, 'before it gives way');
  assert.equal(rest.sentence, 1);
  eq(at(1).arrive, 1);
  assert.ok(close(at(1).ppos, 0), 'the first promise in front as its beat starts');
  assert.ok(at(0.8).ppos < 0, 'the promises come up from below');
  // The sentence goes first and the promises come in after it, so the two never stand on top of each other.
  eq(rest.gone, 0);
  eq(at(1).gone, 1);
  for (let i = 0; i <= 200; i++) {
    const s = at(i / 200);
    assert.ok(!(1 - s.gone > 0.5 && s.arrive > 0.5), `the sentence and the promises at once (${i / 200})`);
    assert.ok(!(1 - s.gone > 0.9 && s.arrive > 0.1), `the promises before the sentence has begun to go (${i / 200})`);
  }
  // Word by word, in order, each from faint to full.
  const n = 10;
  for (let k = 0; k < n; k++) {
    assert.equal(wordLight(0, k, n), 0);
    assert.equal(wordLight(1, k, n), 1);
  }
  assert.ok(wordLight(0.3, 0, n) > wordLight(0.3, 5, n), 'the first word first');
  assert.ok(wordLight(0.3, 5, n) >= wordLight(0.3, 9, n));
  assert.equal(wordLight(0.5, 0, 1), 1, 'one word lights at once');
});

test('round 56 stage: the promises turn on the same wheel with the same rest, then open into a list', () => {
  const l = storyLayout(7, 6);
  for (let k = 0; k < 6; k++) {
    const s = storyAt(promiseRest(k, l), l);
    assert.ok(close(s.ppos, k), `rests on promise ${k}`);
    assert.equal(s.arrive, 1);
    assert.equal(s.close, 0);
  }
  const lastAt = (t: number) => storyAt((l.starts.last + t * SHARE.last) / l.total, l);
  eq(lastAt(0).close, 0);
  eq(lastAt(0).ppos, 5);
  assert.equal(lastAt(0.55).close, 1, 'open by a little past half');
  assert.equal(lastAt(1).close, 1);
  let last = -Infinity;
  for (let i = 0; i <= 2000; i++) {
    const s = storyAt(i / 2000, l);
    assert.ok(s.ppos >= last - 1e-12, `the promises never turn back (${i})`);
    last = s.ppos;
  }
  // The line under the sentence shows only for what rests in front, and only swaps while the wheel turns.
  assert.equal(panelLight(3, 3), 1);
  assert.equal(panelLight(3.5, 3), 0);
  assert.equal(panelLight(3.5, 4), 0);
  assert.ok(panelLight(3.1, 3) > 0.7);
  // The count and the ticks.
  assert.equal(pad2(1), '01');
  assert.equal(pad2(7), '07');
  assert.equal(storyAt(1, l).rangeFill, 7);
  assert.equal(storyAt(1, l).promiseFill, 6);
  assert.equal(storyAt(0, l).rangeFill, 0);
});

// The text under the sentence: one line at a time, whole while it is read, changing only while the wheel turns.
test('round 56 stage: under the sentence, the line for what rests in front, then the list line, then the store', () => {
  const l = storyLayout(7, 6);
  const text = (p: number) => storyText(storyAt(p, l), l);
  const lit = (t: ReturnType<typeof text>) =>
    [...t.ranges.map((v, k) => [`range ${k}`, v] as const), ['all', t.all] as const, ...t.promises.map((v, k) => [`promise ${k}`, v] as const), ['end', t.end] as const].filter(
      ([, v]) => v > 0.001,
    );
  for (let k = 0; k < 7; k++) {
    const t = text(rangeRest(k, l));
    assert.deepEqual(lit(t).map(([n]) => n), [`range ${k}`], `resting on range ${k}`);
    assert.equal(t.ranges[k], 1);
    assert.deepEqual(t.count, { of: 7, at: k + 1, light: 1 });
  }
  const list = text((l.starts.list + 0.7) / l.total);
  assert.deepEqual(lit(list).map(([n]) => n), ['all'], 'the list: Every product, one by one.');
  assert.equal(list.all, 1);
  assert.equal(list.count.light, 0, 'no count over the list');
  assert.deepEqual(lit(text(sentenceRest(l))), [], 'nothing under the sentence while it is read');
  for (let k = 0; k < 6; k++) {
    const t = text(promiseRest(k, l));
    assert.deepEqual(lit(t).map(([n]) => n), [`promise ${k}`], `resting on promise ${k}`);
    assert.equal(t.promises[k], 1);
    assert.deepEqual(t.count, { of: 6, at: k + 1, light: 1 });
  }
  const last = text(1);
  assert.deepEqual(lit(last).map(([n]) => n), ['end'], 'the end: the store line and Visit the store');
  assert.equal(last.end, 1);
  // Between two rests on the ranges, at most one line shows, and none half way.
  const half = text((l.starts.ranges + (2 + WHEEL_REST + (1 - WHEEL_REST) / 2) * SHARE.range) / l.total);
  assert.deepEqual(lit(half), [], 'half way through a turn, no line');
});

test('round 56 stage: stopped part way through a turn, it glides on to the next name; elsewhere it stays', () => {
  const l = storyLayout(7, 6);
  const range = (k: number, part: number) => (l.starts.ranges + (k + part) * SHARE.range) / l.total;
  const promise = (k: number, part: number) => (l.starts.promises + (k + part) * SHARE.promise) / l.total;
  assert.ok(close(storySettle(range(2, 0.6), l, 1), rangeRest(3, l)), 'on to the next range, scrolling down');
  assert.ok(close(storySettle(range(2, 0.6), l, -1), rangeRest(2, l)), 'back, scrolling up');
  assert.ok(close(storySettle(promise(1, 0.5), l, 1), promiseRest(2, l)), 'the promises click into place too');
  assert.equal(storySettle(rangeRest(4, l), l, 1), -1, 'resting: stays');
  assert.equal(storySettle(sentenceRest(l), l, 1), -1, 'the sentence: stays');
  assert.equal(storySettle((l.starts.list + 0.3) / l.total, l, 1), -1, 'the list: stays');
  assert.equal(storySettle((l.starts.handoff + 0.3) / l.total, l, 1), -1, 'the handoff: stays');
});

test('round 56 stage: one held screen for both sections, the still version without it', () => {
  const page = read('app', 'page.tsx');
  assert.match(page, /<Story>\s*<Wheel \/>\s*<Solution \/>\s*<\/Story>/, 'What we sell and Our solution share one stage');
  const cover = /<div className="cover">([\s\S]*?)\n        <\/div>/.exec(page)?.[1] ?? '';
  assert.match(cover, /<Hero \/>[\s\S]*<Story>/, 'the stage still slides up over the first view');
  const story = read('components', 'home', 'Story.tsx');
  assert.match(story, /id="products"/);
  assert.match(story, /className="story__pin"/);
  assert.match(story, /<StoryMeter /, 'the count and the ticks, in one place');
  assert.match(story, /<StoryMotion \/>/);
  assert.ok(!existsSync(join(root, 'components', 'home', 'WheelMotion.tsx')), 'one motion component for both');
  assert.ok(!existsSync(join(root, 'components', 'home', 'SolutionScenes.tsx')));
  assert.ok(!existsSync(join(root, 'lib', 'solutionScenes.ts')));
  const meter = read('components', 'home', 'StoryMeter.tsx');
  assert.match(meter, /aria-hidden="true"/);
  const motion = read('components', 'home', 'StoryMotion.tsx');
  assert.match(motion, /SCENE_MEDIA/, 'held only with motion, on a tall enough screen');
  assert.match(motion, /storyAt\(/);
  assert.match(motion, /dataset\.held = 'true'/);
  assert.match(motion, /scrollTargets\.set\('solution'/, 'Our solution lands on the sentence');
  assert.match(motion, /\.sell__num/, 'the 7 still counts up');
  assert.match(SCENE_MEDIA, /prefers-reduced-motion: no-preference/);
  assert.match(SCENE_MEDIA, /min-height: 34rem/);
  const css = read('app', 'styles', 'story.css');
  assert.match(css, /\.story\[data-held='true'\] \{[^}]*height: calc\(100vh \+ var\(--len\) \* 100vh\)/, 'a track as long as the beats');
  assert.match(css, /\.story\[data-held='true'\] \.story__pin \{[^}]*position: sticky;/, 'one held screen');
  assert.match(css, /\.story\[data-held='true'\] \.wheel,\n\.story\[data-held='true'\] \.solution \{[^}]*display: contents;/, 'both sections laid into it');
  assert.match(read('app', 'globals.css'), /story\.css/);
});

test('round 56 stage: each section keeps its own heading, read once, and Our solution keeps round 55', () => {
  const wheel = read('components', 'home', 'Wheel.tsx');
  const solution = read('components', 'home', 'Solution.tsx');
  assert.equal(wheel.match(/<h2 /g)?.length, 1);
  assert.equal(solution.match(/<h2 /g)?.length, 1);
  assert.match(wheel, /<h2 id="sell-title"/);
  assert.match(solution, /<h2 id="solution-title"/);
  // The figure, the word and the kicker roll for the eye; the heading reads "7 ranges. One store."
  assert.match(wheel, /className="sell__sr">\{WHEEL_COPY\.title\[0\]\}/);
  for (const roll of ['sell__kick', 'sell__big', 'sell__ranges']) assert.match(wheel, new RegExp(`className="${roll} roll" aria-hidden="true"`), roll);
  assert.match(wheel, /WHEEL_COPY\.promises/);
  assert.match(wheel, /SOLUTION_KICKER/);
  // The promise names turn on the wheel (for the eye); the promises themselves are read in order with their lines.
  assert.match(solution, /className="solution__names" aria-hidden="true"/);
  assert.match(solution, /<h3 className="solution__title">/);
  assert.doesNotMatch(solution, /solution__index|solution__num|promiseNumber/, 'the column of names and the big number go');
  assert.doesNotMatch(solution, /@phosphor-icons|solution__card|solution__icon/, 'no cards, frames or icons');
  // The range anchors land on the still rows, and on the wheel's rests while it is held (StoryMotion).
  for (const id of ['id={it.id}', 'id="delivery"']) assert.ok(wheel.includes(id), id);
});
