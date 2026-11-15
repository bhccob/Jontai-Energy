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
  /** Its picture, public/sky/range-<image>-<w>.webp. Left out while it has none yet (round 52: the indoor camera): it
   *  then shows as a line of words under the pictures (RangeProducts) and its page has no picture. */
  image?: string;
  /** Natural size of the larger picture, for the img's width and height (no wider than the large file's width). */
  size?: [number, number];
  /** The widths the picture is published at, small then large. Most are 640 and 1200. */
  files?: [number, number];
  /** The quote page's topic for it (lib/quote.ts). */
  quote: QuoteTopic;
  /** The bulb: it hangs from the top of its frame by its cord (round 51: one still picture, no colour switch). */
  bulb?: boolean;
  /** The pole lamp: its head and the top of its pole, rising from the foot of its frame (round 53). */
  rise?: boolean;
  /** The whole product where no frame holds it (round 54, the All products page): the pole lamp standing on its pole.
   *  public/sky/range-<image>-<w>.webp at the widths in files. */
  whole?: { image: string; size: [number, number]; files: [number, number] };
}

/** A product with its picture. */
export type Pictured = Product & { image: string; size: [number, number] };

/** Whether a product has its picture yet. */
export const hasPicture = <P extends Product>(p: P): p is P & Pictured => Boolean(p.image && p.size);

/** The widths most product pictures are published at (tools/sky/range-products.mjs). */
export const FILES: [number, number] = [640, 1200];

export interface Island {
  /** Anchor id: the footer and the menu link to these (keep solar, cooling, backup, light, upstairs). */
  id: string;
  name: string;
  /** What the range shows (round 39, Bob: "add more product like solar street lamp and solar fans"): two to eight; more
   *  than two slide sideways (ProductRail). */
  products: Product[];
  line: string;
  /** Figures (unused since round 44: the range rows stay broad, figures are on the product pages). */
  facts?: { value: string; label: string }[];
  note?: string;
  /** Links to a panel that is about the range, not one product (furniture: how delivery works). */
  actions?: { label: string; panel: PanelId }[];
  quote: string;
  /** Where the bulb's glass is in its source photo, in % (x, y of its centre; r of the width), for bulb-light.mjs. */
  lamp?: { x: number; y: number; r: number };
  /** Products of other ranges this range shows too, by page id (round 46: every solar product also under Solar). */
  also?: string[];
}

