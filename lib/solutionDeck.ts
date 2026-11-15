// Our solution's six cards (round 54). Bob, after the 3 x 2 grid: "no i want more simple card design view, something
// like https://www.squared-media.nl/ where its more cinematic and have animation and seem more like business, do not
// copy exact". The cards are dealt in one by one as the page scrolls: on wide screens they land in a gentle fan under
// the line, on tablets and phones they stack into a deck. The CSS (air.css) and the script (SolutionDeck) read the same
// screen rules from here, so the stage is never held without the deal or dealt without the stage.

/** Wide and tall enough for the line and the whole fan on one held screen, with motion allowed. */
export const DEAL_MEDIA = '(prefers-reduced-motion: no-preference) and (min-width: 75rem) and (min-height: 40rem)';

/** Everywhere else with motion allowed and room for a card on screen: the deck, where a card under the next one sinks
 *  back a little as it is covered. Short screens (a phone on its side) get a plain column instead (air.css). */
export const STACK_MEDIA =
  '(prefers-reduced-motion: no-preference) and (max-width: 74.99rem) and (min-height: 34rem), ' +
  '(prefers-reduced-motion: no-preference) and (max-height: 39.99rem) and (min-height: 34rem)';

/** The card's number, as the reference's cards carry theirs: 01 to 06. */
export const cardNumber = (i: number) => String(i + 1).padStart(2, '0');

/** Three grounds in turn, all from the site's greens: deep, the brand green, a pale mint. */
const TONES = ['deep', 'green', 'mint'] as const;
export type CardTone = (typeof TONES)[number];
export const cardTone = (i: number): CardTone => TONES[i % TONES.length];

/** Degrees between two neighbours in the fan, and the drop (px) of the outer cards per step squared. Small on purpose:
 *  a business-like hand, not a magic trick. */
const FAN_TILT = 1.6;
const FAN_DROP = 2.4;

/** Where card i of n rests in the fan: its tilt in degrees (left leans left) and how far it sits below the middle. */
export function fanSlot(i: number, n: number) {
  const d = i - (n - 1) / 2;
  return { tilt: round(d * FAN_TILT), lift: round(d * d * FAN_DROP) };
}

/** The lean of card i in the deck: each card the other way from the one under it. */
export const stackTilt = (i: number) => (i % 2 ? 1.2 : -1.2);

const round = (v: number) => Math.round(v * 1000) / 1000 + 0;
