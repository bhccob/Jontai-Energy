// What each product's own page says (round 41, Bob: "i want each individual item to get their own page when clicked on
// and be more specific on products"). A product with a manufacturer document reuses its product panel (data/products.json
// panels: figures, points, the full datasheet). One without describes what it is, where it goes and what to ask, with no
// invented figures, models or prices (PRODUCT.md): the store confirms models and stock. Listed in
// docs/content-placeholders.md for the owner to check.

import type { PanelId } from './products';

export interface ProductPoint {
  title: string;
  line: string;
}

export interface ProductDetail {
  /** The page's heading, when the product's own name reads as a subtitle (the cameras: "For homes and yards"). */
  title?: string;
  /** A product panel to tell it from; the fields below replace the panel's own. */
  panel?: PanelId;
  /** One short, general line on what this kind of product is and what it is for, for the short info on the All products
   *  page outside Cooling and Backup power (round 54, Bob: "not go too much detailed into some products since its like
   *  a subcategory"). No models and no figures. */
  summary?: string;
  /** The model, or a short line on what kind of product it is. */
  model?: string;
  intro?: string;
  points?: ProductPoint[];
  /** The catalogue product whose specifications table shows on the page (data/products.json categories). */
  specs?: string;
  note?: string;
}

const STOCK = 'Stock changes often, so message us on WhatsApp before you make the trip.';

