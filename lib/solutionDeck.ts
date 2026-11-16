// Our solution's six cards (round 54). Bob, after the 3 x 2 grid: "no i want more simple card design view, something
// like https://www.squared-media.nl/ where its more cinematic and have animation and seem more like business, do not
// copy exact". Design 1 dealt the cards into a fan (commit 8b36495); of three similar options Bob said "maybe design 3",
// the slide: on wide screens the section holds while the cards run across the screen on a strip; on tablets and phones
// they stack into a deck. Then, for a more professional look, "C. On the green": one panel for every card, standing
// straight. The CSS (air.css) and the script (SolutionDeck) read the same screen rules from here, so the stage is never
// held without the slide or slid without the stage.

/** Wide and tall enough for the line and the strip on one held screen, with motion allowed. */
export const DEAL_MEDIA = '(prefers-reduced-motion: no-preference) and (min-width: 75rem) and (min-height: 40rem)';

/** Everywhere else with motion allowed and room for a card on screen: the deck, where a card under the next one sinks
 *  back a little as it is covered. Short screens (a phone on its side) get a plain column instead (air.css). */
export const STACK_MEDIA =
  '(prefers-reduced-motion: no-preference) and (max-width: 74.99rem) and (min-height: 34rem), ' +
  '(prefers-reduced-motion: no-preference) and (max-height: 39.99rem) and (min-height: 34rem)';

/** The card's number: 01 to 06. */
export const cardNumber = (i: number) => String(i + 1).padStart(2, '0');

/** The count under the strip: how far it has run, of all the cards ("02 / 06"). */
export const cardCount = (i: number, n: number) => `${cardNumber(i)} / ${cardNumber(n - 1)}`;

/** How much smaller a card a screen's width from the middle is. */
const SLIDE_SHRINK = 0.05;

/**
 * A card on the strip, by its distance from the middle of the screen in screen widths (negative: to the left). Since
 * "C. On the green" it stands straight and level everywhere (design 3 leaned it away from the middle), only easing back
 * a touch toward the edges, so the one passing the middle reads as the one in front.
 */
export function slideShape(distance: number) {
  const a = Math.min(1, Math.abs(distance));
  return { tilt: 0, drop: 0, scale: Math.round((1 - a * SLIDE_SHRINK) * 1000) / 1000 };
}
