// The six ranges, in the order the collection shows them. Figures come only from the manufacturer documents already
// used on the site (data/products.json chapters); ranges without a datasheet list what is carried, with no invented
// specs. `panel` opens the range's product panel (components/catalog), `quote` is the quote page's topic
// (lib/quote.ts). Each range showed its products on a floating island from round 9; since round 36 (Bob: "i wanna see
// the products in six ranges without the islands") it shows the products alone, sharp pictures made from their catalogue
// pictures (round 38, tools/sky/range-products.mjs; the bulb from tools/sky/bulb-light.mjs). Since round 39 each range shows
// two to four of its products (Bob: "add more product like solar street lamp and solar fans"), each its own picture.

// Type-only, so Node's test runner never loads products.ts (it imports through the '@/' alias Node cannot resolve).
import type { PanelId } from './products';
import type { QuoteTopic } from './quote';

/** One product in a range: its picture (public/sky/range-<image>-<w>.webp), its name and line as the catalogue panels
 *  word them (data/products.json), and its own page (round 41, Bob: "i want each individual item to get their own page
 *  when clicked on and be more specific on products"). */
export interface Product {
  /** Its page: /products/<id> (round 41, app/products/[slug], lib/productPages.ts). */
  id: string;
  name: string;
  line: string;
  image: string;
  /** Natural size of the larger picture, for the img's width and height (no wider than the large file's width). */
  size: [number, number];
  /** The widths the picture is published at, small then large. Most are 640 and 1200. */
  files?: [number, number];
  /** The quote page's topic for it (lib/quote.ts). */
  quote: QuoteTopic;
  /** The lighting range's bulb, which lights up in the colour picked beside it (LampSwitch, bulb-light.mjs). */
  bulb?: boolean;
}

/** The widths most product pictures are published at (tools/sky/range-products.mjs). */
export const FILES: [number, number] = [640, 1200];

export interface Island {
  /** Anchor id: the footer and the menu link to these (keep solar, cooling, backup, light, upstairs). */
  id: string;
  name: string;
  /** What the range shows (round 39, Bob: "add more product like solar street lamp and solar fans"): two to six; more
   *  than two slide sideways (ProductRail). */
  products: Product[];
  line: string;
  facts?: { value: string; label: string }[];
  note?: string;
  actions: { label: string; panel: PanelId }[];
  quote: string;
  /** Where the bulb's glass is in its source photo, in % (x, y of its centre; r of the width), for bulb-light.mjs. */
  lamp?: { x: number; y: number; r: number };
}