// Solar first, then LED lighting (round 54, Bob: "the order should also matter so solar first then led lighting").
export const ISLANDS: Island[] = [
  {
    id: 'solar',
    name: 'Solar',
    products: [
      { id: 'solar-panels', name: 'Solar panels', line: 'Framed panels for rooftop systems and solar air conditioning.', image: 'solar-panel', size: [1048, 1995], quote: 'solar-panels' },
      { id: 'hybrid-inverters', name: 'Hybrid inverters', line: 'Solar, battery and grid in one wall unit.', image: 'inverter', size: [1200, 1626], quote: 'inverter' },
    ],
    line: 'Everything that runs on the sun: panels and inverters for the home, and solar air conditioners, fans, street lamps and cameras.',
    also: ['solar-air-conditioners', 'solar-fans', 'solar-floor-fans', 'solar-fan-lights', 'solar-street-lamps', 'solar-wall-lamps', 'outdoor-cameras'],
    quote: 'inverter',
  },
  {
    id: 'light',
    name: 'LED lighting',
    products: [
      { id: 'bulbs', name: 'Bulbs', line: 'Everyday and filament styles, warm to daylight white.', image: 'light', size: [600, 710], quote: 'led', files: [400, 600], bulb: true },
      // Round 53 (Bob: "we have normal street lamps standing with pole and the wall mounted one").
      { id: 'solar-street-lamps', name: 'Solar street lamps', line: 'Round-headed lamps on a pole of their own, for paths, courtyards and parking.', image: 'pole-lamp', size: [544, 952], quote: 'street-lamp', rise: true, whole: { image: 'pole-lamp-full', size: [400, 1408], files: [200, 400] } },
      { id: 'solar-wall-lamps', name: 'Solar wall lamps', line: 'All-in-one lamps on a bracket, for a wall or a post you already have.', image: 'street-lamp', size: [1200, 707], quote: 'street-lamp' },
      { id: 'ceiling-lights', name: 'Ceiling lights', line: 'Slim ceiling panels and round downlights.', image: 'ceiling-lights', size: [1200, 611], quote: 'led' },
      { id: 'led-tubes', name: 'Tubes and linear fixtures', line: 'LED tubes and long linear fittings.', image: 'tubes', size: [1200, 841], quote: 'led' },
      { id: 'floodlights', name: 'Floodlights', line: 'For yards and storefronts.', image: 'floodlight', size: [1200, 1292], quote: 'led' },
      { id: 'led-strips', name: 'LED strips', line: 'Flexible strip lights, warm to daylight white.', image: 'led-strip', size: [1200, 679], quote: 'led' },
    ],
    line: 'Bulbs, LED strips, ceiling panels, tubes, floodlights and solar street lamps.',
    note: 'Stock changes often, so ask before you make the trip.',
    quote: 'led',
    // From tools/sky/fix-bulb.mjs, which turned the bulb the right way up into its socket.
    lamp: { x: 57.27, y: 32.63, r: 10.98 },
  },
  {
    id: 'cooling',
    name: 'Cooling',
    products: [
      { id: 'solar-air-conditioners', name: 'Solar air conditioners', line: 'Hybrid units that run on the sun by day and the grid when needed.', image: 'cooling', size: [1200, 1245], quote: 'solar-ac' },
      // Round 53 (Bob: "theres more options in fan"): the three kinds, each with its own picture and page.
      { id: 'solar-fans', name: 'Solar standing fans', line: 'A tall fan with a head you can tilt, run from its own small solar panel.', image: 'solar-fan', size: [1200, 1479], quote: 'solar-fan' },
      { id: 'solar-floor-fans', name: 'Solar floor fans', line: 'A sturdy round fan for the floor or a table, run from its own small solar panel.', image: 'floor-fan', size: [1200, 923], quote: 'solar-fan' },
      { id: 'solar-fan-lights', name: 'Solar fan lights', line: 'A fan with a light in its middle, to hang up, run from its own small solar panel.', image: 'fan-light', size: [1200, 1032], quote: 'solar-fan' },
    ],
    line: 'Fans and air conditioners that run on the sun.',
    note: 'Jontai Energy sells and delivers; it does not install.',
    quote: 'solar-ac',
  },
  {
    id: 'backup',
    name: 'Backup power',
    products: [
      { id: 'portable-power-stations', name: 'Portable power stations', line: 'A quiet battery with outlets, for when the power goes out.', image: 'power', size: [1200, 923], quote: 'power-station' },
      { id: 'generators', name: 'Generators', line: 'Backup power for homes, shops and job sites.', image: 'generator', size: [1200, 1141], quote: 'generator' },
    ],
    line: 'Power for when the grid goes down, from quiet batteries to generators.',
    quote: 'power-station',
  },
  {
    id: 'security',
    name: 'Security',
    products: [
      // Round 51 (Bob: "a mounted one thats for outside and one for inside that put on the table and it can turn"): the
      // outdoor one, which turns, and (round 52, "also add indoors camera that works with electricity") the indoor one,
      // which plugs into a socket. Round 53: both with their pictures, the outdoor one with two lenses like Bob's photo.
      { id: 'outdoor-cameras', name: 'Outdoor solar cameras', line: 'Mounted on a wall or a pole, they turn to look around.', image: 'camera-outdoor', size: [1200, 1180], quote: 'cameras' },
      { id: 'indoor-cameras', name: 'Indoor cameras', line: 'Plugged into a socket, they stand on a table and turn to watch the room.', image: 'camera-indoor', size: [1200, 1288], quote: 'cameras' },
    ],
    line: 'Cameras that turn to look around: solar ones for outside, and plug-in ones for inside. Both record to SD cards, which we sell too.',
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

/**
 * Others (round 51, Bob: "put \"others\" SD cards from 16-256GB add in \"others\" more options for small solar lights,
 * solar door bells, wifi mesh - dont need to use pics"): what the store sells outside the six ranges, words only, in the
 * row after them (Collection).
 */
export const OTHERS: { name: string; line: string }[] = [
  { name: 'SD cards', line: 'From 16 GB to 256 GB, for the security cameras.' },
  { name: 'Small solar lights', line: 'Little lights with their own panel, for paths, gardens and fences.' },
  { name: 'Solar doorbells', line: 'A doorbell that charges from the sun, with no wiring to run.' },
  { name: 'WiFi mesh', line: 'Carries the WiFi signal to every room, and out to the cameras.' },
];

/** Every product in every range, in the order the page shows them. */
export const PRODUCTS: (Product & { range: Island })[] = ISLANDS.flatMap((range) => range.products.map((p) => ({ ...p, range })));

/** A product by its page id. */
export const productBySlug = (id: string) => PRODUCTS.find((p) => p.id === id) ?? null;

/** What a range shows: its own products, then those of other ranges it shows too (`also`). */
export const shownIn = (range: Island): Product[] => [
  ...range.products,
  ...(range.also ?? []).map((id) => {
    const p = ISLANDS.flatMap((r) => r.products).find((q) => q.id === id);
    if (!p) throw new Error(`no product ${id}`);
    return p;
  }),
];
