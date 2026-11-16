// The one held stage of round 56 (Design 1, Bob approved it on 2026-11-16): What we sell and Our solution share one
// screen with no cut between them. The left side stays the whole way (the kicker, the big figure, "ranges. / One
// store." and under it the line for what is in front); only the right side changes. In scroll order:
//   1. ranges    the drum of the seven names, a rest on each, as since round 54 (lib/wheel heldPosition)
//   2. list      after Others the wheel opens into a still list of all seven, "Every product, one by one." under it
//   3. handoff   the names leave one after another; 7 rolls to 6, ranges. to promises., What we sell to Our solution,
//                all with the same move; the ground deepens from forest to deep green, once
//   4. sentence  "Your home makes its own power. We stand behind it." lights word by word, holds, then gives way
//   5. promises  the six promise names turn on the same wheel, with the same rest and turn as the ranges
//   6. last      the wheel opens into a still list of the six; the store line and Visit the store under the sentence
// Everything follows the scroll position (StoryMotion reads this for how far the stage has scrolled); nothing here
// plays on a timer. Pure, so it is tested on its own (round56.test.ts).
import { heldPosition, restProgress, settleOn } from './wheel.ts';

/** Where the stage holds: motion allowed, and a screen tall enough for it. Elsewhere (reduced motion, a short screen, or
 *  no scripts) the heading stands on top, then the seven rows, then the sentence and the six promise rows. */
export const SCENE_MEDIA = '(prefers-reduced-motion: no-preference) and (min-height: 34rem)';

export const STORY_BEATS = ['ranges', 'list', 'handoff', 'sentence', 'promises', 'last'] as const;
export type Beat = (typeof STORY_BEATS)[number];

/**
 * Each beat's share of the scroll, in screen heights; per item for the ranges and the promises. The ranges keep the
 * 75vh Bob tuned in round 54 (with WHEEL_REST), the promises the 72vh of round 55; the beats between follow the
 * prototype's proportions. The sentence's share holds its lighting and its hold (75vh) and the quarter screen in which
 * it gives way as the promises come up.
 */
export const SHARE = { range: 0.75, list: 0.75, handoff: 0.6, sentence: 1, promise: 0.72, last: 0.9 } as const;

/** The ranges open into the list over this much of the list beat, then hold open; the promises likewise. */
const LIST_OPEN = 0.55;
const LAST_OPEN = 0.5;
/** Within the handoff: the roll (the figure, the word, the kicker), then the sentence coming in where the wheel was. */
const ROLL_FROM = 0.2;
const ROLL_TO = 0.75;
const LINE_FROM = 0.7;
/** Within the sentence: the words light over the first part, it holds, then from GIVE it gives way to the promises:
 *  it goes first (until GONE) and they come up after it has begun to go (from COME), so the two never stand on top of
 *  each other. Our solution's link (#solution) lands at REST, the sentence fully lit. */
const LIGHT = 0.56;
const GIVE = 0.75;
const GONE = 0.88;
const COME = 0.84;
const REST = 0.66;
/** The first promise comes up from this far below the front of the wheel (in names). */
const ARRIVE_FROM = 0.9;
/** Each word's share of the lighting, and each range name's of the handoff (and the step between two names). */
const WORD = 0.16;
const LEAVE = 0.38;
const LEAVE_STEP = 0.04;

export interface StoryLayout {
  ranges: number;
  promises: number;
  /** Where each beat starts and ends, in screen heights from the top of the stage's scroll. */
  starts: Record<Beat, number>;
  ends: Record<Beat, number>;
  /** The stage's whole scroll, in screen heights (the held screen itself adds one more). */
  total: number;
}

