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
    model: 'For rooftops and the solar air conditioner',
    intro: 'Panels for rooftop systems, and for running the solar air conditioner directly during the day.',
    points: [
      { title: 'For a whole-house system', line: 'Pair them with the SPI hybrid inverter, which takes two strings of up to 5,500 W each and runs the house on sun, battery and grid.' },
      { title: 'Straight into the air conditioner', line: 'The ACDC solar air conditioner takes panels directly through MC4 connectors, with no battery and no separate inverter.' },
      { title: 'Sold on their own or matched', line: 'Buy panels on their own, or matched to a solar air conditioner.' },
      { title: 'Ask what is in stock', line: 'Ask which wattages are in stock this week.' },
    ],
  },
  'hybrid-inverters': { panel: 'inverter' },
  'solar-air-conditioners': { panel: 'solar-ac' },
  'solar-fans': {
    model: 'A standing fan with its own solar panel',
    intro: 'A standing fan that runs from its own small solar panel, joined to the fan by one cable. No socket and no wiring, so it works on a porch, in a yard or wherever the panel can see the sun.',
    points: [
      { title: 'Its own panel', line: 'The small panel stands on a folding stand and plugs into the base of the fan.' },
      { title: 'No socket needed', line: 'Use it where there is no outlet nearby: patios, yards, workshops and building sites.' },
      { title: 'Runs on daylight', line: 'It runs from the panel while the sun is out. Ask whether the model in stock keeps running after dark.' },
      { title: 'Ask before you come', line: STOCK },
    ],
  },
  'portable-power-stations': { panel: 'power-station' },
  generators: { panel: 'generator' },
  bulbs: {
    model: 'Everyday and filament styles',
    intro: 'LED bulbs for every room, from everyday shapes to clear filament globes that look like the old glass bulbs and use far less power.',
    points: [
      { title: 'Warm or clear white', line: 'Warm white for living rooms and bedrooms, clear daylight white for kitchens, offices and shops.' },
      { title: 'Filament styles', line: 'Clear glass globes with LED filaments, for pendants and open fittings where the bulb shows.' },
      { title: 'Everyday shapes', line: 'Standard bulbs for ceiling lights, lamps and fittings around the house.' },
      { title: 'Ask before you come', line: STOCK },
    ],
  },
  'solar-street-lamps': {
    model: 'All-in-one, with the solar panel built in',
    intro: 'All-in-one lamps with the solar panel built in, for streets, yards and parking.',
    points: [
      { title: 'The panel is on the lamp', line: 'The solar panel sits on top of the lamp head, so there is no separate panel to mount.' },
      { title: 'No cable to run', line: 'It needs no wiring to the grid, so it can light a driveway, a yard or a parking area far from a socket.' },
      { title: 'Mounts on a pole or a wall', line: 'A bracket at the back fits it to a pole or a wall.' },
      { title: 'Ask for the right size', line: 'Brightness and mounting differ by model, so ask which ones are in stock.' },
    ],
  },
  'ceiling-lights': {
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
    model: 'For yards and storefronts',
    intro: 'Bright, wide light for yards, storefronts, signs and parking, on a bracket you can angle where you need it.',
    points: [
      { title: 'Angle it where you need it', line: 'The bracket tilts, so the light falls on the yard, the sign or the door.' },
      { title: 'Made for outdoors', line: 'A sealed glass face, and a finned back that carries the heat away.' },
      { title: 'Ask about wattage', line: 'Wattages and light colours change with stock, so ask which ones are on the shelf.' },
    ],
  },
  'led-strips': {
    model: 'Flexible strip light',
    intro: 'Flexible LED strip that follows a shelf, a counter, a ceiling edge or a staircase, in warm to daylight white.',
    points: [
      { title: 'Light without a fitting', line: 'Tuck it under cabinets, along a shelf or behind a TV for soft light with no lamp in sight.' },
      { title: 'Warm or daylight white', line: 'Choose the white that suits the room, from warm to daylight.' },
      { title: 'Tell us where it goes', line: 'Lengths and power supplies differ, so tell us where it goes and we will show you what is in stock.' },
    ],
  },
  'home-cameras': { panel: 'cameras', title: 'Solar security cameras', model: 'For homes and yards' },
  'site-cameras': { panel: 'cameras', title: 'Solar security cameras', model: 'For sites and farms' },
  sofas: { panel: 'furniture', title: 'Sofas', model: 'One floor up, Cumana 73' },
  'lounge-chairs': { panel: 'furniture', title: 'Lounge chairs', model: 'One floor up, Cumana 73' },
};
