// The six ranges as islands (round 9, open air), in the order the collection shows them. Figures come only from the
// manufacturer documents already used on the site (data/products.json chapters); ranges without a datasheet list
// what is carried, with no invented specs. `panel` opens the range's product panel (components/catalog), `quote`
// is the quote page's topic (lib/quote.ts). Pictures: public/sky/island-<image>-{700,1200}.webp.

// Type-only, so Node's test runner never loads products.ts (it imports through the '@/' alias Node cannot resolve).
import type { PanelId } from './products';

export interface Island {
  /** Anchor id: the footer and the menu link to these (keep solar, cooling, backup, light, upstairs). */
  id: string;
  name: string;
  image: string;
  /** Natural size of the 1200 px picture, for the img's width and height. */
  size: [number, number];
  line: string;
  facts?: { value: string; label: string }[];
  note?: string;
  actions: { label: string; panel: PanelId }[];
  quote: string;
  /** Where the bulb's glass is, in % of the picture (x, y of its centre; r of the width), for the colour slider's light. */
  lamp?: { x: number; y: number; r: number };
}

export const ISLANDS: Island[] = [
  {
    id: 'solar',
    name: 'Solar',
    image: 'solar',
    size: [1200, 1108],
    line: 'Framed panels and one hybrid inverter that runs the whole house on sun, battery and grid.',
    facts: [
      { value: '8,000 W', label: 'Rated output' },
      { value: '10 ms', label: 'To switch to battery' },
      { value: '2 × 5,500 W', label: 'Solar inputs' },
    ],
    note: 'Figures from the Namkoo SPI-8K-UP datasheet. Ask what is on the shelf.',
    actions: [
      { label: 'See the inverter', panel: 'inverter' },
      { label: 'See solar panels', panel: 'solar' },
    ],
    quote: 'inverter',
  },
  {
    id: 'cooling',
    name: 'Cooling',
    image: 'cooling',
    size: [1200, 1335],
    line: 'Air conditioning that runs on sunlight while the sun is out, and on the grid only when it needs to.',
    facts: [
      { value: '9k–36k', label: 'BTU, by model' },
      { value: 'Up to 100%', label: 'Solar while the sun is out' },
      { value: 'No battery', label: 'Or separate inverter' },
    ],
    note: 'From the ACDC hybrid solar AC brochure. Fitting needs an HVAC technician; Jontai Energy does not install.',
    actions: [{ label: 'See solar air conditioners', panel: 'solar-ac' }],
    quote: 'solar-ac',
  },
  {
    id: 'backup',
    name: 'Backup power',
    image: 'power',
    size: [1200, 1177],
    line: 'A quiet battery that keeps the fridge, fans and phones on when the grid drops.',
    facts: [
      { value: '3,000 W', label: 'Output' },
      { value: '2,560 Wh', label: 'Battery' },
      { value: '4', label: 'AC outlets' },
    ],
    note: '3000W portable power station. Figures from its spec sheet; other models differ.',
    actions: [
      { label: 'See the power station', panel: 'power-station' },
      { label: 'See generators', panel: 'generator' },
    ],
    quote: 'power-station',
  },
  {
    id: 'light',
    name: 'Lighting',
    image: 'light',
    size: [1200, 1529],
    line: 'Bulbs, including filament styles, LED strips, ceiling panels, tubes and floodlights, in the colour you like.',
    note: 'Stock changes often, so ask before you make the trip.',
    actions: [{ label: 'See lighting', panel: 'led' }],
    quote: 'led',
    // From tools/sky/fix-bulb.mjs, which turned the bulb the right way up into its socket.
    lamp: { x: 57.27, y: 32.63, r: 10.98 },
  },
  {
    id: 'security',
    name: 'Security',
    image: 'security',
    size: [1200, 1721],
    line: 'Security cameras that charge themselves from the sun, for the door, the yard or a site.',
    actions: [{ label: 'See security cameras', panel: 'cameras' }],
    quote: 'cameras',
  },
  {
    id: 'upstairs',
    name: 'Furniture',
    image: 'furniture',
    size: [1200, 1223],
    line: 'Furniture for every room, one flight up at Cumana 73. Come and sit on it before you buy.',
    note: 'Large-item delivery available. Ask us about furniture delivery.',
    actions: [{ label: 'How delivery works', panel: 'furniture' }],
    quote: 'furniture',
  },
];