export const DETAILS: Record<string, ProductDetail> = {
  'solar-panels': {
    summary: 'Panels that make your own power from the sun, for a whole-house system or to run a solar air conditioner.',
    model: 'For rooftops and the solar air conditioner',
    intro: 'Panels for rooftop systems, and for running the solar air conditioner directly during the day.',
    points: [
      { title: 'For a whole-house system', line: 'Pair them with the SPI hybrid inverter, which takes two strings of up to 5,500 W each and runs the house on sun, battery and grid.' },
      { title: 'Straight into the air conditioner', line: 'The ACDC solar air conditioner takes panels directly through MC4 connectors, with no battery and no separate inverter.' },
      { title: 'Sold on their own or matched', line: 'Buy panels on their own, or matched to a solar air conditioner.' },
      { title: 'Ask what is in stock', line: 'Ask which wattages are in stock this week.' },
    ],
  },
  'hybrid-inverters': { summary: 'The heart of a home solar system: it brings the panels, the batteries and the grid together to power the house.', panel: 'inverter' },
  'solar-air-conditioners': { panel: 'solar-ac' },
  // Round 53 (Bob: "theres more options in fan"; pictures approved): three fans, each with its own panel and page.
  'solar-fans': {
    model: 'A standing fan with its own solar panel',
    intro: 'A standing fan that runs from its own small solar panel, joined to the fan by one cable. No socket and no wiring, so it works on a porch, in a yard or wherever the panel can see the sun.',
    points: [
      { title: 'Its own panel', line: 'The small panel stands on a folding stand and plugs into the base of the fan.' },
      { title: 'Tilt the head', line: 'Tilt the head up or down to send the air where you sit.' },
      { title: 'No socket needed', line: 'Use it where there is no outlet nearby: patios, yards, workshops and building sites.' },
      { title: 'Runs on daylight', line: 'It runs from the panel while the sun is out. Ask whether the model in stock keeps running after dark.' },
      { title: 'Ask before you come', line: STOCK },
    ],
  },
  'solar-floor-fans': {
    model: 'A floor fan with its own solar panel',
    intro: 'A fan in a sturdy round frame with a carry handle, run from its own small solar panel by one cable. It sits low on the floor or a table, with no socket and no wiring.',
    points: [
      { title: 'Sturdy and low', line: 'Its round frame stands steady on the floor or a table, where a tall fan would be in the way.' },
      { title: 'Easy to carry', line: 'The handle on top lets you take it from the porch to the yard.' },
      { title: 'Its own panel', line: 'Each comes with a small panel on a folding stand that plugs into the fan.' },
      { title: 'Runs on daylight', line: 'It runs from the panel while the sun is out. Ask whether the model in stock keeps running after dark.' },
      { title: 'Ask before you come', line: STOCK },
    ],
  },
  'solar-fan-lights': {
    model: 'A fan and a light in one, with its own solar panel',
    intro: 'A fan with a light in its middle, to hang from a ceiling or a porch roof, run from its own small solar panel by one cable.',
    points: [
      { title: 'A breeze and a light', line: 'One fitting gives you moving air and light from above.' },
      { title: 'Hangs from a hook', line: 'The hook at the top hangs it from a ceiling, a porch roof or a beam.' },
      { title: 'Its own panel', line: 'Each comes with a small panel on a folding stand that plugs into the fan.' },
      { title: 'Ask before you come', line: STOCK },
    ],
  },
  'portable-power-stations': { panel: 'power-station' },
  generators: { panel: 'generator' },
  bulbs: {
    summary: 'LED bulbs for every room, in everyday shapes and clear filament styles, using far less power than the old ones.',
    model: 'Everyday and filament styles',
    intro: 'LED bulbs for every room, from everyday shapes to clear filament globes that look like the old glass bulbs and use far less power.',
    points: [
      { title: 'Warm or clear white', line: 'Warm white for living rooms and bedrooms, clear daylight white for kitchens, offices and shops.' },
      { title: 'Filament styles', line: 'Clear glass globes with LED filaments, for pendants and open fittings where the bulb shows.' },
      { title: 'Everyday shapes', line: 'Standard bulbs for ceiling lights, lamps and fittings around the house.' },
      { title: 'Ask before you come', line: STOCK },
    ],
  },
  // Round 53 (Bob: "we have normal street lamps standing with pole and the wall mounted one"; pictures approved).
  'solar-street-lamps': {
    summary: 'Solar lamps on their own poles, for paths, courtyards, parking and streets, with no wiring to the grid.',
    model: 'On a pole of its own',
    intro: 'A round-headed lamp on a pole of its own, with the solar panel built into the top of the head, for paths, courtyards, parking and streets.',
    points: [
      { title: 'The panel is on the lamp', line: 'The solar panel is built into the top of the round head, so there is no separate panel to mount.' },
      { title: 'Light all round', line: 'The round head spreads its light all around the pole, over a path or a courtyard.' },
      { title: 'No cable to run', line: 'It needs no wiring to the grid, so it can light a driveway, a yard or a parking area far from a socket.' },
      { title: 'Ask for the right size', line: 'Brightness and mounting differ by model, so ask which ones are in stock.' },
    ],
  },
  'solar-wall-lamps': {
    summary: 'Solar lamps for a wall or a post, to light entrances, yards and driveways with no wiring.',
    model: 'All-in-one, on a bracket',
    intro: 'All-in-one lamps with the solar panel built in, on a bracket for a wall or a post you already have.',
    points: [
      { title: 'The panel is on the lamp', line: 'The solar panel sits on top of the lamp head, so there is no separate panel to mount.' },
      { title: 'On a wall or a post', line: 'A bracket at the back fits it to a wall or a post you already have.' },
      { title: 'No cable to run', line: 'It needs no wiring to the grid, so it can light a driveway, a yard or a parking area far from a socket.' },
      { title: 'Ask for the right size', line: 'Brightness and mounting differ by model, so ask which ones are in stock.' },
    ],
  },
  'ceiling-lights': {
    summary: 'LED ceiling lights for homes, offices and shops, from slim panels to round downlights.',
    model: 'Slim panels and round downlights',
    intro: 'Slim LED panels and round downlights that sit flush in the ceiling, for homes, offices and shops.',
    points: [
      { title: 'Flush with the ceiling', line: 'Spring clips hold them in a round or square cut-out, so they sit flat with the ceiling.' },
      { title: 'Round or square', line: 'Round downlights for rooms and hallways, square panels for offices and shops.' },
      { title: 'Warm or daylight white', line: 'Choose the white that suits the room, from warm to daylight.' },
      { title: 'Ask for sizes', line: 'Sizes and light colours change with stock, so ask which ones are on the shelf.' },
    ],
  },
  'led-tubes': {
    summary: 'LED tubes and linear fittings for garages, workshops, shops and offices.',
    model: 'Tubes and linear fittings',
    intro: 'LED tubes for tube fittings, and long linear fittings with the light built in, for garages, workshops, shops and offices.',
    points: [
      { title: 'Even, bright light', line: 'Long fittings spread the light evenly over a workbench, a counter or a hallway.' },
      { title: 'A tube or a whole fitting', line: 'Buy a tube for a fitting you already have, or a linear fitting with the light built in.' },
      { title: 'Ask before you change over', line: 'Some older tube fittings need a small change to take LED tubes, so ask which tube suits yours.' },
      { title: 'Ask before you come', line: STOCK },
    ],
  },
  floodlights: {
    summary: 'Bright LED floodlights for yards, storefronts, signs and parking.',
    model: 'For yards and storefronts',
    intro: 'Bright, wide light for yards, storefronts, signs and parking, on a bracket you can angle where you need it.',
    points: [
      { title: 'Angle it where you need it', line: 'The bracket tilts, so the light falls on the yard, the sign or the door.' },
      { title: 'Made for outdoors', line: 'A sealed glass face, and a finned back that carries the heat away.' },
      { title: 'Ask about wattage', line: 'Wattages and light colours change with stock, so ask which ones are on the shelf.' },
    ],
  },
  'led-strips': {
    summary: 'Flexible LED strip light for shelves, counters, ceiling edges and stairs.',
    model: 'Flexible strip light',
    intro: 'Flexible LED strip that follows a shelf, a counter, a ceiling edge or a staircase, in warm to daylight white.',
    points: [
      { title: 'Light without a fitting', line: 'Tuck it under cabinets, along a shelf or behind a TV for soft light with no lamp in sight.' },
      { title: 'Warm or daylight white', line: 'Choose the white that suits the room, from warm to daylight.' },
      { title: 'Tell us where it goes', line: 'Lengths and power supplies differ, so tell us where it goes and we will show you what is in stock.' },
    ],
  },
  // Round 51 (Bob: "a mounted one thats for outside ... it can turn, they work with SD card and that we also sell").
  'outdoor-cameras': {
    summary: 'Security cameras for outside the home or the shop, powered by their own solar panels.',
    model: 'Mounted outside, with its own solar panel',
    intro: 'A camera with its own solar panel, mounted on a wall or a pole outside. It turns to look around, and records to an SD card.',
    points: [
      { title: 'It turns', line: 'The head turns and tilts, so one camera can watch the gate, the driveway and the yard.' },
      { title: 'Two lenses', line: 'One lens keeps a fixed view while the other turns to look around.' },
      { title: 'No power cable', line: 'The panel charges it, so it can go on a gate, a pole or a far wall.' },
      { title: 'Records to an SD card', line: 'It saves what it sees to an SD card. We sell cards from 16 GB to 256 GB.' },
      { title: 'Ask what is on the shelf', line: 'Connection, night view and storage differ by model, so ask which ones are in stock.' },
    ],
  },
  // Round 52 (Bob: "also add indoors camera that works with electricity").
  'indoor-cameras': {
    summary: 'Security cameras for inside the home or the shop.',
    model: 'Plugs into a socket, stands on a table',
    intro: 'A small camera for inside the home or the shop. It plugs into a socket, stands on a table or a shelf, turns to look around the room and records to an SD card.',
    points: [
      { title: 'It turns', line: 'The head turns and tilts, so one camera can watch a whole room.' },
      { title: 'Runs on electricity', line: 'It plugs into a socket, so there is no battery to charge and no panel to place.' },
      { title: 'Stands where you put it', line: 'Set it on a table, a shelf or a counter, facing the room.' },
      { title: 'Records to an SD card', line: 'It saves what it sees to an SD card. We sell cards from 16 GB to 256 GB.' },
      { title: 'Ask what is on the shelf', line: 'Connection, night view and storage differ by model, so ask which ones are in stock.' },
    ],
  },
  sofas: { summary: 'Sofas for the living room, on show upstairs in the store and delivered to your door.', panel: 'furniture', title: 'Sofas', model: 'One floor up, Cumana 73' },
  'lounge-chairs': { summary: 'Lounge chairs to sit back in, on show upstairs in the store and delivered to your door.', panel: 'furniture', title: 'Lounge chairs', model: 'One floor up, Cumana 73' },
};
