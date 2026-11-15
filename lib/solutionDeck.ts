// Our solution's six cards (round 54). Bob, after the 3 x 2 grid: "no i want more simple card design view, something
// like https://www.squared-media.nl/ where its more cinematic and have animation and seem more like business, do not
// copy exact". Design 1 dealt the cards into a fan (commit 8b36495); of three similar options Bob said "maybe design 3",
// the slide: on wide screens the section holds while the cards run across the screen on a strip, leaning as they pass
// the middle; on tablets and phones they stack into a deck. The CSS (air.css) and the script (SolutionDeck) read the
// same screen rules from here, so the stage is never held without the slide or slid without the stage.

/** Wide and tall enough for the line and the strip on one held screen, with motion allowed. */
export const DEAL_MEDIA = '(prefers-reduced-motion: no-preference) and (min-width: 75rem) and (min-height: 40rem)';

/** Everywhere else with motion allowed and room for a card on screen: the deck, where a card under the next one sinks
 *  back a little as it is covered. Short screens (a phone on its side) get a plain column instead (air.css). */
export const STACK_MEDIA =
  '(prefers-reduced-motion: no-preference) and (max-width: 74.99rem) and (min-height: 34rem), ' +
  '(prefers-reduced-motion: no-preference) and (max-height: 39.99rem) and (min-height: 34rem)';

/** The card's number: 01 to 06. */
export const cardNumber = (i: number) => String(i + 1).padStart(2, '0');

/** The count under the strip: the card nearest the middle of the screen, of all of them ("02 / 06"). */
export const cardCount = (i: number, n: number) => `${cardNumber(i)} / ${cardNumber(n - 1)}`;

/** Three grounds in turn, all from the site's greens: deep, the brand green, a pale mint. */
const TONES = ['deep', 'green', 'mint'] as const;
export type CardTone = (typeof TONES)[number];
export const cardTone = (i: number): CardTone => TONES[i % TONES.length];

/** How far a card a screen's width from the middle leans (degrees), sinks (px) and shrinks. */
const SLIDE_TILT = 7;
const SLIDE_DROP = 46;
const SLIDE_SHRINK = 0.07;

/**
 * A card on the strip, by its distance from the middle of the screen in screen widths (negative: to the left): it
 * leans away from the middle, sits a little lower and smaller, and stands straight and full size as it passes.
 */
export function slideShape(distance: number) {
  const k = Math.max(-1, Math.min(1, distance));
  const a = Math.abs(k);
  return { tilt: round(k * SLIDE_TILT), drop: round(a * SLIDE_DROP), scale: round(1 - a * SLIDE_SHRINK) };
}

/** The lean of card i in the deck: each card the other way from the one under it. */
export const stackTilt = (i: number) => (i % 2 ? 1.2 : -1.2);

const round = (v: number) => Math.round(v * 1000) / 1000 + 0;