export const ISLANDS: Island[] = [
  {
    id: 'solar',
    name: 'Solar',
    products: [
      { id: 'solar-panels', name: 'Solar panels', line: 'Framed panels for rooftop systems and solar air conditioning.', image: 'solar-panel', size: [1048, 1995], quote: 'solar-panels' },
      { id: 'hybrid-inverters', name: 'Hybrid inverters', line: 'Solar, battery and grid in one wall unit.', image: 'inverter', size: [1200, 1626], quote: 'inverter' },
    ],
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
    products: [
      { id: 'solar-air-conditioners', name: 'Solar air conditioners', line: 'Hybrid units that run on the sun by day and the grid when needed.', image: 'cooling', size: [1200, 1245], quote: 'solar-ac' },
      { id: 'solar-fans', name: 'Solar fans', line: 'Standing fans that run from their own small solar panel.', image: 'solar-fan', size: [1200, 1479], quote: 'solar-fan' },
    ],
    line: 'Air conditioners that run on sunlight and use the grid only when they need to, and fans that run on a solar panel.',
    facts: [
      { value: '9,000–36,000', label: 'BTU, by model' },
      { value: 'Up to 100%', label: 'Solar while the sun is out' },
      { value: 'None', label: 'Battery or extra inverter needed' },
    ],
    note: 'Air conditioner figures from the ACDC hybrid solar AC brochure. Fitting needs an HVAC technician; Jontai Energy does not install.',
    actions: [
      { label: 'See solar air conditioners', panel: 'solar-ac' },
      { label: 'See solar fans', panel: 'cooling' },
    ],
    quote: 'solar-ac',
  },
  {
    id: 'backup',
    name: 'Backup power',
    products: [
      { id: 'portable-power-stations', name: 'Portable power stations', line: 'A quiet battery with outlets, for when the power goes out.', image: 'power', size: [1200, 923], quote: 'power-station' },
      { id: 'generators', name: 'Generators', line: 'Backup power for homes, shops and job sites.', image: 'generator', size: [1200, 1141], quote: 'generator' },
    ],
    line: 'A quiet battery that keeps the fridge, fans and phones on when the grid drops.',
    facts: [
      { value: '3,000 W', label: 'Output' },
      { value: '2,560 Wh', label: 'Battery' },
      { value: '4', label: 'AC outlets' },
    ],
    note: '3,000 W portable power station. Figures from its spec sheet; other models differ.',
    actions: [
      { label: 'See the power station', panel: 'power-station' },
      { label: 'See generators', panel: 'generator' },
    ],
    quote: 'power-station',
  },
  {
    id: 'light',
    name: 'LED lighting',
    products: [
      { id: 'bulbs', name: 'Bulbs', line: 'Everyday and filament styles, warm to daylight white.', image: 'light', size: [600, 710], quote: 'led', files: [400, 600], bulb: true },
      { id: 'solar-street-lamps', name: 'Solar street lamps', line: 'All-in-one lamps with the solar panel built in, for streets, yards and parking.', image: 'street-lamp', size: [1200, 707], quote: 'street-lamp' },
      { id: 'ceiling-lights', name: 'Ceiling lights', line: 'Slim ceiling panels and round downlights.', image: 'ceiling-lights', size: [1200, 611], quote: 'led' },
      { id: 'led-tubes', name: 'Tubes and linear fixtures', line: 'LED tubes and long linear fittings.', image: 'tubes', size: [1200, 841], quote: 'led' },
      { id: 'floodlights', name: 'Floodlights', line: 'For yards and storefronts.', image: 'floodlight', size: [1200, 1292], quote: 'led' },
      { id: 'led-strips', name: 'LED strips', line: 'Flexible strip lights, warm to daylight white.', image: 'led-strip', size: [1200, 679], quote: 'led' },
    ],
    line: 'Bulbs in the colour you like, LED strips, ceiling panels, tubes, floodlights and solar street lamps.',
    note: 'Stock changes often, so ask before you make the trip.',
    actions: [{ label: 'See LED lighting', panel: 'led' }],
    quote: 'led',
    // From tools/sky/fix-bulb.mjs, which turned the bulb the right way up into its socket.
    lamp: { x: 57.27, y: 32.63, r: 10.98 },
  },
  {
    id: 'security',
    name: 'Security',
    products: [
      { id: 'home-cameras', name: 'For homes and yards', line: 'Solar-powered cameras that need no wiring.', image: 'security', size: [1200, 1571], quote: 'cameras' },
      { id: 'site-cameras', name: 'For sites and farms', line: 'For places with no power nearby.', image: 'camera-site', size: [1156, 1983], quote: 'cameras' },
    ],
    line: 'Security cameras that charge themselves from the sun, for the door, the yard or a site.',
    actions: [{ label: 'See security cameras', panel: 'cameras' }],
    quote: 'cameras',
  },
  {
    id: 'upstairs',
    name: 'Furniture',
    products: [
      { id: 'sofas', name: 'Sofas', line: 'Come upstairs at Cumana 73 and sit on it before you buy.', image: 'sofa', size: [1200, 661], quote: 'furniture' },
      { id: 'lounge-chairs', name: 'Lounge chairs', line: 'Large pieces delivered to your door.', image: 'furniture', size: [1200, 1153], quote: 'furniture' },
    ],
    line: 'Furniture for every room, one flight up at Cumana 73. Come and sit on it before you buy.',
    note: 'Large-item delivery available. Ask us about furniture delivery.',
    actions: [{ label: 'How delivery works', panel: 'furniture' }],
    quote: 'furniture',
  },
];

/** Every product in every range, in the order the page shows them. */
export const PRODUCTS: (Product & { range: Island })[] = ISLANDS.flatMap((range) => range.products.map((p) => ({ ...p, range })));

/** A product by its page id. */
export const productBySlug = (id: string) => PRODUCTS.find((p) => p.id === id) ?? null;
