// The bundle offers in the header's popup (round 9). Sample offers: the owner has not confirmed bundle contents or
// savings, so the popup says so, and no prices are published (PRODUCT.md). Listed in docs/content-placeholders.md.

import { whatsappLink } from './contact.ts';

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

/** One WhatsApp message asking about the bundles. */
export const bundleQuestion = () => whatsappLink('Hello Jontai Energy, I would like to ask about your bundle offers.');

/** Whether the popup opens by itself: once per visit, near the top, never when it was already seen or closed. */
export function shouldAutoOpen(seen: boolean, scrollY: number, viewport: number) {
  return !seen && scrollY < viewport * 0.25;
}
