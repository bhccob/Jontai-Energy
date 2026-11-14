// The header's bundles and discounts popup. Round 9 to 37 it showed three sample offers the owner never confirmed; round 38
// made it a note that bundles were coming in December, and round 41 (Bob: "make bundles just say coming soon no release
// month date and maybe also like discount too") says only that bundles and discounts are coming soon. No offers, savings,
// dates or prices (PRODUCT.md). Listed in docs/content-placeholders.md.

import { contactHref } from './message.ts';

/** What the popup says until the bundles and discounts are confirmed (round 41, Bob: "make bundles just say coming soon
 *  no release month date and maybe also like discount too instead of only bundles"). */
export const BUNDLE_TEASER = {
  /** The header's button, and the popup's label. */
  name: 'Bundles & discounts',
  /** The header's button on narrow screens. */
  short: 'Deals',
  /** The small label beside the name. */
  when: 'Coming soon',
  title: 'Bundles and discounts are on their way.',
  text: 'Save on solar, backup power, lighting and more when they launch. Until then, ask in store about current offers.',
  ask: "Tell me when they're out",
};

/** A message about the bundles, from the contact page with its topic chosen (round 18: the website's own form). */
export const bundleQuestion = () => contactHref('bundles');

/** Whether the popup opens by itself: once per visit, near the top, never when it was already seen or closed. */
export function shouldAutoOpen(seen: boolean, scrollY: number, viewport: number) {
  return !seen && scrollY < viewport * 0.25;
}