export function storyLayout(ranges: number, promises: number): StoryLayout {
  const lengths: Record<Beat, number> = {
    ranges: ranges * SHARE.range,
    list: SHARE.list,
    handoff: SHARE.handoff,
    sentence: SHARE.sentence,
    promises: promises * SHARE.promise,
    last: SHARE.last,
  };
  const starts = {} as Record<Beat, number>;
  const ends = {} as Record<Beat, number>;
  let at = 0;
  for (const b of STORY_BEATS) {
    starts[b] = at;
    at += lengths[b];
    ends[b] = at;
  }
  return { ranges, promises, starts, ends, total: at };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/** The site's --ease-in-out, cubic-bezier(0.65, 0, 0.35, 1): easeInOutCubic. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** How far through one beat (0 to 1) the stage stands, for how far it has scrolled (0 to 1). */
const through = (progress: number, l: StoryLayout, b: Beat) => seg(clamp01(progress) * l.total, l.starts[b], l.ends[b]);

/** Which beat the stage is in, and how far through it, for how far it has scrolled (0 to 1). */
export function beatAt(progress: number, l: StoryLayout): { beat: Beat; t: number } {
  const x = clamp01(progress) * l.total;
  for (const b of STORY_BEATS) if (x < l.ends[b]) return { beat: b, t: seg(x, l.starts[b], l.ends[b]) };
  return { beat: 'last', t: 1 };
}

export interface StoryState {
  beat: Beat;
  t: number;
  /** The range wheel: 0 (Solar in front) to ranges - 1 (Others), and how many ranges' stretches have passed. */
  pos: number;
  rangeFill: number;
  /** The ranges opening into the still list, 0 to 1. */
  open: number;
  /** How far through the handoff, 0 to 1; the roll in it, eased; the ground deepening, eased. */
  handoff: number;
  roll: number;
  deep: number;
  /** The sentence coming in where the wheel was; how far its words have lit; how far it has gone again; how far the
   *  promises have arrived in its place. */
  sentence: number;
  lit: number;
  gone: number;
  arrive: number;
  /** The promise wheel: below the front before they arrive, then 0 to promises - 1; how many stretches have passed. */
  ppos: number;
  promiseFill: number;
  /** The promises opening into the still list, 0 to 1. */
  close: number;
}

/** Everything the stage shows, for how far it has scrolled (0 to 1). */
export function storyAt(progress: number, l: StoryLayout): StoryState {
  const { beat, t } = beatAt(progress, l);
  const r = through(progress, l, 'ranges');
  const h = through(progress, l, 'handoff');
  const s = through(progress, l, 'sentence');
  const p = through(progress, l, 'promises');
  const arrive = easeInOut(seg(s, COME, 1));
  return {
    beat,
    t,
    pos: heldPosition(r, l.ranges),
    rangeFill: r * l.ranges,
    open: easeInOut(seg(through(progress, l, 'list'), 0, LIST_OPEN)),
    handoff: h,
    roll: easeInOut(seg(h, ROLL_FROM, ROLL_TO)),
    deep: easeInOut(h),
    sentence: seg(h, LINE_FROM, 1),
    lit: seg(s, 0, LIGHT),
    gone: easeInOut(seg(s, GIVE, GONE)),
    arrive,
    ppos: p > 0 ? heldPosition(p, l.promises) : -(1 - arrive) * ARRIVE_FROM,
    promiseFill: p * l.promises,
    close: easeInOut(seg(through(progress, l, 'last'), 0, LAST_OPEN)),
  };
}

/** How much of range name i is left during the handoff (1 to 0): they leave one after another, the first first. */
export const leaving = (handoff: number, i: number) => 1 - easeInOut(seg(handoff, i * LEAVE_STEP, i * LEAVE_STEP + LEAVE));

/** How far word k of the sentence's `count` has lit (0 to 1), for how far the lighting has gone: in order, each from
 *  faint to full over a short stretch of its own. */
export function wordLight(lit: number, k: number, count: number): number {
  const from = count > 1 ? (k * (1 - WORD)) / (count - 1) : 0;
  return seg(lit, from, from + WORD);
}

/** How much of the line for item i shows under the sentence (0 to 1) while the wheel stands at `pos`: whole while that
 *  item rests in front, gone before the wheel is half way to the next, so the line only changes while it turns. */
export const panelLight = (pos: number, i: number) => clamp01(1 - Math.abs(pos - i) * 2.2);

export interface StoryText {
  /** How much of each range's line and link shows under the sentence (0 to 1). */
  ranges: number[];
  /** "Every product, one by one." and See all products, once the ranges have opened into the list. */
  all: number;
  /** Each promise's one line. */
  promises: number[];
  /** The store line and Visit the store, once the promises have opened into the list. */
  end: number;
  /** The small count above the line: which item of how many, and how much of it shows. */
  count: { of: number; at: number; light: number };
}

/**
 * What shows under the sentence for a state of the stage: one line at a time, whole while it is read. A range's or a
 * promise's line only while it rests in front (it changes only while the wheel turns, PRODUCT.md "text never fades out
 * while it is read"); the list's line as the wheel opens, until the handoff; nothing while the sentence is read; the
 * store's line at the end.
 */
export function storyText(s: StoryState, l: StoryLayout): StoryText {
  const ranges = 1 - seg(s.open, 0, 0.45);
  const promises = s.arrive * (1 - seg(s.close, 0, 0.45));
  const onRanges = s.beat === 'ranges' || s.beat === 'list';
  return {
    ranges: Array.from({ length: l.ranges }, (_, k) => panelLight(s.pos, k) * ranges),
    all: seg(s.open, 0.5, 1) * (1 - seg(s.handoff, 0, 0.25)),
    promises: Array.from({ length: l.promises }, (_, k) => panelLight(s.ppos, k) * promises),
    end: seg(s.close, 0.5, 1),
    count: onRanges
      ? { of: l.ranges, at: Math.round(s.pos) + 1, light: 1 - seg(s.open, 0, 0.4) }
      : { of: l.promises, at: Math.min(l.promises, Math.max(0, Math.round(s.ppos)) + 1), light: s.arrive * (1 - seg(s.close, 0, 0.4)) },
  };
}

const progressIn = (l: StoryLayout, b: Beat, part: number) => (l.starts[b] + part * (l.ends[b] - l.starts[b])) / l.total;

/** Where the stage rests on range k (its anchor: #solar ... #others), on promise k, and on the sentence fully lit
 *  (#solution), as a progress from 0 to 1. */
export const rangeRest = (k: number, l: StoryLayout) => progressIn(l, 'ranges', restProgress(k, l.ranges));
export const promiseRest = (k: number, l: StoryLayout) => progressIn(l, 'promises', restProgress(k, l.promises));
export const sentenceRest = (l: StoryLayout) => progressIn(l, 'sentence', REST);

/**
 * Where to glide when the scroll stops part way through a turn, as a phone's date picker clicks into place: on to the
 * next name the way the scroll was going (lib/wheel settleOn), on either wheel. -1 when there is nothing to settle:
 * resting on a name, or in a beat without turns (the lists, the handoff, the sentence).
 */
export function storySettle(progress: number, l: StoryLayout, direction: number): number {
  const { beat } = beatAt(progress, l);
  if (beat === 'ranges') {
    const k = settleOn(through(progress, l, 'ranges'), l.ranges, direction);
    return k < 0 ? -1 : rangeRest(k, l);
  }
  if (beat === 'promises') {
    const k = settleOn(through(progress, l, 'promises'), l.promises, direction);
    return k < 0 ? -1 : promiseRest(k, l);
  }
  return -1;
}

/** A count as the stage shows it: 01 to 07. */
export const pad2 = (n: number) => String(n).padStart(2, '0');
