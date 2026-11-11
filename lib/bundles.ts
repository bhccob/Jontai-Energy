// The bundle offers in the header's popup (round 9). Sample offers: the owner has not confirmed bundle contents or
// savings, so the popup says so, and no prices are published (PRODUCT.md). Listed in docs/content-placeholders.md.

import { contactHref } from './message.ts';

export interface Bundle {
  id: string;
  name: string;
  /** What is in it, in plain words. */
  items: string;
  /** Percent off when bought together (sample). */
  save: number;
}

export const BUNDLES: Bundle[] = [
  { id: 'starter-solar', name: 'Starter Solar Kit', items: 'Solar panels, a hybrid inverter and a power station.', save: 20 },
  { id: 'home-security', name: 'Home Security Bundle', items: 'Two solar cameras, one for the door and one for the yard.', save: 15 },
  { id: 'outdoor-lighting', name: 'Outdoor Lighting Pack', items: 'A street lamp, garden lights and an LED floodlight.', save: 15 },
];

export const BUNDLE_NOTE = "Sample offers. Ask in store for this month's bundles.";

/** A message about the bundles, from the contact page with its topic chosen (round 18: the website's own form). */
export const bundleQuestion = () => contactHref('bundles');

/** Whether the popup opens by itself: once per visit, near the top, never when it was already seen or closed. */
export function shouldAutoOpen(seen: boolean, scrollY: number, viewport: number) {
  return !seen && scrollY < viewport * 0.25;
}
