// The words round 54 adds to the site, in one place so the dictionaries can be checked against them (round54.test).
// Strings with {0} holes are translator patterns (lib/i18n), the rest are plain strings.
import { BUSINESS_DISCOUNT, BUSINESS_GOAL, REWARD_STEP_AFL, formatAfl, formatPoints } from './loyalty.ts';

export const FIRST_VIEW = {
  title: ['Aruba sunlight,', 'made useful.'],
  lead: 'Solar, backup power, lighting, cooling, security cameras and furniture, from one family-owned store in Oranjestad.',
  primary: 'Visit the store',
  secondary: 'See what we sell',
};

export const FACT_LABELS = ['Hours', 'The store', 'What we sell', 'Jontai Rewards'];
export const FACT_STORE = { strong: 'Cumana 73', rest: ', Oranjestad' };
export const FACT_RANGES = { strong: '6+ ranges', rest: ', one store' };

/**
 * Our solution (Bob picked the simple cards of direction C, then "Line on top, 3 x 2 grid"): one line across the top,
 * in fragments with its promise marked as the key (bold green), set on two lines (newLine), and six simple cards under
 * it. The full stop ends the green phrase, so in Chinese it never starts a line on its own.
 */
export const SOLUTION: { text: string; key?: true; newLine?: true }[] = [
  { text: 'Your home makes' },
  { text: 'its own power.', key: true },
  { text: 'We stand behind it.', newLine: true },
];

/** Whether a fragment of the sentence follows the one before it with a space (not before , or .). */
export const spaceBefore = (text: string) => !/^[,.]/.test(text);

/** The fragments as the page sets them: each carries the space before it, so no space stands in a node of its own
 *  (the translator leaves such a node alone, and in Chinese it would show between the characters). */
export const solutionPieces = () => SOLUTION.map((f, i) => ({ ...f, text: (i && spaceBefore(f.text) ? ' ' : '') + f.text }));

/** The sentence as one line of text. */
export const solutionText = () => SOLUTION.map((f, i) => (i && spaceBefore(f.text) ? ' ' : '') + f.text).join('');

export const SOLUTION_KICKER = 'Our solution';
export const SOLUTION_SUB = 'Six promises from one family-owned store at Cumana 73, Oranjestad.';
/** The six promises, each a card: the promise and one plain line (the lines keep to what the old sentence said). */
export const SOLUTION_CARDS: { title: string; line: string }[] = [
  { title: 'Your own power', line: "Your home makes its own power, so the island's blackouts do not stop your day." },
  { title: 'We fix what we sell', line: 'Even years after you bought it.' },
  { title: 'Prices hard to beat', line: 'For the same quality or better.' },
  { title: 'More than solar', line: 'Solar, LED lighting, cooling, backup power, cameras and furniture, in one store.' },
  { title: 'Every customer matters', line: 'Long after the sale, a person answers.' },
  { title: 'Always learning', line: "Our family keeps learning, to bring tomorrow's ideas home." },
];

export const WHEEL_COPY = {
  // Six ranges and Others (Bob: "maybe 6+ ranges isntead of just 6 ranges").
  title: ['6+ ranges.', 'One store.'],
  line: 'Every range, one at a time. Keep scrolling to go through them.',
  see: 'See all {0} products',
  seeOthers: 'See all other products',
  delivery: 'How delivery works',
  end: ['Every product,', 'one by one.'],
  endButton: 'See all products',
  askUs: 'Ask us',
  pictures: 'Pictures are illustrations, not specific stock.',
};

// Round 54, view only (Bob: "i want them to not be like a site that you can shop but only to view"): no search, no
// counts, no quote; a product opens its short info (INFO_COPY).
export const CATALOG_COPY = {
  title: ['All', 'products'],
  line: 'Everything on the shelf at Cumana 73, one by one. Pick one to read what it is.',
  others: 'Others',
  all: 'All',
  othersLine: 'Smaller things we sell, and anything else you ask us for.',
};

/** The short info a product opens on the All products page (round 54). */
export const INFO_COPY = {
  close: 'Close',
  prev: 'Previous product',
  next: 'Next product',
  ask: 'Ask us about it',
};

/** The menu (lib/menu): its four places, its two small groups and their links. */
export const MENU_COPY = {
  products: 'All products',
  solution: 'Our solution',
  sell: 'What we sell',
  rewards: 'Rewards',
  visit: 'Visit the store',
  ranges: 'Ranges',
  help: 'Help',
  support: 'Support',
  message: 'Send a message',
  directions: 'Get directions',
};

/** The open-now line in two parts for the first view's Hours fact (lib/firstView hoursFact): the state, then the time. */
export const HOURS_COPY = {
  open: 'Open now',
  closed: 'Closed now',
  until: ', until {0}',
  opensAt: ', opens at {0}',
  opensTomorrow: ', opens tomorrow at {0}',
};

/** Rewards, laid out calmer (round 54): a plan's figure is its number in bold, then "back" or "off". */
export const REWARDS_COPY = {
  homeLine: `For every ${formatAfl(REWARD_STEP_AFL)} you spend, a voucher to spend on anything in the store.`,
  businessLine: `Reach ${formatPoints(BUSINESS_GOAL)} and everything is ${BUSINESS_DISCOUNT}% off until the account's anniversary.`,
  back: 'back',
  off: 'off',
};
